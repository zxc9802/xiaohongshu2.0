import React, { useState } from 'react';
import './InputPanel.css';

const InputPanel = ({ text, onTextChange, onSegment, isSegmenting }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wordCount, setWordCount] = useState(200);
  const [keepLogic, setKeepLogic] = useState(true);

  const handleTextChange = (e) => {
    onTextChange(e.target.value);
  };

  const handleSegment = () => {
    onSegment({
      text,
      wordCount,
      keepLogic
    });
  };

  const getCharCount = () => {
    return text.length;
  };

  return (
    <div className="input-panel">
      <div className="panel-header">
        <h3>输入原文</h3>
      </div>
      
      <div className="panel-content">
        <div className="textarea-container">
          <textarea
            className="main-textarea"
            value={text}
            onChange={handleTextChange}
            placeholder="请输入你想要制作成小红书图片的内容..."
            disabled={isSegmenting}
          />
          <div className="char-count">
            {getCharCount()} 字
          </div>
        </div>

        <button 
          className="segment-btn"
          onClick={handleSegment}
          disabled={!text.trim() || isSegmenting}
        >
          {isSegmenting ? '切割中...' : '一键切割'}
        </button>

        <div className="advanced-settings">
          <div 
            className="advanced-header"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span>切割设置</span>
            <span className={`arrow ${showAdvanced ? 'expanded' : ''}`}>▼</span>
          </div>
          
          {showAdvanced && (
            <div className="advanced-content">
              <div className="setting-item">
                <label>每篇字数</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="200"
                    max="500"
                    value={wordCount}
                    onChange={(e) => setWordCount(parseInt(e.target.value))}
                    className="word-count-slider"
                  />
                  <span className="slider-value">{wordCount}字</span>
                </div>
              </div>
              
              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={keepLogic}
                    onChange={(e) => setKeepLogic(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  保持逻辑连贯
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputPanel;