import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    assetsInlineLimit: 4096,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          leaflet: ['leaflet'],
          chartjs: ['chart.js']
        },
        assetFileNames: 'assets/[name].[hash][extname]'
      },
      plugins: [
        {
          name: 'copy-manifest',
          generateBundle() {
            this.emitFile({
              type: 'asset',
              fileName: 'manifest.json',
              source: require('fs').readFileSync(resolve(__dirname, 'public/manifest.json'), 'utf-8')
            })
          }
        }
      ]
    }
  },
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})