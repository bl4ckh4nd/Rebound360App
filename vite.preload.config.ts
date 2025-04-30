import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    outDir: 'dist/main',
    lib: {
      entry: path.resolve(__dirname, 'src/main/preload.ts'),
      formats: ['cjs'],
      fileName: () => 'preload.js',
    },
    rollupOptions: {
      external: ['electron'],
    },
    emptyOutDir: false,
    target: 'node14',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})