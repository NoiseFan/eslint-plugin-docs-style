import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import markdown from '@eslint/markdown'
import { run } from 'eslint-vitest-rule-tester'
import rule, { RULE_NAME } from './index'

const valid: ValidTestCase[] = [
  '# Some English Title',
  '# Introduction',
  '# 中文标题 {#chinese-title}',
  '# 中文标题 {#Chinese-Title}',
  '# 简介 {#intro}',
  '# some title {#some-title-1}',
  '## Secondary title',
  '## Include `code` block',
  '---\ntitle: restoreMocks | 配置\noutline: deep\n---\n\n# restoreMocks',
]

const invalid: InvalidTestCase[] = [
  {
    code: '# 中文标题',
    errors: [{ messageId: 'missingAnchor' }],
  },
  {
    code: '# 你的第一个测试 Your First Test',
    errors: [{ messageId: 'missingAnchor' }],
  },
  {
    code: '## API 介绍 API Introduction',
    errors: [{ messageId: 'missingAnchor' }],
  },
  {
    code: '## 使用 `describe` 编组测试 #Grouping Tests with `describe`',
    output: '## 使用 `describe` 编组测试 {#grouping-tests-with-describe}',
    errors: [{ messageId: 'missingAnchor' }],
  },
]

run({
  name: RULE_NAME,
  rule,
  valid,
  invalid,
  configs: {
    plugins: { markdown },
    language: 'markdown/commonmark',
  },
})
