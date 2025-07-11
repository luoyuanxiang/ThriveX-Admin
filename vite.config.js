import { defineConfig } from 'vite'
import sassDts from 'vite-plugin-sass-dts';
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sassDts()],
  // 配置快捷路径
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, 'src')
    },
  },
  // 配置scss样式自动引入
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "./src/styles/var.scss";`
      }
    }
  },
  server: {
    port: 9100,
    proxy: {
      '/baidu': {
        target: 'https://openapi.baidu.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/baidu/, ''),
      },
      '/qiniu': {
        target: 'https://rsf.qiniuapi.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qiniu/, ''),
      },
      '/ai': {
        target: 'https://spark-api-open.xf-yun.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai/, ''),
      },
    },
  },
})
