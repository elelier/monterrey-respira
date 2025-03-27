import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/mtyrespira/', // Añade esta línea
  plugins: [react()],
  build: {
    // Especificar el directorio de salida explícitamente
    outDir: 'dist',
    // Usar esbuild para la minificación (predeterminado y no requiere dependencias adicionales)
    minify: 'esbuild',
    // Tamaño máximo de chunk para advertencias
    chunkSizeWarningLimit: 1000,
  },
  // Configurar el servidor de desarrollo
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
