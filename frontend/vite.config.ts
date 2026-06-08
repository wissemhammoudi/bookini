import { defineConfig, mergeConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const viteConfig = {
  plugins: [react()],
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
  },
})

export default mergeConfig(viteConfig, vitestConfig)
