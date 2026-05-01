import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import markdown from '@eslint/markdown'
import { run } from 'eslint-vitest-rule-tester'
import { LINK_SPACE_MESSAGE_IDS } from '../../utils/rules/link'
import rule, { RULE_NAME } from './index'

const MESSAGE_IDS = LINK_SPACE_MESSAGE_IDS

const valid: ValidTestCase[] = [
  {
    description: 'single space around link in chinese text',
    code: '在 [入门指南](/guide/) 中，',
  },
  {
    description: 'no space before link after chinese punctuation',
    code: '在。[入门指南](/guide/) 中，',
  },
  {
    description: 'no space after link before chinese punctuation',
    code: '在 [入门指南](/guide/)。',
  },
  {
    description: 'no spaces around link between chinese punctuations',
    code: '在。[入门指南](/guide/)。',
  },
  {
    description: 'link at the beginning of chinese sentence',
    code: '[入门指南](/guide/) 中，',
  },
  {
    description: 'link at the end of chinese sentence',
    code: '请参考 [入门指南](/guide/)',
  },
  {
    description: 'single space around link in english text',
    code: 'In the [Getting Started](/guide/) guide,',
  },
  {
    description: 'single space before link after english comma',
    code: 'In the, [Getting Started](/guide/) guide,',
  },
  {
    description: 'no space after link before english comma',
    code: 'In the [Getting Started](/guide/), ',
  },
  {
    description: 'link at the beginning of a paragraph after heading',
    code: '## Prev paragraph\n\n[`link`](/link) paragraph content',
  },
  {
    description: 'link at the beginning of a paragraph before next heading',
    code: '[`link`](/link) paragraph content\n\n ## Next paragraph',
  },
  // hyphen
  {
    description: 'single space before link after em dash',
    code: 'a permissive — [link](/link) node',
  },
  {
    description: 'single space after link before em dash',
    code: 'a permissive [link](/link) — node',
  },
  {
    description: 'single space after link before hyphen',
    code: 'a permissive [link](/link) - node',
  },
  {
    description: 'single spaces around link between hyphens',
    code: 'a permissive - [link](/link) - node',
  },
]

const invalid: InvalidTestCase[] = [
  // before miss
  {
    description: 'missing space before link after chinese text',
    code: '在[入门指南](/guide/) 中，',
    output: '在 [入门指南](/guide/) 中，',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBeforeLink }],
  },
  {
    description: 'missing space before link after english text',
    code: 'In the[Getting Started](/guide/) guide,',
    output: 'In the [Getting Started](/guide/) guide,',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBeforeLink }],
  },

  // before multi
  {
    description: 'multiple spaces before link after chinese text',
    code: '在   [入门指南](/guide/) 中，',
    output: '在 [入门指南](/guide/) 中，',
    errors: [{ messageId: MESSAGE_IDS.multipleSpacesBeforeLink }],
  },
  {
    description: 'multiple spaces before link after english text',
    code: 'In the   [Getting Started](/guide/) guide,',
    output: 'In the [Getting Started](/guide/) guide,',
    errors: [{ messageId: MESSAGE_IDS.multipleSpacesBeforeLink }],
  },
  {
    description: 'multiple spaces before link after english comma',
    code: 'In the,  [Getting Started](/guide/) guide,',
    output: 'In the, [Getting Started](/guide/) guide,',
    errors: [{ messageId: MESSAGE_IDS.multipleSpacesAfterPunctuation }],
  },

  {
    description: 'multiple spaces before link after english period',
    code: 'In the.   [Getting Started](/guide/) guide,',
    output: 'In the. [Getting Started](/guide/) guide,',
    errors: [{ messageId: MESSAGE_IDS.multipleSpacesAfterPunctuation }],
  },
  // before unexpect
  {
    description: 'unexpected space before link after chinese punctuation',
    code: '在。 [入门指南](/guide/) 中，',
    output: '在。[入门指南](/guide/) 中，',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceBeforeLink }],
  },
  {
    description: 'unexpected multiple spaces before link after chinese punctuation',
    code: '在。   [入门指南](/guide/) 中，',
    output: '在。[入门指南](/guide/) 中，',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceBeforeLink }],
  },
  // after
  {
    description: 'missing space after link before chinese text',
    code: '在 [入门指南](/guide/)中，',
    output: '在 [入门指南](/guide/) 中，',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceAfterLink }],
  },
  {
    description: 'missing space after link before english text',
    code: 'In the [Getting Started](/guide/)guide,',
    output: 'In the [Getting Started](/guide/) guide,',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceAfterLink }],
  },
  // before multi
  {
    description: 'multiple spaces after link before chinese text',
    code: '在 [入门指南](/guide/)   中，',
    output: '在 [入门指南](/guide/) 中，',
    errors: [{ messageId: MESSAGE_IDS.multipleSpacesAfterLink }],
  },
  {
    description: 'multiple spaces after link before english text',
    code: 'In the [Getting Started](/guide/)   guide,',
    output: 'In the [Getting Started](/guide/) guide,',
    errors: [{ messageId: MESSAGE_IDS.multipleSpacesAfterLink }],
  },
  // hyphen
  {
    description: 'missing space after link before dash punctuation',
    code: 'a permissive [link](/link)- node',
    output: 'a permissive [link](/link) - node',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceAfterLink }],
  },
  {
    description: 'multiple spaces after link before dash punctuation',
    code: 'a permissive [link](/link)   - node',
    output: 'a permissive [link](/link) - node',
    errors: [{ messageId: MESSAGE_IDS.multipleSpacesAfterLink }],
  },
  // after unexpect
  {
    description: 'unexpected space after link before chinese punctuation',
    code: '在 [入门指南](/guide/) ，中',
    output: '在 [入门指南](/guide/)，中',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceAfterLink }],
  },
  {
    description: 'unexpected multiple spaces after link before chinese punctuation',
    code: '在 [入门指南](/guide/)   ，中',
    output: '在 [入门指南](/guide/)，中',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceAfterLink }],
  },
  {
    description: 'unexpected multiple spaces after link before english comma',
    code: 'In the [Getting Started](/guide/)   , guide',
    output: 'In the [Getting Started](/guide/), guide',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceAfterLink }],
  },
  // inline element 递归情况
  {
    description: 'missing space between adjacent links',
    code: '[link1](/link1)[link2](/link2)',
    output: '[link1](/link1) [link2](/link2)',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBeforeLink }],
  },
  {
    description: 'missing space before link after inline code',
    code: '`code`[link](/link)',
    output: '`code` [link](/link)',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBeforeLink }],
  },
  {
    description: 'missing space before link after strong text',
    code: '**strong**[link](/link)',
    output: '**strong** [link](/link)',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBeforeLink }],
  },
  {
    description: 'missing space before link after emphasis text',
    code: '_emphasis_[link](/link)',
    output: '_emphasis_ [link](/link)',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBeforeLink }],
  },
  {
    description: 'missing space before link after html element',
    code: '<span>html</span>[link](/link)',
    output: '<span>html</span> [link](/link)',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBeforeLink }],
  },
  {
    description: 'missing space before link after image',
    code: '![alt](/img.png)[link](/link)',
    output: '![alt](/img.png) [link](/link)',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBeforeLink }],
  },
  {
    description: 'missing space before link after reference link',
    code: '[ref][id][link](/link)\n\n[id]: /ref',
    output: '[ref][id] [link](/link)\n\n[id]: /ref',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBeforeLink }],
  },
  {
    description: 'missing space before link after reference image',
    code: '![alt][img][link](/link)\n\n[img]: /img.png',
    output: '![alt][img] [link](/link)\n\n[img]: /img.png',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBeforeLink }],
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
