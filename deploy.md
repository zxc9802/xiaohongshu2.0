# 小红书图文生成器 - 线上部署指南

## 项目概述
这是一个基于AI的小红书图文生成器，包含前端React应用和后端Node.js API服务。

## 本地开发环境
- 后端服务器：http://localhost:3001
- 前端应用：http://localhost:5173

## 部署方案选择

### 方案一：云服务器部署（推荐）

#### 1. 服务器要求
- 操作系统：Ubuntu 20.04+ 或 CentOS 7+
- 内存：至少2GB RAM
- 存储：至少20GB磁盘空间
- Node.js：版本16+
- PM2：进程管理工具

#### 2. 部署步骤

##### 2.1 服务器环境准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2
sudo npm install -g pm2

# 安装Nginx
sudo apt install nginx -y
```

##### 2.2 项目部署
```bash
# 克隆项目到服务器
git clone <your-repo-url> /var/www/xiaohongshu-generator
cd /var/www/xiaohongshu-generator

# 安装依赖
npm run install-all

# 构建前端
cd client && npm run build

# 配置环境变量
cd ../server
cp .env.example .env
# 编辑.env文件，配置生产环境变量
```

##### 2.3 PM2配置
创建 `ecosystem.config.js` 文件：
```javascript
module.exports = {
  apps: [{
    name: 'xiaohongshu-server',
    script: './server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
```

启动应用：
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

##### 2.4 Nginx配置
创建 `/etc/nginx/sites-available/xiaohongshu-generator`：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/xiaohongshu-generator/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO支持
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/xiaohongshu-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 方案二：Docker部署

#### 2.1 创建Dockerfile
后端Dockerfile (`server/Dockerfile`)：
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

前端Dockerfile (`client/Dockerfile`)：
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2.2 Docker Compose配置
创建 `docker-compose.yml`：
```yaml
version: '3.8'
services:
  server:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    volumes:
      - ./server/uploads:/app/uploads

  client:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - server
```

部署命令：
```bash
docker-compose up -d
```

### 方案三：云平台部署

#### 3.1 Vercel部署（前端）
1. 连接GitHub仓库到Vercel
2. 设置构建命令：`cd client && npm run build`
3. 设置输出目录：`client/dist`
4. 配置环境变量

#### 3.2 Railway/Render部署（后端）
1. 连接GitHub仓库
2. 设置启动命令：`cd server && npm start`
3. 配置环境变量
4. 设置端口为动态端口

## 环境变量配置

### 后端环境变量 (.env)
```
NODE_ENV=production
PORT=3001
DOUBAO_API_KEY=your_doubao_api_key
DOUBAO_API_URL=your_doubao_api_url
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=https://your-frontend-domain.com
```

### 前端环境变量
在构建时需要配置API端点：
```
VITE_API_URL=https://your-backend-domain.com
```

## SSL证书配置（推荐）
使用Let's Encrypt免费SSL证书：
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 监控和维护

### 日志查看
```bash
# PM2日志
pm2 logs xiaohongshu-server

# Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 性能监控
```bash
# PM2监控
pm2 monit

# 系统资源
htop
df -h
```

## 备份策略
1. 定期备份上传的文件
2. 备份应用配置
3. 监控磁盘空间使用

## 安全建议
1. 配置防火墙，只开放必要端口
2. 定期更新系统和依赖包
3. 使用HTTPS
4. 配置文件上传限制
5. 实施API访问限制

## 故障排除
1. 检查PM2进程状态：`pm2 status`
2. 检查Nginx配置：`sudo nginx -t`
3. 查看系统资源：`free -h`, `df -h`
4. 检查端口占用：`netstat -tlnp`