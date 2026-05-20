import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import markdown from '@eslint/markdown'
import { run } from 'eslint-vitest-rule-tester'
import { SPACE_MESSAGE_IDS as MESSAGE_IDS } from '@/utils/space'
import rule, { RULE_NAME } from './index'

const valid: ValidTestCase[] = [
  {
    description: 'number between chinese text with spaces',
    code: '支持 123 个规则',
  },
  {
    description: 'decimal and percent number between chinese text with spaces',
    code: '提升 4.0% 效率',
  },
  {
    description: 'number adjacent to punctuation is allowed',
    code: '版本：2.0，现已发布。',
  },
]

const invalid: InvalidTestCase[] = [
  {
    description: 'reports a missing space before a number after CJK text',
    code: '支持123 个规则',
    output: '支持 123 个规则',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  {
    description: 'reports a missing space after a number before CJK text',
    code: '支持 123个规则',
    output: '支持 123 个规则',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceAfter }],
  },
  {
    description: 'reports missing spaces on both sides of an embedded number',
    code: '支持123个规则',
    output: '支持 123 个规则',
    errors: [{ messageId: MESSAGE_IDS.missingSpacesAround }],
  },
  {
    description: 'reports missing spaces around decimal percent numbers',
    code: '提升4.0%效率',
    output: '提升 4.0% 效率',
    errors: [{ messageId: MESSAGE_IDS.missingSpacesAround }],
  },
  {
    description: 'reports an unexpected space before a number after CJK text',
    code: '支持  123 个规则',
    output: '支持 123 个规则',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceBefore }],
  },
  {
    description: 'reports an unexpected space after a number before CJK text',
    code: '支持 123  个规则',
    output: '支持 123 个规则',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceAfter }],
  },
  {
    description: 'reports unexpected spaces on both sides of a number',
    code: '支持  123  个规则',
    output: '支持 123 个规则',
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
