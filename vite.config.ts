import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const isCI = process.env.CI === 'true';
  return {
    base: '/',
    plugins: [react(), splitVendorChunkPlugin()],
    build: {
      sourcemap: true,
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            monaco: ['monaco-editor']
          }
        }
      }
    },
    server: {
      host: true,
      port: 5173
    },
    preview: {
      port: 4173
    },
    esbuild: {
      legalComments: 'none'
    },
    define: {
      'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
      'process.env.APP_VERSION': JSON.stringify(process.env.npm_package_version)
    },
    optimizeDeps: {
      include: ['monaco-editor']
    },
    test: {
      globals: true,
      environment: 'jsdom',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html']
      },
      setupFiles: './vitest.setup.ts'
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    worker: {
      format: 'es'
    },
    logLevel: isCI ? 'error' : 'info'
  };
});
