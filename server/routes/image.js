const express = require('express');
const router = express.Router();
const doubaoService = require('../services/doubaoService');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// 单张图片生成接口
router.post('/generate', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '提示词不能为空'
      });
    }

    const result = await doubaoService.generateImage(prompt, options);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 批量图片生成接口
router.post('/generate-batch', async (req, res) => {
  try {
    const { segments, template = 'default' } = req.body;

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return res.status(400).json({
        success: false,
        error: '文本段落不能为空'
      });
    }

    if (segments.length > 10) {
      return res.status(400).json({
        success: false,
        error: '批量生成最多支持10个段落'
      });
    }

    const results = await doubaoService.generateBatchImages(segments, template);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Batch image generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 下载图片到本地
router.post('/download', async (req, res) => {
  try {
    const { imageUrl, filename } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: '图片URL不能为空'
      });
    }

    const response = await axios.get(imageUrl, { responseType: 'stream' });
    const fileExtension = path.extname(imageUrl) || '.jpg';
    const fileName = filename || `image_${uuidv4()}${fileExtension}`;
    const filePath = path.join(__dirname, '../uploads', fileName);

    // 确保上传目录存在
    await fs.ensureDir(path.dirname(filePath));

    // 下载并保存文件
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const localUrl = `/uploads/${fileName}`;
    
    res.json({
      success: true,
      data: {
        originalUrl: imageUrl,
        localUrl,
        filename: fileName,
        filePath
      }
    });
  } catch (error) {
    console.error('Image download error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 批量下载图片
router.post('/download-batch', async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: '图片列表不能为空'
      });
    }

    const results = [];
    
    for (let i = 0; i < images.length; i++) {
      try {
        const { url, name } = images[i];
        const response = await axios.get(url, { responseType: 'stream' });
        const fileName = name || `batch_image_${i + 1}_${uuidv4()}.jpg`;
        const filePath = path.join(__dirname, '../uploads', fileName);

        await fs.ensureDir(path.dirname(filePath));

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        results.push({
          originalUrl: url,
          localUrl: `/uploads/${fileName}`,
          filename: fileName,
          success: true
        });
      } catch (error) {
        results.push({
          originalUrl: images[i].url,
          error: error.message,
          success: false
        });
      }
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Batch download error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取图片模板列表
router.get('/templates', (req, res) => {
  try {
    const templates = [
      {
        id: 'xiaohongshu-classic',
        name: '小红书经典',
        description: '清新简约风格，适合日常分享',
        preview: '/templates/xiaohongshu-classic.jpg',
        settings: {
          style: 'clean and fresh',
          colors: 'bright and vibrant',
          layout: 'centered'
        }
      },
      {
        id: 'xiaohongshu-lifestyle',
        name: '生活方式',
        description: '温馨生活感，适合生活记录',
        preview: '/templates/xiaohongshu-lifestyle.jpg',
        settings: {
          style: 'cozy and warm',
          colors: 'soft pastels',
          layout: 'natural'
        }
      },
      {
        id: 'xiaohongshu-fashion',
        name: '时尚潮流',
        description: '时尚前卫，适合穿搭分享',
        preview: '/templates/xiaohongshu-fashion.jpg',
        settings: {
          style: 'trendy and stylish',
          colors: 'bold and modern',
          layout: 'dynamic'
        }
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;