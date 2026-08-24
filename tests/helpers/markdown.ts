import type { Link, Nodes, PhrasingContent, RootContent } from 'mdast'
import type { NodeContextReturnType } from '@/types/ast'
import { findNode, getNodeContext, isLinkNode } from '@/utils/ast'
import { parseMarkdown } from '@/utils/markdown'

/**
 * Parses a Markdown fixture and returns context for the first requested node.
 */
export function getParsedNodeContext<Current extends PhrasingContent>(
  markdown: string,
  predicate: (node: Nodes) => node is Current,
): NodeContextReturnType<Current, PhrasingContent>
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
