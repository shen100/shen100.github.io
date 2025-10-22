import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    base: '/',  // 为 GitHub Pages 添加基本路径
    server: {
      host: true,  // 允许外部通过 IP 访问
    },
    plugins: [
      vue(),
      // 只在开发环境中使用 VueDevTools
      isDev ? VueDevTools() : null,
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
})
