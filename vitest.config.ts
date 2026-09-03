import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
    },
    projects: [
      'packages/ast/vitest.config.ts',
      'packages/eslint-plugin-md-style/vitest.config.ts',
    ],
  },
})
