import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import markdown from '@eslint/markdown'
import { run } from 'eslint-vitest-rule-tester'
import rule, { MESSAGE_IDS, RULE_NAME } from './index'

const valid: ValidTestCase[] = [
  {
    description: 'allows one blank line outside and no blank lines inside',
    code: '# Title\n\n::: info\nfirst paragraph\n\nsecond paragraph\n:::\n\nother content',
  },
  {
    description: 'allows nested containers separated from outer content',
    code: '::: info\nouter content\n\n::: tip\ninner content\n:::\n\nouter content\n:::',
  },
  {
    description: 'allows adjacent nested boundary markers',
    code: ':::: info\n::: tip\ncontent\n:::\n::::',
  },
  {
    description: 'does not require padding at document boundaries',
    code: '::: info\ncontent\n:::',
  },
  {
    description: 'ignores custom container examples in fenced code blocks',
    code: '```md\ntext\n::: info\n\ncontent\n\n:::\ntext\n```',
  },
]

const invalid: InvalidTestCase[] = [
  {
    description: 'adds missing external blank lines',
    code: 'before\n::: info\ncontent\n:::\nafter',
    output: 'before\n\n::: info\ncontent\n:::\n\nafter',
    errors: [
      { messageId: MESSAGE_IDS.missing },
      { messageId: MESSAGE_IDS.missing },
    ],
  },
  {
    description: 'removes blank lines inside container boundaries',
    code: '::: info\n\ncontent\n\n:::',
    output: '::: info\ncontent\n:::',
    errors: [
      { messageId: MESSAGE_IDS.unexpected },
      { messageId: MESSAGE_IDS.unexpected },
    ],
  },
  {
    description: 'compresses excessive external blank lines',
    code: 'before\n\n\n::: info\ncontent\n:::\n\n\nafter',
    output: 'before\n\n::: info\ncontent\n:::\n\nafter',
    errors: [
      { messageId: MESSAGE_IDS.missing },
      { messageId: MESSAGE_IDS.missing },
    ],
  },
  {
    description: 'normalizes nested container boundaries',
    code: ':::: info\nouter\n\n\n::: tip\n\ninner\n\n:::\n\n\nouter\n\n::::',
    output: ':::: info\nouter\n\n::: tip\ninner\n:::\n\nouter\n::::',
    errors: [
      { messageId: MESSAGE_IDS.missing },
      { messageId: MESSAGE_IDS.unexpected },
      { messageId: MESSAGE_IDS.unexpected },
      { messageId: MESSAGE_IDS.missing },
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
