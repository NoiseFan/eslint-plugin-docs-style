import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import markdown from '@eslint/markdown'
import { run } from 'eslint-vitest-rule-tester'
import { MESSAGE_IDS } from '@/rules/space-around-inline-element'
import rule, { RULE_NAME } from './index'

const valid: ValidTestCase[] = [
  // link elememt
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
    description: 'no spaces around link surrounded by chinese punctuations',
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
    description: 'link at the end of heading before trailing anchor',
    code: '### In the [Getting Started](/guide) {#in-the-getting-started}',
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
    description: 'no space before link after opening parenthesis',
    code: 'In the ([Getting Started](/guide/) guide)',
  },
  {
    description: 'link at the beginning of a paragraph after heading',
    code: '## Prev paragraph\n\n[`link`](/link) paragraph content',
  },
  {
    description: 'link at the beginning of a paragraph before next heading',
    code: '[`link`](/link) paragraph content\n\n ## Next paragraph',
  },
  {
    description: 'link inside custom container before closing marker',
    code: '::: info\n[Getting Started](/guide/)\n:::',
  },
  // link element - hyphen
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
    description: 'single spaces around link surrounded by hyphens',
    code: 'a permissive - [link](/link) - node',
  },
  {
    description: 'single space around image in text',
    code: '请看 ![alt](/img.png) 示例',
  },
  {
    description: 'single space around inline code in text',
    code: '执行 `pnpm test` 验证',
  },
  {
    description: 'single space around emphasis in text',
    code: '这是 _emphasis_ 文本',
  },
  {
    description: 'single space around strong in text',
    code: '这是 **strong** 文本',
  },
  {
    description: 'no space before inline element after chinese punctuation',
    code: '在。[入门指南](/guide/) 中，',
  },
  {
    description: 'no space after inline element before chinese punctuation',
    code: '在 [入门指南](/guide/)。',
  },
  // other element
  {
    description: 'no space around inline element inside paired punctuation',
    code: 'In the (`code` guide)',
  },
  {
    description: 'nested strong inside emphasis is not reported separately',
    code: '这是 ***重点*** 文本',
  },
  {
    description: 'html is not selected as inline element target',
    code: '<span>html</span>text',
  },
  {
    description: 'reference links are not selected as inline element target',
    code: '[ref][id]text\n\n[id]: /ref',
  },
  {
    description: 'reference images are not selected as inline element target',
    code: '![alt][img]text\n\n[img]: /img.png',
  },
  {
    description: 'adjacent inline elements should be separated by spaces',
    code: '- **CLI:** `--browser.ui`\n- **Config:** [browser.ui](/config/browser/ui)',
  },
  // table
  {
    description: 'should ignore leading and trailing spaces around inline elements in tables',
    code: '| Setting                 | Value                              |\n| ---------------------- | ---------------------------------- |\n| Working directory      | `/path/to/your-project-root`       |',
  },
  {
    description: 'adjacent inline elements in tables should be separated by spaces',
    code: '| Setting                 | Value                              |\n| ---------------------- | ---------------------------------- |\n| Working directory      | `/path/to/` `your-project-root`       |',
  },
]

const invalid: InvalidTestCase[] = [
  // before miss
  {
    description: 'missing space before link after chinese text',
    code: '在[入门指南](/guide/) 中，',
    output: '在 [入门指南](/guide/) 中，',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  {
    description: 'missing space before link after english text',
    code: 'In the[Getting Started](/guide/) guide,',
    output: 'In the [Getting Started](/guide/) guide,',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  // before multi
  {
    description: 'multiple spaces before link after chinese text',
    code: '在   [入门指南](/guide/) 中，',
    output: '在 [入门指南](/guide/) 中，',
    errors: [{ messageId: MESSAGE_IDS.multipleSpacesBefore }],
  },
  {
    description: 'multiple spaces before link after english text',
    code: 'In the   [Getting Started](/guide/) guide,',
    output: 'In the [Getting Started](/guide/) guide,',
    errors: [{ messageId: MESSAGE_IDS.multipleSpacesBefore }],
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
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceBefore }],
  },
  {
    description: 'unexpected space before link after opening parenthesis',
    code: 'In the ( [Getting Started](/guide/) guide)',
    output: 'In the ([Getting Started](/guide/) guide)',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceBefore }],
  },
  {
    description: 'unexpected multiple spaces before link after chinese punctuation',
    code: '在。   [入门指南](/guide/) 中，',
    output: '在。[入门指南](/guide/) 中，',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceBefore }],
  },
  // after
  {
    description: 'missing space after link before chinese text',
    code: '在 [入门指南](/guide/)中，',
    output: '在 [入门指南](/guide/) 中，',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceAfter }],
  },
  {
    description: 'missing space after link before english text',
    code: 'In the [Getting Started](/guide/)guide,',
    output: 'In the [Getting Started](/guide/) guide,',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceAfter }],
  },
  // before multi
  {
    description: 'multiple spaces after link before chinese text',
    code: '在 [入门指南](/guide/)   中，',
    output: '在 [入门指南](/guide/) 中，',
    errors: [{ messageId: MESSAGE_IDS.multipleSpacesAfter }],
  },
  {
    description: 'multiple spaces after link before english text',
    code: 'In the [Getting Started](/guide/)   guide,',
    output: 'In the [Getting Started](/guide/) guide,',
    errors: [{ messageId: MESSAGE_IDS.multipleSpacesAfter }],
  },
  // hyphen
  {
    description: 'missing space after link before dash punctuation',
    code: 'a permissive [link](/link)- node',
    output: 'a permissive [link](/link) - node',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceAfter }],
  },
  {
    description: 'multiple spaces after link before dash punctuation',
    code: 'a permissive [link](/link)   - node',
    output: 'a permissive [link](/link) - node',
    errors: [{ messageId: MESSAGE_IDS.multipleSpacesAfter }],
  },
  // after unexpect
  {
    description: 'unexpected space after link before chinese punctuation',
    code: '在 [入门指南](/guide/) ，中',
    output: '在 [入门指南](/guide/)，中',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceAfter }],
  },
  {
    description: 'unexpected multiple spaces after link before chinese punctuation',
    code: '在 [入门指南](/guide/)   ，中',
    output: '在 [入门指南](/guide/)，中',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceAfter }],
  },
  {
    description: 'unexpected multiple spaces after link before english comma',
    code: 'In the [Getting Started](/guide/)   , guide',
    output: 'In the [Getting Started](/guide/), guide',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceAfter }],
  },
  // inline element 递归情况
  {
    description: 'missing space around adjacent links',
    code: '[link1](/link1)[link2](/link2)',
    output: '[link1](/link1) [link2](/link2)',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  {
    description: 'missing space before link after inline code',
    code: '`code`[link](/link)',
    output: '`code` [link](/link)',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  // other element
  {
    description: 'missing space before link after strong text',
    code: '**strong**[link](/link)',
    output: '**strong** [link](/link)',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  {
    description: 'missing space before link after emphasis text',
    code: '_emphasis_[link](/link)',
    output: '_emphasis_ [link](/link)',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  {
    description: 'missing space before link after html element',
    code: '<span>html</span>[link](/link)',
    output: '<span>html</span> [link](/link)',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  {
    description: 'missing space before link after image',
    code: '![alt](/img.png)[link](/link)',
    output: '![alt](/img.png) [link](/link)',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  {
    description: 'missing space before link after reference link',
    code: '[ref][id][link](/link)\n\n[id]: /ref',
    output: '[ref][id] [link](/link)\n\n[id]: /ref',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  {
    description: 'missing space before link after reference image',
    code: '![alt][img][link](/link)\n\n[img]: /img.png',
    output: '![alt][img] [link](/link)\n\n[img]: /img.png',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  {
    description: 'multiple spaces before image after text',
    code: '请看   ![alt](/img.png) 示例',
    output: '请看 ![alt](/img.png) 示例',
    errors: [{ messageId: MESSAGE_IDS.multipleSpacesBefore }],
  },
  {
    description: 'missing space after image before text',
    code: '请看 ![alt](/img.png)示例',
    output: '请看 ![alt](/img.png) 示例',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceAfter }],
  },
  {
    description: 'missing space before inline code after text',
    code: '执行`pnpm test` 验证',
    output: '执行 `pnpm test` 验证',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  {
    description: 'missing space after inline code before text',
    code: '执行 `pnpm test`验证',
    output: '执行 `pnpm test` 验证',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceAfter }],
  },
  {
    description: 'missing space after inline code at beginning',
    code: '`pnpm test`验证',
    output: '`pnpm test` 验证',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceAfter }],
  },
  {
    description: 'missing space before emphasis after text',
    code: '这是*emphasis* 文本',
    output: '这是 *emphasis* 文本',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  {
    description: 'missing space after emphasis before text',
    code: '这是 *emphasis*文本',
    output: '这是 *emphasis* 文本',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceAfter }],
  },
  {
    description: 'missing space before strong after text',
    code: '这是**strong** 文本',
    output: '这是 **strong** 文本',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceBefore }],
  },
  {
    description: 'missing space after strong before text',
    code: '这是 **strong**文本',
    output: '这是 **strong** 文本',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceAfter }],
  },
  {
    description: 'missing space around adjacent selected inline elements',
    code: '_emphasis_[link](/link)`code`**strong**![alt](/img.png)',
    output: '_emphasis_ [link](/link) `code` **strong** ![alt](/img.png)',
    errors: [
      { messageId: MESSAGE_IDS.missingSpaceBefore },
      { messageId: MESSAGE_IDS.missingSpaceBefore },
      { messageId: MESSAGE_IDS.missingSpaceBefore },
      { messageId: MESSAGE_IDS.missingSpaceBefore },
    ],
  },
  {
    description: 'unexpected space before inline element after chinese punctuation',
    code: '在。 `code` 中',
    output: '在。`code` 中',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceBefore }],
  },
  {
    description: 'unexpected space after inline element before chinese punctuation',
    code: '在 `code` 。',
    output: '在 `code`。',
    errors: [{ messageId: MESSAGE_IDS.unexpectedSpaceAfter }],
  },
  {
    description: 'multiple spaces before inline element after english comma',
    code: 'In the,  `code` guide',
    output: 'In the, `code` guide',
    errors: [{ messageId: MESSAGE_IDS.multipleSpacesAfterPunctuation }],
  },
  {
    description: 'unexpected space after inline element before slash punctuation',
    code: '`not` / `!`',
    output: '`not`/`!`',
    errors: [
      { messageId: MESSAGE_IDS.unexpectedSpaceAfter },
      { messageId: MESSAGE_IDS.unexpectedSpaceBefore },
    ],
  },
  {
    description: 'missing space after inline element before dash punctuation',
    code: 'a `code`- node',
    output: 'a `code` - node',
    errors: [{ messageId: MESSAGE_IDS.missingSpaceAfter }],
  },
  {
    description: 'nested strong inside emphasis only fixes the outer inline element',
    code: '这是***重点***文本',
    output: '这是 ***重点*** 文本',
    errors: [
      { messageId: MESSAGE_IDS.missingSpaceBefore },
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
