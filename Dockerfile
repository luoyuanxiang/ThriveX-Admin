# 使用官方的Node.js镜像作为基础镜像
FROM registry.cn-hangzhou.aliyuncs.com/liuyi778/node-20-alpine AS builder

# 设置工作目录
WORKDIR /thrive

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 配置 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

ARG VITE_PROJECT_API
ENV VITE_PROJECT_API=$VITE_PROJECT_API

ARG VITE_VERSION
ENV VITE_VERSION=$VITE_VERSION

ARG VITE_BAIDU_TONGJI_SITE_ID
ENV VITE_BAIDU_TONGJI_SITE_ID=$VITE_BAIDU_TONGJI_SITE_ID

ARG VITE_BAIDU_TONGJI_SITE_NAME
ENV VITE_BAIDU_TONGJI_SITE_NAME=$VITE_BAIDU_TONGJI_SITE_NAME

ARG VITE_AI_APIPASSWORD
ENV VITE_AI_APIPASSWORD=$VITE_AI_APIPASSWORD

ARG VITE_AI_MODEL
ENV VITE_AI_MODEL=$VITE_AI_MODEL

ARG VITE_GAODE_WEB_API
ENV VITE_GAODE_WEB_API=$VITE_GAODE_WEB_API

# 构建项目
RUN npm run build

# 使用 Nginx 作为生产环境的基础镜像
FROM nginx:alpine

# 复制构建输出到 Nginx 的默认静态文件目录
COPY --from=builder /thrive/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
