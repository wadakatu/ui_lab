import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        simple: './simple/index.html',
        nebula: './nebula/index.html'
      }
    }
  }
})
