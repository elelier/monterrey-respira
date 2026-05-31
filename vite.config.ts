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
      input: {
        main: resolve(__dirname, 'index.html'),
        acercaDe: resolve(__dirname, 'acerca-de/index.html'),
        datosYApis: resolve(__dirname, 'datos-y-apis/index.html'),
        asociaciones: resolve(__dirname, 'asociaciones/index.html'),
        politicaDePrivacidad: resolve(__dirname, 'politica-de-privacidad/index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          leaflet: ['leaflet'],
          chartjs: ['chart.js']
        },
        assetFileNames: 'assets/[name].[hash][extname]'
      },
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
