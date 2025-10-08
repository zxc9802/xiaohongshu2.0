import React from 'react';
import './HelpModal.css';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2>🎯 使用帮助</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="help-modal-content">
          <div className="help-section">
            <h3>📝 第一步：输入文本</h3>
            <p>在左侧的文本框中输入你想要制作成小红书图片的内容。可以是：</p>
            <ul>
              <li>产品介绍文案</li>
              <li>生活分享内容</li>
              <li>教程说明</li>
              <li>任何你想分享的文字内容</li>
            </ul>
          </div>

          <div className="help-section">
            <h3>✂️ 第二步：分割文本</h3>
            <p>点击"分割文本"按钮，AI会智能地将你的文本分割成适合制作图片的段落：</p>
            <ul>
              <li><strong>封面</strong>：作为主标题的吸引人内容</li>
              <li><strong>正文</strong>：详细的内容段落</li>
              <li>你可以手动编辑每个段落的内容</li>
            </ul>
          </div>

          <div className="help-section">
            <h3>🎨 第三步：选择模板和风格</h3>
            <p>在中间面板选择你喜欢的小红书风格模板和图片风格：</p>
            <ul>
              <li><strong>模板选择</strong>：经典、时尚、温馨、商务等多种风格</li>
              <li><strong>图片风格</strong>：摄影风、插画风、简约风等</li>
              <li><strong>去水印选项</strong>：可选择是否移除图片水印</li>
              <li>不同组合适合不同类型的内容，可以多试几种</li>
            </ul>
          </div>

          <div className="help-section">
            <h3>🖼️ 第四步：生成图片</h3>
            <p>点击"生成图片"按钮，AI会为每个段落生成精美的小红书风格图片：</p>
            <ul>
              <li>封面图片会突出主题，吸引眼球</li>
              <li>正文图片会配合文字内容，增强表达</li>
              <li>所有图片都符合小红书的视觉风格</li>
              <li>生成完成后可以预览、单独下载或批量下载</li>
            </ul>
          </div>

          <div className="help-section">
            <h3>📥 第五步：下载图片</h3>
            <p>图片生成完成后，你可以：</p>
            <ul>
              <li><strong>单张下载</strong>：点击图片下方的下载按钮</li>
              <li><strong>批量下载</strong>：点击"批量下载"按钮一次性下载所有图片</li>
              <li><strong>智能命名</strong>：文件会自动命名为"小红书图片_封面.png"、"小红书图片_正文1.png"等</li>
              <li><strong>即时下载</strong>：无需等待确认，点击后立即开始下载</li>
            </ul>
          </div>

          <div className="help-section">
            <h3>💡 使用技巧</h3>
            <ul>
              <li>文本内容建议控制在200-500字之间效果最佳</li>
              <li>可以使用表情符号让内容更生动</li>
              <li>分割后的段落可以手动调整和编辑</li>
              <li>尝试不同的模板和风格组合，找到最适合的效果</li>
              <li>批量下载功能可以快速保存所有图片，提高效率</li>
              <li>生成过程中请耐心等待，AI正在为你精心制作</li>
            </ul>
          </div>

          <div className="help-section">
            <h3>❓ 常见问题</h3>
            <div className="faq-item">
              <strong>Q: 为什么文本分割失败？</strong>
              <p>A: 请确保输入的文本内容足够丰富，至少包含50个字符以上。</p>
            </div>
            <div className="faq-item">
              <strong>Q: 图片生成需要多长时间？</strong>
              <p>A: 通常需要30秒到2分钟，具体时间取决于内容复杂度和服务器负载。</p>
            </div>
            <div className="faq-item">
              <strong>Q: 可以生成多少张图片？</strong>
              <p>A: 根据你分割的段落数量，通常可以生成3-8张图片。</p>
            </div>
            <div className="faq-item">
              <strong>Q: 批量下载为什么没有反应？</strong>
              <p>A: 现在的批量下载是即时开始的，请查看浏览器的下载文件夹，或注意右上角的提示信息。</p>
            </div>
            <div className="faq-item">
              <strong>Q: 下载的图片文件名是什么格式？</strong>
              <p>A: 文件会自动命名为"小红书图片_封面.png"、"小红书图片_正文1.png"等，方便识别和整理。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;