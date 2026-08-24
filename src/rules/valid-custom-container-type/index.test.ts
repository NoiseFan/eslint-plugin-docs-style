import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import markdown from '@eslint/markdown'
import { run } from 'eslint-vitest-rule-tester'
import { CUSTOM_CONTAINER_TYPES } from '@/parser/custom-container'
import rule, { MESSAGE_IDS, RULE_NAME } from './index'

const valid: ValidTestCase[] = [
  ...CUSTOM_CONTAINER_TYPES.map(type => ({
    description: `allows the ${type} container`,
    code: `::: ${type}\ncontent\n:::`,
  })),
  {
    description: 'allows a custom title',
    code: '::: warning Stop here\ncontent\n:::',
  },
  {
    description: 'allows a details container with the open attribute',
    code: '::: details Click me {open} \nContent\n:::',
  },
]

const invalid: InvalidTestCase[] = [
  {
    description: 'reports an unsupported container type',
    code: '::: note\ncontent\n:::',
    errors: [{ messageId: MESSAGE_IDS.invalidType, data: { type: 'note' } }],
  },
  {
    description: 'normalizes the casing of a supported type',
    code: '::: WARNING Custom title\ncontent\n:::',
    output: '::: warning Custom title\ncontent\n:::',
    errors: [{ messageId: MESSAGE_IDS.invalidTypeCase, data: { type: 'WARNING' } }],
  },
  {
    description: 'normalizes an invalid nested container type',
    code: ':::: info\n::: TIP\ncontent\n:::\n::::',
    output: ':::: info\n::: tip\ncontent\n:::\n::::',
    errors: [{ messageId: MESSAGE_IDS.invalidTypeCase, data: { type: 'TIP' } }],
  },
  // uppercase to lowercase
  {
    description: 'normalizes an uppercase type',
    code: '::: INFO \n content\n:::',
    output: '::: info \n content\n:::',
    errors: [{ messageId: MESSAGE_IDS.invalidTypeCase, data: { type: 'INFO' } }],
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
