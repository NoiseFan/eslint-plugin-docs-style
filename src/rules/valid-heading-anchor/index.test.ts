import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import markdown from '@eslint/markdown'
import { run } from 'eslint-vitest-rule-tester'
import rule, { RULE_NAME } from './index'

const valid: ValidTestCase[] = [
  {
    description: 'single word without anchor',
    code: '# Introduction',
  },
  {
    description: 'multiple words without anchor',
    code: '# Some English Title',
  },
  {
    description: 'english heading should not be affected by chinese content elsewhere',
    code: '## equal\n\n- **类型:** `<T>(actual: T, expected: T, message?: string) => void`\n\n断言 `actual` 和 `expected` 非严格相等 (==)。\n\n```ts\n import { assert, test } from \'vitest\'\n\ntest(\'assert.equal\', () => {\n\nassert.equal(Math.sqrt(4), \'2\')\n})',
  },
  {
    description: 'sigle word of anchor',
    code: '# 简介 {#intro}',
  },
  {
    description: 'multiple word of anchor',
    code: '# 中文标题 {#chinese-title}',
  },
]

const invalid: InvalidTestCase[] = [
  {
    description: 'chinese heading of missing anchor',
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
    description: 'like heading anchor',
    code: '## 使用 `describe` 编组测试 #Grouping Tests with `describe`',
    output: '## 使用 `describe` 编组测试 {#grouping-tests-with-describe}',
    errors: [{ messageId: 'missingAnchor' }],
  },
  {
    description: 'should be no capital letters',
    code: '# 中文标题 {#Chinese-Title}',
    output: '# 中文标题 {#chinese-title}',
    errors: [{ messageId: 'invalidHeadingAnchor' }],
  },
  {
    description: 'should be allow underline',
    code: '# 中文标题 {#Foo_Bar`123}',
    output: '# 中文标题 {#foo_bar123}',
    errors: [{ messageId: 'invalidHeadingAnchor' }],
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
