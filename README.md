# 小红书图文生成器

一个基于AI的图文生成工具，支持多种模板和风格，可以快速生成小红书风格的图文内容。

## 功能特性

- 🎨 **智能文本分割**：自动将长文本分割成适合的段落
- 🖼️ **多种模板**：经典、时尚、温馨、商务等多种风格模板
- 🎭 **风格选择**：摄影风、插画风、简约风等多种图片风格
- 🚫 **去水印功能**：可选择是否移除生成图片的水印
- 📥 **批量下载**：支持一键下载所有生成的图片
- ⚡ **实时预览**：所见即所得的编辑体验

## 技术栈

### 前端
- React 18
- Vite
- Socket.IO Client
- Lucide React (图标)

### 后端
- Node.js
- Express
- Socket.IO
- 豆包AI API

## 本地开发

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
# 安装所有依赖
npm run install-all

# 或者分别安装
npm install
cd server && npm install
cd ../client && npm install
```

### 环境配置
在 `server/.env` 文件中配置以下环境变量：
```env
DOUBAO_API_KEY=your_api_key_here
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
IMAGE_MODEL=doubao-seedream-4-0-250828
TEXT_MODEL=doubao-seed-1-6-flash-250828
PORT=3001
NODE_ENV=development
```

### 启动开发服务器
```bash
# 同时启动前后端
npm run dev

# 或者分别启动
npm run server  # 后端服务 (端口 3001)
npm run client  # 前端服务 (端口 5173)
```

## 在线部署

### 方案一：Vercel (前端) + Railway (后端)

#### 1. 部署后端到Railway
1. 访问 [Railway.app](https://railway.app)
2. 连接你的GitHub仓库
3. 选择部署后端服务
4. 配置环境变量：
   - `DOUBAO_API_KEY`
   - `DOUBAO_BASE_URL`
   - `IMAGE_MODEL`
   - `TEXT_MODEL`
   - `PORT` (Railway会自动设置)
   - `NODE_ENV=production`
5. 部署完成后获取后端API地址

#### 2. 部署前端到Vercel
1. 访问 [Vercel.com](https://vercel.com)
2. 连接你的GitHub仓库
3. 配置构建设置：
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`
4. 配置环境变量：
   - `VITE_API_URL`: Railway后端地址
5. 部署完成

### 方案二：Netlify (前端) + Railway (后端)

#### 1. 部署后端到Railway (同上)

#### 2. 部署前端到Netlify
1. 访问 [Netlify.com](https://netlify.com)
2. 连接你的GitHub仓库
3. 配置构建设置：
   - Base directory: `client`
   - Build command: `npm install && npm run build`
   - Publish directory: `client/dist`
4. 配置环境变量：
   - `VITE_API_URL`: Railway后端地址

### 方案三：全栈部署到Railway

1. 访问 [Railway.app](https://railway.app)
2. 连接你的GitHub仓库
3. 配置环境变量（同方案一）
4. Railway会自动检测并部署整个项目

## 环境变量说明

### 后端环境变量
- `DOUBAO_API_KEY`: 豆包AI API密钥
- `DOUBAO_BASE_URL`: 豆包AI API基础URL
- `IMAGE_MODEL`: 图片生成模型名称
- `TEXT_MODEL`: 文本处理模型名称
- `PORT`: 服务端口（生产环境由平台自动设置）
- `NODE_ENV`: 运行环境 (development/production)

### 前端环境变量
- `VITE_API_URL`: 后端API地址（生产环境需要设置）

## 项目结构

```
xiaohongshu-generator/
├── client/                 # 前端React应用
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── services/       # API服务
│   │   └── App.jsx         # 主应用组件
│   ├── package.json
│   └── vite.config.js
├── server/                 # 后端Node.js应用
│   ├── routes/             # API路由
│   ├── services/           # 业务服务
│   ├── uploads/            # 文件上传目录
│   ├── .env                # 环境变量
│   ├── index.js            # 服务器入口
│   └── package.json
├── vercel.json             # Vercel部署配置
├── railway.json            # Railway部署配置
├── netlify.toml            # Netlify部署配置
├── Procfile                # Heroku部署配置
└── package.json            # 根目录配置
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！