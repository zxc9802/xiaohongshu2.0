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

  const handleAIOptimize = (index) => {
    // AI优化功能 - 调用AI服务优化文本内容
    console.log('AI优化卡片:', index);
    
    const currentText = segments[index];
    if (!currentText || !currentText.trim()) {
      alert('该卡片内容为空，无法优化');
      return;
    }
    
    // 这里可以添加AI优化的具体逻辑
    // 例如调用AI服务来优化文本
    alert('AI优化功能开发中，敬请期待！');
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