import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
    process: {
      env: {}
    }
  },
  optimizeDeps: {
    include: [
      '@solana/web3.js', 
      '@solana/spl-token',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-react-ui',
      '@solana/wallet-adapter-wallets'
    ]
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})