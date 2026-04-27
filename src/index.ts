import type { ESLint } from 'eslint'
import markdown, { MarkdownLanguage } from '@eslint/markdown'
import { rules } from './rules'

export const plugin: ESLint.Plugin = {
  rules,
  processors: markdown.processors,
  languages: {
    commonmark: new MarkdownLanguage({ mode: 'commonmark' }),
    gfm: new MarkdownLanguage({ mode: 'gfm' }),
  },
}
export default plugin
