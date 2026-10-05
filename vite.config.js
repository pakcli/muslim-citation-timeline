import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// One project, one src/. React lives in src/journey and builds to ONE self-contained
// IIFE bundle (journey-dist/) so the static root index.html loads it via plain
// <script> tags and still works from file:// with no server.
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: 'src/journey-dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/journey/main.jsx',
      name: 'MCTJourney',
      formats: ['iife'],
      fileName: () => 'journey.js',
      cssFileName: 'journey',
    },
  },
})
