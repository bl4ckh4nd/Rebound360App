import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import path from 'path'

export default defineConfig({
  plugins: [reactRefresh()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      external: ['electron', 'path', ...Object.keys(process.binding('natives'))]
    }
  },
  optimizeDeps: {
    exclude: ['electron']
  }
})