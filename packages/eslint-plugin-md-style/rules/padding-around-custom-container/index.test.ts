import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import markdown from '@eslint/markdown'
import { run } from 'eslint-vitest-rule-tester'
import rule, { MESSAGE_IDS, RULE_NAME } from './index'

const valid: ValidTestCase[] = [
  {
    description: 'allows a container at the beginning and end of a file',
    code: '::: info\ncontent\n:::',
    options: ['compact'],
  },
  {
    description: 'allows one blank line between sibling content and containers',
    code: 'Before\n\n::: info\ncontent\n:::\n\nAfter',
    options: ['compact'],
  },
  {
    description: 'allows nested containers without inner boundary padding',
    code: '::: info\nOuter\n\n::: tip\nInner\n:::\n\nAfter\n:::',
    options: ['compact'],
  },
  {
    description: 'ignores fenced code blocks',
    code: '```md\n::: info\n\ncontent\n\n:::\n```',
    options: ['compact'],
  },
  {
    description: 'ignores an unclosed container',
    code: 'Before\n::: info\ncontent',
    options: ['compact'],
  },
  {
    description: 'allows content lines ending with a closing-marker suffix',
    code: 'Before\n\n::: info\ntext :::\ncontent\n:::\n\nAfter',
    options: ['compact'],
  },
  {
    description: 'allows loose inner boundary padding by default',
    code: '::: info\n\ncontent\n\n:::',
  },
  {
    description: 'allows explicitly configured loose inner boundary padding',
    code: 'Before\n\n::: info\n\ncontent\n\n:::\n\nAfter',
  },
]

const invalid: InvalidTestCase[] = [
  {
    description: 'adds missing padding around a container',
    code: 'Before\n::: info\ncontent\n:::\nAfter',
    output: 'Before\n\n::: info\ncontent\n:::\n\nAfter',
    options: ['compact'],
    errors: [
      { messageId: MESSAGE_IDS.missing },
      { messageId: MESSAGE_IDS.missing },
    ],
  },
  {
    description: 'removes unexpected inner and outer padding',
    code: 'Before\n\n\n::: info\n\ncontent\n\n:::\n\n\nAfter',
    output: 'Before\n\n::: info\ncontent\n:::\n\nAfter',
    options: ['compact'],
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
    options: ['compact'],
    errors: [
      { messageId: MESSAGE_IDS.unexpected },
      { messageId: MESSAGE_IDS.unexpected },
      { messageId: MESSAGE_IDS.unexpected },
      { messageId: MESSAGE_IDS.unexpected },
    ],
  },
  {
    description: 'normalizes explicitly configured loose mode inner padding',
    code: '::: info\ncontent\n:::',
    output: '::: info\n\ncontent\n\n:::',
    errors: [
      { messageId: MESSAGE_IDS.missing },
      { messageId: MESSAGE_IDS.missing },
    ],
  },
  {
    description: 'removes extra loose mode inner padding',
    code: '::: info\n\n\ncontent\n\n\n:::',
    output: '::: info\n\ncontent\n\n:::',
    errors: [
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
