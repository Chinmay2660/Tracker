import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
function reactRefreshGetRefreshRegShim(): Plugin {
    return {
        name: 'react-refresh-getRefreshReg-shim',
        enforce: 'post',
        apply: 'serve',
        transform(code, id, options) {
            if (options?.ssr)
                return null;
            const cleanId = id.split('?')[0];
            if (cleanId !== '/@react-refresh')
                return null;
            if (code.includes('getRefreshReg'))
                return null;
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
                    if (id.includes('node_modules/react-dom') ||
                        (id.includes('node_modules/react/') && !id.includes('node_modules/react-big-calendar'))) {
                        return 'react-vendor';
                    }
                    if (id.includes('node_modules/react-router-dom'))
                        return 'react-vendor';
                    if (id.includes('node_modules/@tanstack/react-query') || id.includes('node_modules/zustand')) {
                        return 'query-vendor';
                    }
                    if (id.includes('node_modules/recharts'))
                        return 'recharts-vendor';
                    if (id.includes('node_modules/react-big-calendar'))
                        return 'rbc-vendor';
                    if (id.includes('node_modules/react-markdown'))
                        return 'markdown-vendor';
                    if (id.includes('node_modules/@dnd-kit'))
                        return 'dnd-vendor';
                    if (id.includes('node_modules/date-fns'))
                        return 'date-fns-vendor';
                    if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform'))
                        return 'forms-vendor';
                },
            },
        },
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'recharts'],
    },
    esbuild: command === 'build'
        ? { legalComments: 'none', drop: ['console', 'debugger'] as const }
        : undefined,
}));
