import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import markdown from '@eslint/markdown'
import { run } from 'eslint-vitest-rule-tester'
import rule, { MESSAGE_IDS, RULE_NAME } from './index'

const valid: ValidTestCase[] = [
  {
    description: 'english text between chinese text',
    code: '在 watch 模式下',
  },
  {
    description: 'english text after punctuation',
    code: '目前 Vitest 还不支持范围：',
  },
  {
    description: 'english text before punctuation',
    code: '我们感谢 Jest 团队和社区创建了一个令人愉悦的测试 API',
  },
  {
    description: 'consecutive english text',
    code: 'WebStorm、PhpStorm、IntelliJ IDEA Ultimate 和其他 JetBrains IDE 内置了对 Vitest 的支持。',
  },
  {
    description: 'standard english paragraph',
    code: 'A mock that always returns `undefined` isn\'t very useful on its own. ',
  },
]

const invalid: InvalidTestCase[] = [
  {
    description: 'reports a missing space before an English word after CJK text',
    code: '在watch 模式下',
    output: '在 watch 模式下',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  {
    description: 'reports a missing space after an English word before CJK text',
    code: '在 watch模式下',
    output: '在 watch 模式下',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceAfter }],
  },
  {
    description: 'reports missing spaces on both sides of an embedded English word',
    code: '在watch模式下',
    output: '在 watch 模式下',
    errors: [{ messageId: MESSAGE_IDS.missingSpacesAround }],
  },
  {
    description: 'reports an unexpected space before an English word after CJK text',
    code: '在  watch 模式下',
    output: '在 watch 模式下',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceBefore }],
  },
  {
    description: 'collapses multiple spaces between English and CJK text',
    code: '在 watch  模式下',
    output: '在 watch 模式下',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceAfter }],
  },
  {
    description: 'collapses multiple spaces between English and CJK text',
    code: '在  watch   模式下',
    output: '在 watch 模式下',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceAround }],
  },
]

run({
  name: RULE_NAME,
  rule,
  valid,
  invalid,
  configs: {
    plugins: { markdown },
    language: 'markdown/gfm',
  },
})
