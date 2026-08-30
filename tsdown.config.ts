import { defineConfig } from 'tsdown'

export default defineConfig({
  platform: 'node',
  exports: true,
  external: ['@eslint/markdown'],
  dts: true,
  clean: true,
})
