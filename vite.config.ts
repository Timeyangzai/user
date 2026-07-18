import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const cfAsyncModuleScriptPlugin = () => ({
  name: 'cfasync-module-script',
  transformIndexHtml(html: string) {
    return html.replace(
      /<script\s+type="module"(?![^>]*data-cfasync)/g,
      '<script data-cfasync="false" type="module"',
    )
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const devApiTarget = process.env.VITE_DEV_API_TARGET || 'http://localhost:8080'
  const useRemoteDevApi = !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(devApiTarget)

  return {
    plugins: [vue(), cfAsyncModuleScriptPlugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : {},
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-qrcode': ['qrcode'],
            'vendor-vue-i18n': ['vue-i18n'],
          },
        },
      },
    },
    server: {
      host: '0.0.0.0', // 监听所有网络接口
      port: 5173,
      strictPort: true,
      // 允许通过分销商子域名(*.dujiao-next.test)访问 dev server，否则 Vite 5.4+ 会拦截非 localhost 的 Host
      allowedHosts: ['.dujiao.test'],
      proxy: {
        // 本地 API 保留 Host 以支持分销站；远程开发 API 使用目标站点 Host。
        '/api': {
          target: devApiTarget,
          changeOrigin: useRemoteDevApi,
        },
        '/uploads': {
          target: devApiTarget,
          changeOrigin: useRemoteDevApi,
        },
        '/sitemap.xml': {
          target: devApiTarget,
          changeOrigin: useRemoteDevApi,
        },
        '/robots.txt': {
          target: devApiTarget,
          changeOrigin: useRemoteDevApi,
        },
      },
    },
  }
})
