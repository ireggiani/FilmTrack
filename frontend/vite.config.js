import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

// Images imported with `?icon` get resized copies (32–256 px) for a srcset, so
// the browser downloads only the size it draws. The originals in src/assets
// are never modified; the copies exist only in the build (see config/icons.js).
const ICON_DIRECTIVES = new URLSearchParams({
  w: '32;64;128;256',
  format: 'png',
  as: 'picture',
})

export default defineConfig({
  plugins: [
    react(),
    imagetools({
      defaultDirectives: (url) =>
        url.searchParams.has('icon') ? ICON_DIRECTIVES : new URLSearchParams(),
    }),
  ],
  css: {
    devSourcemap: true,
  },
  // Dev requests go through Vite to the backend, so dev is same-origin like production
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/posters': 'http://localhost:5000',
    },
  },
  build: {
    outDir: '../backend/public',
    emptyOutDir: false,
  },
})
