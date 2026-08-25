import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      // Voice Agent — port 8000
      '/voice-api': {
        target:       'http://localhost:8000',
        changeOrigin: true,
        rewrite:      (p) => p.replace(/^\/voice-api/, ''),
        configure: (proxy) => {
          proxy.on('error', () => {}) // silence ECONNREFUSED — service may be down
        },
      },
      // RAG API — port 8001
      '/rag-api': {
        target:       'http://localhost:8001',
        changeOrigin: true,
        rewrite:      (p) => p.replace(/^\/rag-api/, ''),
        configure: (proxy) => {
          proxy.on('error', () => {})
        },
      },
      // Bridge HTTP — port 8002
      '/bridge-api': {
        target:       'http://localhost:8002',
        changeOrigin: true,
        rewrite:      (p) => p.replace(/^\/bridge-api/, ''),
        configure: (proxy) => {
          proxy.on('error', () => {})
        },
      },
      // Bridge WebSocket — port 8002
      '/ws': {
        target:       'ws://localhost:8002',
        ws:           true,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', () => {})
        },
      },
    },
  },
})
