import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import compression from 'vite-plugin-compression'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('miya-')
        }
      }
    }),
    compression({ algorithm: 'gzip', ext: '.gz' }),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxAgeSeconds: 31536000 } }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-static', expiration: { maxAgeSeconds: 31536000 } }
          },
          {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', expiration: { maxEntries: 100, maxAgeSeconds: 86400 } }
          }
        ]
      },
      manifest: {
        name: 'jiaandmiya · 分享站',
        short_name: 'jiaandmiya',
        description: 'jiaandmiya.com - 分享技术、记录生活',
        theme_color: '#222831',
        background_color: '#222831',
        display: 'standalone',
        icons: [
          { src: '/miya-icon.png', sizes: '192x192', type: 'image/png' },
          { src: '/miya-icon.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    }),
    visualizer({
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  assetsInclude: ['**/*.md'],
  build: {
    target: 'es2020',
    cssMinify: 'esbuild',
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@tiptap')) return 'vendor-tiptap'
            if (id.includes('marked')) return 'vendor-marked'
            if (id.includes('@iconify')) return 'vendor-icons'
            if (id.includes('vue-router') || id.includes('pinia')) return 'vendor-vue'
          }
        },
        experimentalMinChunkSize: 20000
      }
    }
  }
})
