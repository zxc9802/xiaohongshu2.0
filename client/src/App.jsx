import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import InputPanel from './components/InputPanel';
import ContentEditor from './components/ContentEditor';
import PreviewPanel from './components/PreviewPanel';
import ProgressBar from './components/ProgressBar';
import HelpModal from './components/HelpModal';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [text, setText] = useState('');
  const [segments, setSegments] = useState([]);
  const [segmentTypes, setSegmentTypes] = useState([]);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('xiaohongshu-classic');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [progress, setProgress] = useState({ phase: '', progress: 0, message: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [wordCount, setWordCount] = useState(300);
  const [keepLogical, setKeepLogical] = useState(true);

  useEffect(() => {
    // 初始化Socket连接
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // 监听批量图片生成结果
    newSocket.on('images-generated', (data) => {
      console.log('收到图片生成结果:', data);
      
      if (data.success) {
        setGeneratedImages(data.results);
        setIsGenerating(false);
        alert('图片生成成功！');
      } else {
        console.error('图片生成失败:', data.error);
        setIsGenerating(false);
        alert('图片生成失败: ' + data.error);
      }
    });

    // 监听文本分割结果
    newSocket.on('text-segmented', (data) => {
      setIsSegmenting(false);
      if (data.success) {
        setSegments(data.segments);
        setSegmentTypes(data.segmentTypes || []);
      } else {
        alert('文本分割失败: ' + data.error);
      }
    });

    // 监听进度更新
    newSocket.on('progress', (data) => {
      console.log('生成进度:', data);
      setProgress(data);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleTextSegment = () => {
    if (!text.trim()) {
      alert('请输入文本内容');
      return;
    }

    setIsSegmenting(true);
    const taskId = Date.now().toString();
    socket.emit('segment-text', {
      text,
      segmentCount: Math.ceil(text.length / wordCount),
      keepLogical,
      taskId
    });
  };

  const handleGenerateImages = (style = 'modern', removeWatermark = false) => {
    if (segments.length === 0) {
      alert('请先分割文本');
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    setProgress({ phase: '准备生成图片', progress: 0, message: '正在初始化...' });
    const taskId = Date.now().toString();
    
    socket.emit('generate-images', {
      segments: segments,
      template: selectedTemplate,
      style,
      removeWatermark,
      taskId
    });
  };

  const handleSegmentEdit = (index, newText) => {
    const newSegments = [...segments];
    newSegments[index] = newText;
    setSegments(newSegments);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>小红书图文生成器</h1>
          <button 
            className="btn btn-help"
            onClick={() => setShowHelp(true)}
            title="使用帮助"
          >
            ❓ 帮助
          </button>
        </div>
      </header>

      {progress.progress > 0 && (
        <ProgressBar 
          progress={progress.progress}
          message={progress.message}
          phase={progress.phase}
        />
      )}

      <div className="app-body">
        <div className="left-panel">
          <InputPanel 
            text={text}
            onTextChange={setText}
            onSegment={handleTextSegment}
            isSegmenting={isSegmenting}
            wordCount={wordCount}
            onWordCountChange={setWordCount}
            keepLogical={keepLogical}
            onKeepLogicalChange={setKeepLogical}
          />
        </div>

        <div className="center-panel">
          <ContentEditor 
            segments={segments}
            segmentTypes={segmentTypes}
            onSegmentEdit={handleSegmentEdit}
            activeCardIndex={activeCardIndex}
            onActiveCardChange={setActiveCardIndex}
          />
        </div>

        <div className="right-panel">
          <PreviewPanel 
            segments={segments}
            activeCardIndex={activeCardIndex}
            onGenerateImages={handleGenerateImages}
            generatedImages={generatedImages}
            isGenerating={isGenerating}
            progress={progress.message}
            socket={socket}
            setIsGenerating={setIsGenerating}
          />
        </div>
      </div>

      <HelpModal 
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}

export default App;