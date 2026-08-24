import type { Root } from 'mdast'
import { MarkdownLanguage } from '@eslint/markdown'

const language = new MarkdownLanguage({ mode: 'gfm' })

interface ParsedMarkdown {
  ast: Root
  sourceCode: ReturnType<typeof language.createSourceCode>
}

/**
 * Parses Markdown with the same GFM language implementation used by the
 * plugin tests and returns both the mdast tree and ESLint SourceCode wrapper.
 */
export function parseMarkdown(markdown: string): ParsedMarkdown {
  const file = {
    path: 'test.md',
    physicalPath: 'test.md',
    bom: false,
    body: markdown,
  }
  const parseResult = language.parse(file, {
    languageOptions: {
      ...language.defaultLanguageOptions,
      frontmatter: 'yaml',
    },
  })

  /* v8 ignore if -- @preserve */
  if (!parseResult.ok)
    throw new Error(parseResult.errors[0]?.message ?? 'Failed to parse markdown.')

  return {
    ast: parseResult.ast,
    sourceCode: language.createSourceCode(file, parseResult),
  }
}
