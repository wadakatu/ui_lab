import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        simple: './simple/index.html',
        helix: './helix/index.html',
        retro: './retro/index.html'
      }
    }
  }
})
