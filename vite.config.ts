import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Feature pages are already route-split via React.lazy; surgical
        // vendor groups keep the eager runtime cacheable. Unmatched deps
        // fall back to Rollup's default split so lazy-only trees (like
        // jspdf's core-js/babel/fast-png) stay out of the initial load.
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }
          const pkg = id.slice(id.lastIndexOf('node_modules/') + 13);
          if (pkg.startsWith('recharts') || pkg.startsWith('d3-')) {
            return 'vendor-charts';
          }
          if (pkg.startsWith('@tanstack')) {
            return 'vendor-query';
          }
          if (
            pkg.startsWith('better-auth') ||
            pkg.startsWith('@better-auth') ||
            pkg.startsWith('@better-fetch') ||
            pkg.startsWith('jose/') ||
            pkg.startsWith('nanostores')
          ) {
            return 'vendor-auth';
          }
          if (
            pkg.startsWith('jspdf') ||
            pkg.startsWith('fast-png') ||
            pkg.startsWith('fflate') ||
            pkg.startsWith('core-js') ||
            pkg.startsWith('@babel')
          ) {
            return 'vendor-pdf';
          }
          if (
            pkg.startsWith('react-dom') ||
            pkg.startsWith('react/') ||
            pkg.startsWith('scheduler')
          ) {
            return 'vendor-react';
          }
          if (
            pkg.startsWith('react-router') ||
            pkg.startsWith('react-hook-form') ||
            pkg.startsWith('@hookform') ||
            pkg.startsWith('@base-ui') ||
            pkg.startsWith('@floating-ui') ||
            pkg.startsWith('zod')
          ) {
            return 'vendor-framework';
          }
          if (pkg.startsWith('@tabler')) {
            return 'vendor-icons';
          }
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', 'e2e/**'],
  },
});
