import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import markdown from '@eslint/markdown'
import { run } from 'eslint-vitest-rule-tester'
import rule, { MESSAGE_IDS, RULE_NAME } from './index'

const valid: ValidTestCase[] = [
  {
    description: 'allows normalized markers',
    code: '::: tip 提示\n内容\n:::',
  },
  {
    description: 'ignores markers in fenced code',
    code: '```md\n  ::: tip\n```',
  },
]

const invalid: InvalidTestCase[] = [
  {
    description: 'removes indentation around markers',
    code: '  ::: tip 提示\n内容\n  :::  ',
    output: '::: tip 提示\n内容\n:::',
    errors: [{ messageId: MESSAGE_IDS.unexpectedIndentation }, { messageId: MESSAGE_IDS.unexpectedIndentation }],
  },
  {
    description: 'normalizes the opening separator',
    code: ':::  tip 提示\n内容\n:::',
    output: '::: tip 提示\n内容\n:::',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSeparator }],
  },
  {
    description: 'adds the opening separator',
    code: ':::tip\n内容\n:::',
    output: '::: tip\n内容\n:::',
    errors: [{ messageId: MESSAGE_IDS.missingSeparator }],
  },
]

run({ name: RULE_NAME, rule, valid, invalid, configs: { plugins: { markdown }, language: 'markdown/gfm' } })
