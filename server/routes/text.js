const express = require('express');
const router = express.Router();
const doubaoService = require('../services/doubaoService');

// 文本分割接口
router.post('/segment', async (req, res) => {
  try {
    const { text, segmentCount = 3, customPrompt } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '文本内容不能为空'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: '文本长度不能超过5000字符'
      });
    }

    const result = await doubaoService.segmentText(text, segmentCount, customPrompt);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Text segmentation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取分割预览
router.post('/preview-segment', async (req, res) => {
  try {
    const { text, segmentCount = 3 } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '文本内容不能为空'
      });
    }

    // 简单的预览分割，不调用AI
    const words = text.split('');
    const segmentLength = Math.ceil(words.length / segmentCount);
    const segments = [];

    for (let i = 0; i < segmentCount; i++) {
      const start = i * segmentLength;
      const end = Math.min(start + segmentLength, words.length);
      const segment = words.slice(start, end).join('');
      if (segment.trim()) {
        segments.push(segment.trim());
      }
    }

    res.json({
      success: true,
      data: {
        segments,
        originalText: text,
        isPreview: true
      }
    });
  } catch (error) {
    console.error('Preview segmentation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 验证文本内容
router.post('/validate', (req, res) => {
  try {
    const { text } = req.body;
    const issues = [];

    if (!text || text.trim().length === 0) {
      issues.push('文本内容不能为空');
    } else {
      if (text.length < 10) {
        issues.push('文本内容过短，建议至少10个字符');
      }
      if (text.length > 5000) {
        issues.push('文本内容过长，请控制在5000字符以内');
      }
    }

    res.json({
      success: true,
      valid: issues.length === 0,
      issues,
      stats: {
        length: text ? text.length : 0,
        words: text ? text.split(/\s+/).length : 0
      }
    });
  } catch (error) {
    console.error('Text validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 文本优化接口
router.post('/optimize', async (req, res) => {
  try {
    const { text, optimizationType = 'general' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '文本内容不能为空'
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({
        success: false,
        error: '单段文本长度不能超过1000字符'
      });
    }

    const result = await doubaoService.optimizeText(text, optimizationType);
    
    res.json({
      success: true,
      data: {
        originalText: text,
        optimizedText: result,
        optimizationType
      }
    });
  } catch (error) {
    console.error('Text optimization error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '文本优化失败，请稍后重试'
    });
  }
});

module.exports = router;