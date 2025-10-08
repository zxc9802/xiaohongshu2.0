import React, { useState } from 'react';
import './ContentEditor.css';

const ContentEditor = ({ segments, segmentTypes, onSegmentEdit, activeCardIndex, onActiveCardChange }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const getSegmentLabel = (index) => {
    if (!segmentTypes || !segmentTypes[index]) {
      return `${String(index + 1).padStart(2, '0')}`;
    }
    
    if (segmentTypes[index] === 'cover') {
      return '封面';
    } else if (segmentTypes[index] === 'content') {
      const contentIndex = segmentTypes.slice(0, index + 1).filter(type => type === 'content').length;
      return `${String(contentIndex).padStart(2, '0')}`;
    }
    
    return `${String(index + 1).padStart(2, '0')}`;
  };

  const getWordCount = (text) => {
    return text.length;
  };

  const handleCardClick = (index) => {
    onActiveCardChange(index);
  };

  const handleTextEdit = (index, newText) => {
    onSegmentEdit(index, newText);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    // 重新排序逻辑可以在这里实现
    setDraggedIndex(null);
  };

  const handleAIOptimize = async (index) => {
    // AI优化功能 - 调用AI服务优化文本内容
    console.log('AI优化卡片:', index);
    
    const currentText = segments[index];
    if (!currentText || !currentText.trim()) {
      alert('该卡片内容为空，无法优化');
      return;
    }

    // 显示优化选项对话框
    const optimizationType = await showOptimizationDialog();
    if (!optimizationType) {
      return; // 用户取消了操作
    }

    try {
      // 显示加载状态
      const loadingToast = showToast('正在AI优化中...', 'info');
      
      const response = await fetch('/api/text/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: currentText,
          optimizationType: optimizationType
        })
      });

      const result = await response.json();
      
      // 移除加载提示
      if (loadingToast && document.body.contains(loadingToast)) {
        document.body.removeChild(loadingToast);
      }

      if (result.success) {
        // 显示优化结果对话框，让用户选择是否应用
        const shouldApply = await showOptimizationResult(
          currentText, 
          result.data.optimizedText
        );
        
        if (shouldApply) {
          handleTextEdit(index, result.data.optimizedText);
          showToast('AI优化完成！', 'success');
        }
      } else {
        throw new Error(result.error || 'AI优化失败');
      }
    } catch (error) {
      console.error('AI优化错误:', error);
      showToast(`AI优化失败: ${error.message}`, 'error');
    }
  };

  // 显示优化类型选择对话框
  const showOptimizationDialog = () => {
    return new Promise((resolve) => {
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      `;
      
      dialog.innerHTML = `
        <div style="
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          max-width: 400px;
          width: 90%;
        ">
          <h3 style="margin: 0 0 20px 0; color: #333; text-align: center;">选择优化类型</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button class="opt-btn" data-type="general" style="
              padding: 12px 20px;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              background: white;
              cursor: pointer;
              transition: all 0.2s;
            ">
              <strong>🎯 通用优化</strong><br>
              <small style="color: #666;">提升可读性和吸引力</small>
            </button>
            <button class="opt-btn" data-type="engaging" style="
              padding: 12px 20px;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              background: white;
              cursor: pointer;
              transition: all 0.2s;
            ">
              <strong>🔥 互动优化</strong><br>
              <small style="color: #666;">增强互动性和情感色彩</small>
            </button>
            <button class="opt-btn" data-type="professional" style="
              padding: 12px 20px;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              background: white;
              cursor: pointer;
              transition: all 0.2s;
            ">
              <strong>💼 专业优化</strong><br>
              <small style="color: #666;">提升专业性和说服力</small>
            </button>
            <button class="opt-btn" data-type="casual" style="
              padding: 12px 20px;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              background: white;
              cursor: pointer;
              transition: all 0.2s;
            ">
              <strong>😊 轻松优化</strong><br>
              <small style="color: #666;">更亲和随意的表达</small>
            </button>
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <button id="cancel-opt" style="
              padding: 8px 20px;
              border: 1px solid #ccc;
              border-radius: 6px;
              background: white;
              cursor: pointer;
              color: #666;
            ">取消</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(dialog);
      
      // 添加按钮悬停效果
      const buttons = dialog.querySelectorAll('.opt-btn');
      buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.style.borderColor = '#ff6b6b';
          btn.style.background = '#fff5f5';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.borderColor = '#e0e0e0';
          btn.style.background = 'white';
        });
        btn.addEventListener('click', () => {
          const type = btn.getAttribute('data-type');
          document.body.removeChild(dialog);
          resolve(type);
        });
      });
      
      // 取消按钮
      dialog.querySelector('#cancel-opt').addEventListener('click', () => {
        document.body.removeChild(dialog);
        resolve(null);
      });
      
      // 点击背景关闭
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          document.body.removeChild(dialog);
          resolve(null);
        }
      });
    });
  };

  // 显示优化结果对比对话框
  const showOptimizationResult = (originalText, optimizedText) => {
    return new Promise((resolve) => {
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 20px;
      `;
      
      dialog.innerHTML = `
        <div style="
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          max-width: 800px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        ">
          <h3 style="margin: 0 0 20px 0; color: #333; text-align: center;">AI优化结果</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <h4 style="color: #666; margin: 0 0 10px 0;">原文本</h4>
              <div style="
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 15px;
                background: #f9f9f9;
                min-height: 120px;
                font-size: 14px;
                line-height: 1.5;
              ">${originalText}</div>
            </div>
            
            <div>
              <h4 style="color: #ff6b6b; margin: 0 0 10px 0;">优化后</h4>
              <div style="
                border: 1px solid #ff6b6b;
                border-radius: 8px;
                padding: 15px;
                background: #fff5f5;
                min-height: 120px;
                font-size: 14px;
                line-height: 1.5;
              ">${optimizedText}</div>
            </div>
          </div>
          
          <div style="text-align: center; display: flex; gap: 15px; justify-content: center;">
            <button id="apply-opt" style="
              padding: 12px 30px;
              border: none;
              border-radius: 8px;
              background: #ff6b6b;
              color: white;
              cursor: pointer;
              font-size: 16px;
              font-weight: bold;
            ">应用优化</button>
            <button id="reject-opt" style="
              padding: 12px 30px;
              border: 1px solid #ccc;
              border-radius: 8px;
              background: white;
              color: #666;
              cursor: pointer;
              font-size: 16px;
            ">保持原文</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(dialog);
      
      // 应用优化
      dialog.querySelector('#apply-opt').addEventListener('click', () => {
        document.body.removeChild(dialog);
        resolve(true);
      });
      
      // 拒绝优化
      dialog.querySelector('#reject-opt').addEventListener('click', () => {
        document.body.removeChild(dialog);
        resolve(false);
      });
      
      // 点击背景关闭
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          document.body.removeChild(dialog);
          resolve(false);
        }
      });
    });
  };

  // 显示提示消息
  const showToast = (message, type = 'info') => {
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
    
    return toast;
  };

  const handleAddTopic = (index) => {
    // 添加话题功能
    const currentText = segments[index];
    const newText = currentText + ' #话题';
    handleTextEdit(index, newText);
  };

  const handleFormatBold = (index) => {
    // 格式刷功能 - 应用格式化样式
    console.log('格式刷卡片:', index);
    
    const currentText = segments[index];
    if (!currentText || !currentText.trim()) {
      alert('该卡片内容为空，无法格式化');
      return;
    }
    
    // 简单的格式化处理 - 添加一些小红书常用的格式
    let formattedText = currentText;
    
    // 如果文本没有表情符号，添加一些
    if (!/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(formattedText)) {
      formattedText = '✨ ' + formattedText + ' ✨';
    }
    
    // 如果没有换行，适当添加换行提高可读性
    if (!formattedText.includes('\n') && formattedText.length > 50) {
      const sentences = formattedText.split(/[。！？]/);
      if (sentences.length > 1) {
        formattedText = sentences.join('。\n').replace(/\n$/, '');
      }
    }
    
    handleTextEdit(index, formattedText);
    alert('格式化完成！');
  };

  return (
    <div className="content-editor">
      <div className="panel-header">
        <h3>内容卡片 (共{segments.length}篇)</h3>
      </div>
      
      <div className="panel-content">
        <div className="cards-container">
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`content-card ${activeCardIndex === index ? 'active' : ''}`}
              onClick={() => handleCardClick(index)}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="card-header">
                <span className="card-number">
                  {getSegmentLabel(index)}
                </span>
                <span className="card-word-count">
                  ({getWordCount(segment)}字)
                </span>
              </div>
              
              <div className="card-content">
                <div
                  className="editable-content"
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleTextEdit(index, e.target.textContent)}
                  dangerouslySetInnerHTML={{ __html: segment }}
                />
              </div>
              
              <div className="card-toolbar">
                <button 
                  className="tool-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAIOptimize(index);
                  }}
                  title="AI优化"
                >
                  <span className="icon">🔗</span>
                  <span>AI优化</span>
                </button>
                
                <button 
                  className="tool-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTopic(index);
                  }}
                  title="添加话题"
                >
                  <span className="icon">#</span>
                  <span>话题</span>
                </button>
                
                <button 
                  className="tool-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFormatBold(index);
                  }}
                  title="格式刷"
                >
                  <span className="icon">B</span>
                  <span>格式</span>
                </button>
              </div>
            </div>
          ))}
          
          {segments.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>还没有内容卡片</p>
              <p className="empty-hint">请先在左侧输入文本并点击"一键切割"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;