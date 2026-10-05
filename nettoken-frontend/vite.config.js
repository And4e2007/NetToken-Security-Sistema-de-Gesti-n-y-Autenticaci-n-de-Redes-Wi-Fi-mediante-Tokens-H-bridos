import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true, // Silencia las advertencias de librerías externas como Bootstrap
        api: 'modern-compiler',
        silenceDeprecations: ['import', 'global-builtin', 'color-functions']
      }
    }
  }
})