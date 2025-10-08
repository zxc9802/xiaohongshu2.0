import React, { useState, useEffect } from 'react';
import { Palette, Settings, Image } from 'lucide-react';
import './TemplatePanel.css';

const TemplatePanel = ({ selectedTemplate, onTemplateChange }) => {
  const [templates, setTemplates] = useState([]);
  const [imageSize, setImageSize] = useState('2K');
  const [watermark, setWatermark] = useState(true);

  useEffect(() => {
    // 模拟获取模板列表
    const mockTemplates = [
      {
        id: 'default',
        name: '自然风格',
        description: '自然色彩，平衡构图，真实质感',
        preview: '/templates/default.svg',
        settings: {
          templateStyle: 'default',
          style: 'natural and balanced',
          colors: 'natural tones',
          layout: 'balanced'
        }
      },
      {
        id: 'minimalist',
        name: '极简风格',
        description: '极简设计，留白美学，简洁构图',
        preview: '/templates/minimalist.svg',
        settings: {
          templateStyle: 'minimalist',
          style: 'clean and minimal',
          colors: 'monochrome',
          layout: 'centered'
        }
      },
      {
        id: 'vintage',
        name: '复古风格',
        description: '复古滤镜，暖色调，胶片质感',
        preview: '/templates/vintage.svg',
        settings: {
          templateStyle: 'vintage',
          style: 'retro and warm',
          colors: 'warm vintage',
          layout: 'classic'
        }
      },
      {
        id: 'bright',
        name: '明亮风格',
        description: '明亮色彩，高饱和度，活力四射',
        preview: '/templates/bright.svg',
        settings: {
          templateStyle: 'bright',
          style: 'vibrant and energetic',
          colors: 'bright and saturated',
          layout: 'dynamic'
        }
      },
      {
        id: 'soft',
        name: '柔和风格',
        description: '柔和色调，温暖光线，治愈系',
        preview: '/templates/soft.svg',
        settings: {
          templateStyle: 'soft',
          style: 'soft and healing',
          colors: 'soft pastels',
          layout: 'gentle'
        }
      }
    ];
    setTemplates(mockTemplates);
  }, []);

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="template-panel">
      <div className="panel-header">
        <h3>
          <Palette size={18} />
          模板设置
        </h3>
      </div>
      
      <div className="panel-content">
        <div className="template-section">
          <label className="section-label">
            <Image size={16} />
            选择模板
          </label>
          <div className="template-list">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`template-item ${selectedTemplate === template.id ? 'selected' : ''}`}
                onClick={() => onTemplateChange(template.id)}
              >
                <div className="template-preview">
                  <div className="template-placeholder">
                    {template.name.charAt(0)}
                  </div>
                </div>
                <div className="template-info">
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedTemplateData && (
          <div className="template-details">
            <h4>当前模板: {selectedTemplateData.name}</h4>
            <div className="template-settings">
              <div className="setting-item">
                <span>风格:</span>
                <span>{selectedTemplateData.settings.style}</span>
              </div>
              <div className="setting-item">
                <span>色彩:</span>
                <span>{selectedTemplateData.settings.colors}</span>
              </div>
              <div className="setting-item">
                <span>布局:</span>
                <span>{selectedTemplateData.settings.layout}</span>
              </div>
            </div>
          </div>
        )}

        <div className="image-settings">
          <label className="section-label">
            <Settings size={16} />
            图片设置
          </label>
          
          <div className="setting-group">
            <label className="setting-label">图片尺寸</label>
            <select 
              className="setting-select"
              value={imageSize}
              onChange={(e) => setImageSize(e.target.value)}
            >
              <option value="1K">1K (1024x1024)</option>
              <option value="2K">2K (2048x2048)</option>
              <option value="4K">4K (4096x4096)</option>
            </select>
          </div>

          <div className="setting-group">
            <label className="setting-checkbox">
              <input
                type="checkbox"
                checked={watermark}
                onChange={(e) => setWatermark(e.target.checked)}
              />
              <span className="checkmark"></span>
              添加水印
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePanel;