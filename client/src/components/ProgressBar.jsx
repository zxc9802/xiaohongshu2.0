import React from 'react';
import { CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import './ProgressBar.css';

const ProgressBar = ({ 
  isVisible, 
  progress, 
  currentTask, 
  totalTasks, 
  status, 
  onCancel 
}) => {
  if (!isVisible) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="status-icon success" />;
      case 'error':
        return <AlertCircle size={16} className="status-icon error" />;
      case 'processing':
      default:
        return <Clock size={16} className="status-icon processing" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return '生成完成';
      case 'error':
        return '生成失败';
      case 'processing':
      default:
        return `正在处理第 ${currentTask} / ${totalTasks} 个段落`;
    }
  };

  return (
    <div className="progress-overlay">
      <div className="progress-container">
        <div className="progress-header">
          <div className="progress-info">
            {getStatusIcon()}
            <span className="progress-text">{getStatusText()}</span>
          </div>
          {status === 'processing' && onCancel && (
            <button 
              className="cancel-btn"
              onClick={onCancel}
              title="取消生成"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="progress-bar-container">
          <div 
            className={`progress-bar ${status}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="progress-details">
          <span className="progress-percentage">{Math.round(progress)}%</span>
          {totalTasks > 0 && (
            <span className="progress-count">
              {currentTask} / {totalTasks}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;