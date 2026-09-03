import type { RootContent } from 'mdast'
import { parseMarkdown } from '@/parser/markdown'

/**
 * Returns true when the Markdown document starts with YAML frontmatter.
 */
export function hasFrontmatter(markdown: string, prevNode?: RootContent): boolean {
  if (prevNode?.type === 'thematicBreak')
    markdown = `---\n${markdown}`

  const { ast } = parseMarkdown(markdown)
  return ast.children[0]?.type === 'yaml'
}
