import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.test.ts'],
    exclude: [
      ...configDefaults.exclude,
      '**/*/example',
    ],
    coverage: {
      provider: 'v8',
    },
  },
})
