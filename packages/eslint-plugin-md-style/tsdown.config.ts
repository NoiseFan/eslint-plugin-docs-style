import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['index.ts'],
  exports: true,
  deps: {
    neverBundle: ['@eslint/markdown'],
  },
  dts: true,
})
