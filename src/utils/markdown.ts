import type { Link, Nodes, PhrasingContent, Root, RootContent } from 'mdast'
import type { NodeContextReturnType } from './ast'
import { MarkdownLanguage } from '@eslint/markdown'
import { findNode, getNodeContext, isLinkNode } from './ast'

const language = new MarkdownLanguage({ mode: 'commonmark' })

interface ParsedMarkdown {
  ast: Root
  sourceCode: ReturnType<typeof language.createSourceCode>
}

/**
 * Parses Markdown with the same CommonMark language implementation used by the
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
    languageOptions: language.defaultLanguageOptions,
  })

  if (!parseResult.ok)
    throw new Error(parseResult.errors[0]?.message ?? 'Failed to parse markdown.')

  return {
    ast: parseResult.ast,
    sourceCode: language.createSourceCode(file, parseResult),
  }
}

/**
 * Parses a Markdown fixture and returns context for the first requested node.
 *
 * This is intended for focused unit tests around utilities that operate on
 * mdast node context instead of full ESLint rule execution.
 */
export function getParsedNodeContext<Current extends RootContent>(
  markdown: string,
  predicate: (node: Nodes) => node is Current,
): NodeContextReturnType<Current, RootContent> {
  const { ast, sourceCode } = parseMarkdown(markdown)
  const node = findNode(ast, predicate)

  if (!node)
    throw new Error('Expected markdown fixture to contain the requested node.')

  return getNodeContext({ sourceCode }, node)
}

/**
 * Parses a Markdown fixture and returns context for its first link node.
 */
export function getParsedLinkContext(markdown: string): NodeContextReturnType<Link, PhrasingContent> {
  const { ast, sourceCode } = parseMarkdown(markdown)
  const link = findNode(ast, isLinkNode)

  if (!link)
    throw new Error('Expected markdown fixture to contain a link.')

  return getNodeContext({ sourceCode }, link)
}
