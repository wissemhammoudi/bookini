import path from 'path'
import { defineConfig, mergeConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const viteConfig = {
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}

const vitestConfig = defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
    server: {
      deps: {
        inline: ['@mui/material', 'react-transition-group'],
      },
    },
  },
})

export default mergeConfig(viteConfig, vitestConfig)
