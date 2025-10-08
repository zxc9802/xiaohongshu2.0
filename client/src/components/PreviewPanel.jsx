import React, { useState } from 'react';
import './PreviewPanel.css';

const PreviewPanel = ({ 
  segments, 
  activeCardIndex, 
  onGenerateImages, 
  generatedImages, 
  isGenerating, 
  progress,
  socket,
  setIsGenerating
}) => {
  const [selectedStyle, setSelectedStyle] = useState('简约风');
  const [applyToAll, setApplyToAll] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [removeWatermark, setRemoveWatermark] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('xiaohongshu-classic');

  const imageStyles = [
    { id: 'simple', name: '简约风', icon: '🎨' },
    { id: 'cute', name: '可爱风', icon: '🌸' },
    { id: 'business', name: '商务风', icon: '💼' },
    { id: 'festival', name: '节日风', icon: '🎉' }
  ];

  const handleStyleSelect = (styleName) => {
    setSelectedStyle(styleName);
  };

  const handleGenerateClick = () => {
    onGenerateImages(selectedStyle, removeWatermark);
  };

  const handleDownloadSingle = async () => {
    const currentImage = getCurrentImage();
    if (!currentImage) {
      alert('没有可下载的图片');
      return;
    }

    try {
      if (currentImage.startsWith('data:')) {
        // Base64 图片直接下载
        const link = document.createElement('a');
        link.href = currentImage;
        link.download = `小红书图片_${activeCardIndex + 1}_${currentImageIndex + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // URL 图片需要先获取
        try {
          const response = await fetch(currentImage, {
            mode: 'cors',
            headers: {
              'Accept': 'image/*'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `小红书图片_${activeCardIndex + 1}_${currentImageIndex + 1}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (fetchError) {
          console.error('获取图片失败:', fetchError);
          // 如果fetch失败，尝试直接打开图片让用户手动保存
          window.open(currentImage, '_blank');
          alert('自动下载失败，已在新窗口打开图片，请右键保存');
        }
      }
    } catch (error) {
      console.error('下载图片失败:', error);
      alert('下载失败: ' + error.message);
    }
  };

  // 批量下载功能 - 完全重写版本
  const handleDownloadAll = async () => {
    if (!generatedImages || generatedImages.length === 0) {
      alert('没有可下载的图片');
      return;
    }

    console.log('=== 开始批量下载调试 ===');
    console.log('generatedImages 完整数据:', JSON.stringify(generatedImages, null, 2));

    // 收集所有有效的图片URL和对应的标签
    const allImages = [];
    
    generatedImages.forEach((cardData, cardIndex) => {
      console.log(`\n--- 处理卡片 ${cardIndex} ---`);
      console.log('卡片数据:', cardData);
      
      // 获取图片类型标签
      const imageLabel = cardIndex === 0 ? '封面' : `正文${cardIndex}`;
      
      if (cardData && cardData.images && Array.isArray(cardData.images)) {
        // 服务器返回格式：{segment, images, index}
        console.log(`卡片 ${cardIndex} 是对象格式，包含 ${cardData.images.length} 张图片`);
        cardData.images.forEach((imageItem, imageIndex) => {
          let imageUrl = null;
          
          if (typeof imageItem === 'string') {
            imageUrl = imageItem;
          } else if (imageItem && imageItem.url) {
            imageUrl = imageItem.url;
          } else if (imageItem && imageItem.b64_json) {
            imageUrl = imageItem.b64_json;
          }
          
          if (imageUrl) {
            // 修复：确保每张图片都有唯一的文件名
            // 使用卡片索引而不是依赖images数组长度
            const filename = `小红书图片_${imageLabel}.png`;
            
            allImages.push({ url: imageUrl, filename });
            console.log(`添加图片: ${filename} -> ${imageUrl.substring(0, 50)}...`);
          }
        });
      } else if (Array.isArray(cardData)) {
        // 旧格式：直接的图片数组
        console.log(`卡片 ${cardIndex} 是数组格式，包含 ${cardData.length} 张图片`);
        cardData.forEach((imageUrl, imageIndex) => {
          if (imageUrl && typeof imageUrl === 'string') {
            // 修复：确保每张图片都有唯一的文件名
            const filename = cardData.length > 1 
              ? `小红书图片_${imageLabel}_${imageIndex + 1}.png`
              : `小红书图片_${imageLabel}.png`;
            
            allImages.push({ url: imageUrl, filename });
            console.log(`添加图片: ${filename} -> ${imageUrl.substring(0, 50)}...`);
          }
        });
      } else if (cardData) {
        // 处理单张图片
        let imageUrl = null;
        if (typeof cardData === 'string') {
          imageUrl = cardData;
        } else if (cardData.url) {
          imageUrl = cardData.url;
        } else if (cardData.b64_json) {
          imageUrl = cardData.b64_json;
        }
        
        if (imageUrl) {
          const filename = `小红书图片_${imageLabel}.png`;
          allImages.push({ url: imageUrl, filename });
          console.log(`添加单张图片: ${filename} -> ${imageUrl.substring(0, 50)}...`);
        }
      }
    });

    console.log(`\n=== 统计结果 ===`);
    console.log(`总共找到 ${allImages.length} 张有效图片`);
    
    if (allImages.length === 0) {
      alert('没有找到可下载的图片');
      return;
    }

    // 创建下载管理器
    const downloadManager = {
      total: allImages.length,
      completed: 0,
      failed: 0,
      
      updateProgress() {
        const progress = Math.round((this.completed + this.failed) / this.total * 100);
        console.log(`下载进度: ${this.completed + this.failed}/${this.total} (${progress}%)`);
      },
      
      async downloadImage(imageUrl, filename) {
        try {
          console.log(`开始下载: ${filename}`);
          console.log(`图片URL类型: ${imageUrl.startsWith('data:') ? 'base64' : 'URL'}`);
          
          let downloadUrl = imageUrl;
          
          // 如果是base64数据，直接使用
          if (imageUrl.startsWith('data:')) {
            downloadUrl = imageUrl;
          } else {
            // 如果是URL，尝试获取图片数据并转换为blob
            try {
              const response = await fetch(imageUrl);
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
              }
              const blob = await response.blob();
              downloadUrl = URL.createObjectURL(blob);
            } catch (fetchError) {
              console.warn(`无法获取图片数据，尝试直接下载: ${fetchError.message}`);
              // 如果fetch失败，仍然尝试直接下载
              downloadUrl = imageUrl;
            }
          }
          
          // 创建一个临时的 a 标签进行下载
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // 如果创建了blob URL，需要释放内存
          if (downloadUrl !== imageUrl && downloadUrl.startsWith('blob:')) {
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
          }
          
          this.completed++;
          this.updateProgress();
          console.log(`✅ 下载成功: ${filename}`);
          return true;
        } catch (error) {
          console.error(`❌ 下载失败 ${filename}:`, error);
          this.failed++;
          this.updateProgress();
          return false;
        }
      }
    };

    // 开始批量下载 - 改为非阻塞式
    console.log(`开始下载 ${allImages.length} 张图片...`);
    
    // 创建非阻塞式的进度提示
    const showToast = (message, type = 'info') => {
      // 创建提示元素
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        font-size: 14px;
        max-width: 300px;
        word-wrap: break-word;
      `;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      // 3秒后自动移除
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 3000);
    };
    
    // 显示开始下载提示
    showToast(`开始下载 ${allImages.length} 张图片...`);
    
    console.log(`\n=== 开始下载 ===`);
    
    // 立即开始下载，不等待用户确认
    (async () => {
      console.log(`开始批量下载 ${allImages.length} 张图片...`);
      
      for (let i = 0; i < allImages.length; i++) {
        const { url, filename } = allImages[i];
        console.log(`\n--- 下载第 ${i + 1}/${allImages.length} 张图片 ---`);
        console.log(`文件名: ${filename}`);
        
        await downloadManager.downloadImage(url, filename);
        
        // 增加下载间隔，避免浏览器限制和CORS问题
        if (i < allImages.length - 1) {
          console.log(`等待 500ms 后继续下载...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // 显示下载完成结果
      console.log(`\n=== 下载完成 ===`);
      console.log(`成功: ${downloadManager.completed} 张`);
      console.log(`失败: ${downloadManager.failed} 张`);
      console.log(`总计: ${downloadManager.total} 张`);
      
      if (downloadManager.failed > 0) {
        showToast(`下载完成！成功 ${downloadManager.completed} 张，失败 ${downloadManager.failed} 张`, 'error');
      } else {
        showToast(`所有 ${downloadManager.completed} 张图片下载成功！`, 'success');
      }
    })();
   };

  const getCurrentSegment = () => {
    if (!segments || segments.length === 0 || activeCardIndex < 0) {
      return '请选择一个内容卡片';
    }
    return segments[activeCardIndex] || '暂无内容';
  };

  const getCurrentImage = () => {
    if (!generatedImages || !generatedImages[activeCardIndex]) {
      return null;
    }
    
    const cardData = generatedImages[activeCardIndex];
    
    // 检查数据结构：如果是服务器返回的格式 {segment, images, index}
    if (cardData && cardData.images && Array.isArray(cardData.images)) {
      const images = cardData.images;
      if (images.length > 0) {
        const image = images[currentImageIndex] || images[0];
        return image.url || image.b64_json || image;
      }
    }
    
    // 兼容旧格式：如果是直接的图片数组
    if (Array.isArray(cardData) && cardData.length > 0) {
      const image = cardData[currentImageIndex] || cardData[0];
      return typeof image === 'string' ? image : (image.url || image.b64_json);
    }
    
    // 如果是单张图片
    if (typeof cardData === 'string') {
      return cardData;
    }
    
    // 如果是图片对象
    if (cardData && (cardData.url || cardData.b64_json)) {
      return cardData.url || cardData.b64_json;
    }
    
    return null;
  };

  const getCurrentCardImages = () => {
    if (!generatedImages || !generatedImages[activeCardIndex]) {
      return [];
    }
    
    const cardData = generatedImages[activeCardIndex];
    
    // 检查数据结构：如果是服务器返回的格式 {segment, images, index}
    if (cardData && cardData.images && Array.isArray(cardData.images)) {
      return cardData.images.filter(img => img && (img.url || img.b64_json || typeof img === 'string'));
    }
    
    // 兼容旧格式：如果是直接的图片数组
    if (Array.isArray(cardData)) {
      return cardData.filter(img => img && (typeof img === 'string' || img.url || img.b64_json));
    }
    
    // 如果是单张图片，返回包含一个元素的数组
    if (typeof cardData === 'string' || (cardData && (cardData.url || cardData.b64_json))) {
      return [cardData];
    }
    
    return [];
  };

  const handleImageNavigation = (direction) => {
    const cardImages = getCurrentCardImages();
    if (cardImages.length <= 1) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex(prev => prev > 0 ? prev - 1 : cardImages.length - 1);
    } else {
      setCurrentImageIndex(prev => prev < cardImages.length - 1 ? prev + 1 : 0);
    }
  };



  // 当切换卡片时重置图片索引
  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeCardIndex]);

  // 打开图片放大预览
  const handleImageClick = (imageUrl) => {
    setModalImageUrl(imageUrl);
    setShowImageModal(true);
  };

  // 关闭图片放大预览
  const handleCloseModal = () => {
    setShowImageModal(false);
    setModalImageUrl('');
  };

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <h3>图片预览</h3>
      </div>
      
      <div className="panel-content">
        {/* 控制器区域 */}
        <div className="controller-section">
          <button 
            className="generate-btn"
            onClick={handleGenerateClick}
            disabled={isGenerating || !segments || segments.length === 0}
          >
            {isGenerating ? '生成中...' : '生成图片'}
          </button>
          
          <div className="style-selector">
            <label>图片风格：</label>
            <div className="style-options">
              {imageStyles.map((style) => (
                <button
                  key={style.id}
                  className={`style-btn ${selectedStyle === style.name ? 'active' : ''}`}
                  onClick={() => handleStyleSelect(style.name)}
                >
                  <span className="style-icon">{style.icon}</span>
                  <span className="style-name">{style.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="apply-all-option">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span>应用到全部</span>
            </label>
          </div>
          
          <div className="watermark-option">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={removeWatermark}
                onChange={(e) => setRemoveWatermark(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span>去除水印</span>
            </label>
          </div>
        </div>
        
        {/* 小红书模拟器 */}
        <div className="xiaohongshu-simulator">
          <div className="phone-frame">
            <div className="phone-screen">
              <div className="post-header">
                <div className="user-info">
                  <div className="avatar">👤</div>
                  <div className="user-details">
                    <div className="username">小红书用户</div>
                    <div className="location">📍 北京</div>
                  </div>
                </div>
                <button className="follow-btn">关注</button>
              </div>
              
              <div className="post-image-area">
                {getCurrentImage() ? (
                  <div className="image-container">
                    <img 
                      src={getCurrentImage()} 
                      alt="生成的图片" 
                      className="post-image"
                      onClick={() => handleImageClick(getCurrentImage())}
                      style={{ cursor: 'pointer' }}
                      title="点击放大查看"
                    />
                    
                    {/* 图片导航控件 */}
                    {getCurrentCardImages().length > 1 && (
                      <div className="image-navigation">
                        <button 
                          className="nav-btn prev-btn"
                          onClick={() => handleImageNavigation('prev')}
                        >
                          ‹
                        </button>
                        <div className="image-indicator">
                          {currentImageIndex + 1} / {getCurrentCardImages().length}
                        </div>
                        <button 
                          className="nav-btn next-btn"
                          onClick={() => handleImageNavigation('next')}
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="image-placeholder">
                    {isGenerating ? (
                      <div className="generating-state">
                        <div className="loading-spinner"></div>
                        <p>正在生成图片...</p>
                        {progress && <p className="progress-text">{progress}</p>}
                      </div>
                    ) : (
                      <div className="empty-image-state">
                        <div className="placeholder-icon">🖼️</div>
                        <p>点击"生成图片"创建内容</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="post-content">
                <div className="post-text">
                  {getCurrentSegment()}
                </div>
              </div>
              
              <div className="post-actions">
                <div className="action-buttons">
                  <button className="action-btn">
                    <span className="action-icon">❤️</span>
                    <span>1.2k</span>
                  </button>
                  <button className="action-btn">
                    <span className="action-icon">💬</span>
                    <span>89</span>
                  </button>
                  <button className="action-btn">
                    <span className="action-icon">⭐</span>
                    <span>收藏</span>
                  </button>
                  <button className="action-btn">
                    <span className="action-icon">📤</span>
                    <span>分享</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部操作栏 */}
        {generatedImages && generatedImages.some(img => img) && (
          <div className="bottom-actions">
            <button 
              className="download-btn secondary"
              onClick={handleDownloadSingle}
              disabled={!getCurrentImage()}
            >
              下载本图
            </button>
            <button 
              className="download-btn secondary"
              onClick={handleDownloadAll}
              disabled={!generatedImages || generatedImages.length === 0 || isGenerating}
            >
              打包下载全部
            </button>
          </div>
        )}
      </div>
      
      {/* 图片放大预览模态框 */}
      {showImageModal && (
        <div className="image-modal-overlay" onClick={handleCloseModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal}>
              ×
            </button>
            <img 
              src={modalImageUrl} 
              alt="放大预览" 
              className="modal-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;