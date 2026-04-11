import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Some dev transforms still call `RefreshRuntime.getRefreshReg()`, but Vite's
 * `/@react-refresh` runtime only exposes `register`. Re-introduce the legacy
 * helper so Fast Refresh does not throw at runtime (e.g. memo-wrapped components).
 */
function reactRefreshGetRefreshRegShim(): Plugin {
  return {
    name: 'react-refresh-getRefreshReg-shim',
    enforce: 'post',
    apply: 'serve',
    transform(code, id, options) {
      if (options?.ssr) return null;
      const cleanId = id.split('?')[0];
      if (cleanId !== '/@react-refresh') return null;
      if (code.includes('getRefreshReg')) return null;
      return {
        code: `${code}\nexport function getRefreshReg() {\n  return register;\n}\n`,
        map: null,
      };
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [react(), reactRefreshGetRefreshRegShim()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    minify: 'esbuild',
    sourcemap: false,
    cssMinify: true,
    cssCodeSplit: true,
    target: 'es2020',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react-dom') ||
            (id.includes('node_modules/react/') && !id.includes('node_modules/react-big-calendar'))
          ) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router-dom')) return 'react-vendor';
          if (id.includes('node_modules/@tanstack/react-query') || id.includes('node_modules/zustand')) {
            return 'query-vendor';
          }
          if (id.includes('node_modules/recharts')) return 'recharts-vendor';
          if (id.includes('node_modules/react-big-calendar')) return 'rbc-vendor';
          if (id.includes('node_modules/react-markdown')) return 'markdown-vendor';
          if (id.includes('node_modules/@dnd-kit')) return 'dnd-vendor';
          if (id.includes('node_modules/date-fns')) return 'date-fns-vendor';
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform'))
            return 'forms-vendor';
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts'],
  },
  // Apply drop only for production builds. Root `esbuild` runs during dev too and
  // can break or desync React Fast Refresh (e.g. RefreshRuntime / $RefreshReg$ issues).
  esbuild:
    command === 'build'
      ? { legalComments: 'none', drop: ['console', 'debugger'] as const }
      : undefined,
}));
