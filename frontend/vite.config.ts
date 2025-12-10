import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    // Use esbuild for minification (built-in, faster than terser)
    minify: 'esbuild',
    sourcemap: false,
    cssMinify: true,
    cssCodeSplit: true,
    // Simpler chunk splitting - let Vite handle most of it
    rollupOptions: {
      output: {
        manualChunks: {
          // Only split the most critical vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2020',
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'recharts',
    ],
  },
  esbuild: {
    legalComments: 'none',
    // Drop console.logs in production
    drop: ['console', 'debugger'],
  },
})
