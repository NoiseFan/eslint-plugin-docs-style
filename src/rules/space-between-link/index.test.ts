import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import markdown from '@eslint/markdown'
import { run } from 'eslint-vitest-rule-tester'
import rule, { RULE_NAME } from './index'

const valid: ValidTestCase[] = [
  '在 [入门指南](/guide/) 中，',
  '在。[入门指南](/guide/) 中，',
  '在 [入门指南](/guide/)。',
  '在。[入门指南](/guide/)。',
  '[入门指南](/guide/) 中，',
  '请参考 [入门指南](/guide/)',
  'In the [Getting Started](/guide/) guide, ',
  'In the, [Getting Started](/guide/) guide, ',
  'In the [Getting Started](/guide/), ',
]

const invalid: InvalidTestCase[] = [
  {
    code: '在[入门指南](/guide/) 中，',
    output: '在 [入门指南](/guide/) 中，',
    errors: [{ messageId: 'missingSpaceBeforeLink' }],
  },
  {
    code: '在  [入门指南](/guide/) 中，',
    output: '在 [入门指南](/guide/) 中，',
    errors: [{ messageId: 'multipleSpacesBeforeLink' }],
  },
  // Single space
  {
    code: '在。 [入门指南](/guide/) 中，',
    output: '在。[入门指南](/guide/) 中，',
    errors: [{ messageId: 'unexpectedSpaceBeforeLink' }],
  },
  // Mutil space
  {
    code: '在。 [入门指南](/guide/) 中，',
    output: '在。[入门指南](/guide/) 中，',
    errors: [{ messageId: 'unexpectedSpaceBeforeLink' }],
  },
  {
    code: '在 [入门指南](/guide/)中，',
    output: '在 [入门指南](/guide/) 中，',
    errors: [{ messageId: 'missingSpaceAfterLink' }],
  },
  {
    code: '在 [入门指南](/guide/)  中，',
    output: '在 [入门指南](/guide/) 中，',
    errors: [{ messageId: 'multipleSpacesAfterLink' }],
  },
  {
    code: '在 [入门指南](/guide/) 。',
    output: '在 [入门指南](/guide/)。',
    errors: [{ messageId: 'unexpectedSpaceAfterLink' }],
  },
  {
    code: 'In the,[Getting Started](/guide/) guide, ',
    output: 'In the, [Getting Started](/guide/) guide, ',
    errors: [{ messageId: 'missingSpaceBeforeLink' }],
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
