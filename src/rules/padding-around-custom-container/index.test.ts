import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import markdown from '@eslint/markdown'
import { run } from 'eslint-vitest-rule-tester'
import rule, { MESSAGE_IDS, RULE_NAME } from './index'

const valid: ValidTestCase[] = [
  {
    description: 'allows a container at the beginning and end of a file',
    code: '::: info\ncontent\n:::',
  },
  {
    description: 'allows one blank line between sibling content and containers',
    code: 'Before\n\n::: info\ncontent\n:::\n\nAfter',
  },
  {
    description: 'allows nested containers without inner boundary padding',
    code: '::: info\nOuter\n\n::: tip\nInner\n:::\n\nAfter\n:::',
  },
  {
    description: 'ignores fenced code blocks',
    code: '```md\n\n::: info\ncontent\n:::\n\n```',
  },
]

const invalid: InvalidTestCase[] = [
  {
    description: 'adds missing padding around a container',
    code: 'Before\n::: info\ncontent\n:::\nAfter',
    output: 'Before\n\n::: info\ncontent\n:::\n\nAfter',
    errors: [
      { messageId: MESSAGE_IDS.missing },
      { messageId: MESSAGE_IDS.missing },
    ],
  },
  {
    description: 'removes unexpected inner and outer padding',
    code: 'Before\n\n\n::: info\n\ncontent\n\n:::\n\n\nAfter',
    output: 'Before\n\n::: info\ncontent\n:::\n\nAfter',
    errors: [
      { messageId: MESSAGE_IDS.unexpected },
      { messageId: MESSAGE_IDS.unexpected },
      { messageId: MESSAGE_IDS.unexpected },
      { messageId: MESSAGE_IDS.unexpected },
    ],
  },
  {
    description: 'normalizes nested container padding',
    code: '::: info\nOuter\n\n\n::: tip\n\nInner\n\n:::\n\n\nOuter\n:::',
    output: '::: info\nOuter\n\n::: tip\nInner\n:::\n\nOuter\n:::',
    errors: [
      { messageId: MESSAGE_IDS.unexpected },
      { messageId: MESSAGE_IDS.unexpected },
      { messageId: MESSAGE_IDS.unexpected },
      { messageId: MESSAGE_IDS.unexpected },
    ],
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
