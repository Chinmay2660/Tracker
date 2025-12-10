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
    // Enable source maps only for error tracking (smaller)
    sourcemap: false,
    // Optimize CSS
    cssMinify: true,
    cssCodeSplit: true,
    // Better chunk splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React - loaded first
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'react-core';
          }
          // Router - needed for navigation
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          // State management
          if (id.includes('node_modules/@tanstack/react-query') || 
              id.includes('node_modules/zustand')) {
            return 'state';
          }
          // Drag and drop - only loaded on dashboard
          if (id.includes('node_modules/@dnd-kit')) {
            return 'dnd';
          }
          // Calendar - only loaded on calendar page
          if (id.includes('node_modules/react-big-calendar') || 
              id.includes('node_modules/moment')) {
            return 'calendar';
          }
          // Charts - lazy loaded
          if (id.includes('node_modules/recharts') || 
              id.includes('node_modules/d3')) {
            return 'charts';
          }
          // Forms
          if (id.includes('node_modules/react-hook-form') || 
              id.includes('node_modules/@hookform') ||
              id.includes('node_modules/zod')) {
            return 'forms';
          }
          // Icons - tree shake by splitting
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'date-utils';
          }
          // UI utilities
          if (id.includes('node_modules/clsx') || 
              id.includes('node_modules/tailwind-merge') ||
              id.includes('node_modules/class-variance-authority')) {
            return 'ui-utils';
          }
          // Other vendor code
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash:8].js',
        entryFileNames: 'assets/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]',
      },
    },
    chunkSizeWarningLimit: 500,
    // Target modern browsers only
    target: 'es2020',
    // Inline small assets
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'recharts',
      'es-toolkit',
    ],
  },
  // Enable esbuild optimizations
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
    // Drop console.logs in production
    drop: ['console', 'debugger'],
  },
})
