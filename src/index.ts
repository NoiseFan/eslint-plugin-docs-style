import type { ESLint, Linter } from 'eslint'
import markdown, { MarkdownLanguage } from '@eslint/markdown'
import { rules } from './rules'

export type { RuleOptions } from './types'

export const plugin: ESLint.Plugin = {
  rules,
  processors: markdown.processors,
  languages: {
    gfm: new MarkdownLanguage({ mode: 'gfm' }),
  },
}

const recommendedRules: Partial<Linter.RulesRecord> = {
  'md-style/valid-heading-anchor': 'error',
  'md-style/space-around-inline-element': 'error',
  'md-style/padding-around-custom-container': 'error',
  'md-style/valid-custom-container-type': 'error',
}
const allRules: Partial<Linter.RulesRecord>
  = Object.fromEntries(Object.keys(rules)
    .map(ruleName => [`md-style/${ruleName}`, 'error']))

interface PluginConfigMap {
  recommended: Linter.Config
  all: Linter.Config
}

export const configs: PluginConfigMap = {
  recommended: {
    name: 'md-style/recommended',
    files: ['**/*.md'],
    plugins: {
      'md-style': plugin,
    },
    language: 'md-style/gfm',
    languageOptions: {
      frontmatter: 'yaml',
    },
    rules: recommendedRules,
  },
  all: {
    name: 'md-style/all',
    files: ['**/*.md'],
    plugins: {
      'md-style': plugin,
    },
    language: 'md-style/gfm',
    languageOptions: {
      frontmatter: 'yaml',
    },
    rules: allRules,
  },
}

export type MdStylePlugin = ESLint.Plugin & {
  configs: PluginConfigMap
}

const mdStylePlugin: MdStylePlugin = Object.assign(plugin, { configs })

export default mdStylePlugin
