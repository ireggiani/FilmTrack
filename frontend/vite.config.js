import process from 'node:process'
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

// PORT overrides the backend's port, as it does in backend/server.js
const BACKEND = `http://127.0.0.1:${process.env.PORT ?? 5000}`

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
  server: {
    // A fixed port of its own, so FilmTrack never competes for Vite's default
    // 5173 with other projects. Open it as http://filmtrack.localhost:5080:
    // browsers send any *.localhost name to this computer, and the name keeps
    // the app apart from other local servers in the address bar, the history
    // and its saved settings.
    port: 5080,
    strictPort: true, // fail loudly if 5080 is taken, rather than drifting to another port
    // Dev requests go through Vite to the backend, so dev is same-origin like production
    proxy: {
      '/api': BACKEND,
      '/posters': BACKEND,
    },
  },
  build: {
    outDir: '../backend/public',
    emptyOutDir: false,
  },
})
