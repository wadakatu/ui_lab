import { defineConfig } from 'vite'

export default defineConfig({
  base: '/studio-carousel/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        helix: './helix.html',
        retro: './retro.html'
      }
    }
  }
})
