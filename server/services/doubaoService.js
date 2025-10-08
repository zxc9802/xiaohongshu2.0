const axios = require('axios');

class DoubaoService {
  constructor() {
    this.apiKey = process.env.DOUBAO_API_KEY;
    this.baseUrl = process.env.DOUBAO_BASE_URL;
    this.imageModel = process.env.IMAGE_MODEL;
    this.textModel = process.env.TEXT_MODEL;
  }

  // 文本分割API调用
  async segmentText(text, segmentCount = 3, customPrompt = '') {
    try {
      const systemPrompt = customPrompt || `你是一个小红书内容专家，擅长将长文本拆分成吸引人的小红书笔记格式。

请将以下文本智能拆分为小红书笔记：

要求：
1. 提取一个吸引眼球的封面标题（20-50字），要有号召力和吸引力
2. 将剩余内容拆分为3-8个内容段落，每段50-200字
3. 每个段落要有明确的主题，内容连贯有重点
4. 适合小红书的风格，轻松活泼，容易阅读
5. 注意：请确保JSON字符串中的特殊字符已正确转义，避免使用未转义的引号、换行符等

请严格按照以下JSON格式返回（只返回JSON对象，不要包含任何其他内容、解释或markdown标记）：
{
  "cover": "封面标题文字",
  "contents": [
    "第一段内容",
    "第二段内容", 
    "第三段内容"
  ]
}

拆分的过后的封面标题要标注是封面，然后正文要标注是正文

待拆分的文本：
${text}`;
      
      const response = await axios.post(
         `${this.baseUrl}/chat/completions`,
        {
          model: this.textModel,
          messages: [
            {
              role: 'user',
              content: systemPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const result = response.data.choices[0].message.content;
      
      // 尝试解析JSON格式的响应
      try {
        const jsonResult = JSON.parse(result);
        if (jsonResult.cover && jsonResult.contents) {
          // 返回结构化数据，不在内容中添加标注
          const formattedSegments = [
            jsonResult.cover,
            ...jsonResult.contents
          ];
          
          return {
            success: true,
            segments: formattedSegments,
            segmentTypes: ['cover', ...jsonResult.contents.map(() => 'content')],
            raw: result
          };
        }
      } catch (parseError) {
        console.log('JSON解析失败，使用原始分割方式:', parseError.message);
      }
      
      // 如果JSON解析失败，使用原来的分割方式
      const segments = result.split('---').map(seg => seg.trim()).filter(seg => seg.length > 0);
      
      return {
        success: true,
        segments: segments,
        originalText: text
      };
    } catch (error) {
      console.error('Text segmentation error:', error.response?.data || error.message);
      throw new Error(`文本分割失败: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 图片生成API调用
  async generateImage(prompt, options = {}) {
    try {
      const {
        size = '2K',
        watermark = true,
        responseFormat = 'url',
        maxImages = 1
      } = options;

      // 构建小红书风格的提示词
      const xiaohongShuPrompt = this.buildImagePrompt(prompt, options);

      const requestData = {
        model: this.imageModel,
        prompt: xiaohongShuPrompt,
        response_format: responseFormat,
        size: size,
        watermark: watermark
      };

      // 如果需要生成多张图片
      if (maxImages > 1) {
        requestData.sequential_image_generation = 'auto';
        requestData.sequential_image_generation_options = {
          max_images: maxImages
        };
      }

      const response = await axios.post(
        `${this.baseUrl}/images/generations`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 60000 // 增加超时时间到60秒
        }
      );

      return {
        success: true,
        images: response.data.data || [],
        prompt: xiaohongShuPrompt
      };
    } catch (error) {
      console.error('Image generation error:', error.response?.data || error.message);
      throw new Error(`图片生成失败: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 批量生成图片
  async generateBatchImages(segments, template = 'default', style = 'modern', removeWatermark = false, onProgress = null) {
    const results = [];
    const total = segments.length;

    for (let i = 0; i < segments.length; i++) {
      try {
        if (onProgress) {
          onProgress({
            phase: 'generating',
            current: i + 1,
            total: total,
            message: `正在生成第 ${i + 1} 张图片...`
          });
        }

        const imageResult = await this.generateImage(segments[i], {
          size: '2K',
          watermark: !removeWatermark, // 根据removeWatermark参数决定是否添加水印
          templateStyle: template,
          style: style
        });

        results.push({
          segment: segments[i],
          images: imageResult.images,
          index: i
        });

        // 添加延迟避免API限流
        if (i < segments.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error generating image for segment ${i}:`, error);
        results.push({
          segment: segments[i],
          images: [],
          error: error.message,
          index: i
        });
      }
    }

    return results;
  }

  // 文本优化功能
  async optimizeText(text, optimizationType = 'general') {
    try {
      // 根据优化类型构建不同的提示词
      const optimizationPrompts = {
        general: `请优化以下文本，使其更适合小红书平台发布。要求：
1. 保持原意不变
2. 语言更生动有趣
3. 适当添加表情符号
4. 增强可读性和吸引力
5. 符合小红书用户的阅读习惯

原文本：${text}

请直接返回优化后的文本，不要添加任何解释。`,

        engaging: `请将以下文本改写得更有吸引力和互动性。要求：
1. 增加情感色彩
2. 使用更多感叹号和疑问句
3. 添加适当的表情符号
4. 让读者产生共鸣
5. 鼓励互动和评论

原文本：${text}

请直接返回优化后的文本。`,

        professional: `请将以下文本优化为更专业的表达方式。要求：
1. 语言准确严谨
2. 逻辑清晰
3. 去除冗余表达
4. 增强说服力
5. 保持简洁明了

原文本：${text}

请直接返回优化后的文本。`,

        casual: `请将以下文本改写得更轻松随意。要求：
1. 使用口语化表达
2. 增加亲和力
3. 适当使用网络流行语
4. 让文字更有温度
5. 贴近年轻用户

原文本：${text}

请直接返回优化后的文本。`
      };

      const prompt = optimizationPrompts[optimizationType] || optimizationPrompts.general;

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.textModel,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的文案优化助手，擅长为社交媒体平台优化文本内容。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const data = response.data;
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('API返回数据格式错误');
      }

      const optimizedText = data.choices[0].message.content.trim();
      
      // 简单的后处理，确保文本质量
      if (optimizedText.length < 10) {
        throw new Error('优化结果过短，请重试');
      }

      return optimizedText;
    } catch (error) {
      console.error('Text optimization error:', error);
      throw new Error(`文本优化失败: ${error.message}`);
    }
  }

  // 构建小红书风格的图片生成提示词
  buildImagePrompt(textContent, options = {}) {
    const { templateStyle = 'default' } = options;
    
    // 基础风格描述
    const baseStyle = "小红书风格，高质量摄影，自然光线，清新明亮，构图美观";
    
    // 根据文本内容智能判断场景类型
    const sceneKeywords = {
      '咖啡': '咖啡店场景，温馨氛围，咖啡杯特写',
      '美食': '美食摄影，诱人色彩，精致摆盘',
      '旅行': '旅行风景，自然美景，人文景观',
      '穿搭': '时尚穿搭，街拍风格，自然姿态',
      '护肤': '护肤产品，简约背景，柔和光线',
      '健身': '运动场景，活力四射，健康生活',
      '学习': '学习场景，书桌整洁，文艺氛围',
      '生活': '日常生活，温馨家居，生活美学'
    };

    // 检测文本中的关键词
    let scenePrompt = '';
    for (const [keyword, description] of Object.entries(sceneKeywords)) {
      if (textContent.includes(keyword)) {
        scenePrompt = description;
        break;
      }
    }

    // 如果没有匹配到特定场景，使用通用描述
    if (!scenePrompt) {
      scenePrompt = '生活场景，温馨自然，美好瞬间';
    }

    // 模板风格调整
    const templateStyles = {
      'minimalist': '极简风格，留白设计，简洁构图',
      'vintage': '复古滤镜，暖色调，胶片质感',
      'bright': '明亮色彩，高饱和度，活力四射',
      'soft': '柔和色调，温暖光线，治愈系',
      'default': '自然色彩，平衡构图，真实质感'
    };

    const styleDescription = templateStyles[templateStyle] || templateStyles.default;

    // 组合最终提示词
    const finalPrompt = `${baseStyle}，${scenePrompt}，${styleDescription}。文本内容：${textContent.substring(0, 100)}`;

    return finalPrompt;
  }
}

module.exports = new DoubaoService();