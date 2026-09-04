import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['index.ts'],
  platform: 'node',
  exports: true,
  deps: {
    neverBundle: ['@eslint/markdown'],
  },
  dts: true,
  clean: true,
})
