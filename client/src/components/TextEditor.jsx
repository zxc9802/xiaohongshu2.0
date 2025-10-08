import React from 'react';
import { Edit3, Type, Scissors } from 'lucide-react';
import './TextEditor.css';

const TextEditor = ({ text, onTextChange, segments, segmentTypes = [], onSegmentEdit }) => {
  const getSegmentLabel = (index) => {
    const type = segmentTypes[index];
    if (type === 'cover') {
      return '封面';
    } else if (type === 'content') {
      return `正文${index}`;
    } else {
      return `段落 ${index + 1}`;
    }
  };
  return (
    <div className="text-editor">
      <div className="panel-header">
        <h3>
          <Type size={18} />
          文本编辑区
        </h3>
      </div>
      
      <div className="panel-content">
        <div className="input-section">
          <label className="input-label">
            <Edit3 size={16} />
            原始文本
          </label>
          <textarea
            className="text-input"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="请输入要生成图片的文本内容..."
            rows={8}
          />
          <div className="text-stats">
            字符数: {text.length} / 5000
          </div>
        </div>

        {segments.length > 0 && (
          <div className="segments-section">
            <label className="input-label">
              <Scissors size={16} />
              分割结果 ({segments.length}段)
            </label>
            <div className="segments-list">
              {segments.map((segment, index) => (
                <div key={index} className="segment-item">
                  <div className="segment-header">
                    <span className="segment-number">{getSegmentLabel(index)}</span>
                    <span className="segment-length">{segment.length}字</span>
                  </div>
                  <textarea
                    className="segment-input"
                    value={segment}
                    onChange={(e) => onSegmentEdit(index, e.target.value)}
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextEditor;