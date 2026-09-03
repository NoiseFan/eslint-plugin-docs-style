import type { Code, InlineCode, Link, Nodes, Paragraph, Parents, PhrasingContent, RootContent, TableCell, Text } from 'mdast'
import type { NodeContextReturnType, NodePositionReturnType, RuleContextWithAncestors } from '@/types/ast'
import type { PositionOptions } from '@/types/text'
import type { TextToken } from '@/types/text/tokenizer'

export function isObject(val: unknown): val is object {
  return !!val && typeof val === 'object'
}

/* ==================== Node type guards ==================== */

type NodeWithUndefined = Nodes | undefined

/**
 * Checks whether an unknown value behaves like an mdast parent node.
 *
 * This intentionally accepts unknown values because ESLint's ancestor API does
 * not expose mdast-specific types.
 */
export function hasChildren(node: NodeWithUndefined | unknown): node is Parents {
  return isObject(node) && 'children' in node && Array.isArray(node.children)
}

/**
 * Narrows an mdast node to a paragraph node.
 */
export function isParagraphNode(node: NodeWithUndefined): node is Paragraph {
  return node?.type === 'paragraph'
}

/**
 * Narrows an mdast node to a text node.
 */
export function isTextNode(node: NodeWithUndefined): node is Text {
  return node?.type === 'text'
}

/**
 * Narrows an mdast node to a Markdown link node.
 */
export function isLinkNode(node: NodeWithUndefined): node is Link {
  return node?.type === 'link'
}

export function isCodeNode(node: NodeWithUndefined): node is Code {
  return node?.type === 'code'
}

export function isInlineCodeNode(node: NodeWithUndefined): node is InlineCode {
  return node?.type === 'inlineCode'
}

export function isTableCell(node: NodeWithUndefined): node is TableCell {
  return node?.type === 'tableCell'
}

/* ==================== Tree traversal ==================== */

/**
 * Finds the first node that matches the predicate by walking the tree
 * depth-first from the provided node.
 */
export function findNode<Found extends Nodes>(
  node: Nodes,
  predicate: (node: Nodes) => node is Found,
): Found | undefined {
  if (predicate(node))
    return node

  if (!hasChildren(node))
    return undefined

  for (const child of node.children) {
    const found = findNode(child, predicate)
    if (found)
      return found
  }

  return undefined
}

/* ==================== Context helpers ==================== */

/**
 * Extracts the plain-text value of a phrasing node.
 * If the node does not expose `value`, recursively concatenates the text from its children.
 */
export function getNodeValue(
  node: PhrasingContent | undefined,
): string | undefined {
  if (!node)
    return
  if ('value' in node)
    return node.value
  if (hasChildren(node))
    return node.children.map(getNodeValue).join('')
}

/**
 * Gets the start and end offsets for a node.
 */
export function getNodePosition(node: Nodes): NodePositionReturnType {
  const start = node.position?.start.offset
  const end = node.position?.end.offset

  /* v8 ignore if -- @preserve */
  if (start == null || end == null)
    return { position: false, start: 0, end: 0 }

  return { position: true, start, end }
}

/**
 * Returns the current node's parent and adjacent siblings in the Markdown AST.
 */
export function getNodeContext<Current extends RootContent>(
  context: RuleContextWithAncestors,
  node: Current,
): NodeContextReturnType<Current>
export function getNodeContext(
  context: RuleContextWithAncestors,
  node: RootContent,
): NodeContextReturnType {
  const parent = context.sourceCode.getAncestors(node).at(-1)

  if (!hasChildren(parent))
    return { prev: undefined, next: undefined, current: node }

  const currentIndex = parent.children.findIndex(child => child === node)

  if (currentIndex === -1)
    return { parent, prev: undefined, next: undefined, current: node }

  return {
    parent,
    prev: parent.children[currentIndex - 1],
    next: parent.children[currentIndex + 1],
    current: node,
  }
}

/**
 * Returns the current node and adjacent siblings from a known children array.
 * Useful when iterating a tokenized child list directly without an ESLint ancestor context.
 */
export function getNodeContextByParent<Current>(
  childrenNodes: readonly Current[],
  currentIndex: number,
): {
  prev: Current | undefined
  current: Current | undefined
  next: Current | undefined
} {
  return {
    prev: childrenNodes[currentIndex - 1],
    current: childrenNodes[currentIndex],
    next: childrenNodes[currentIndex + 1],
  }
}

export type TokenContext = ReturnType<typeof getNodeContextByParent<TextToken>>

/**
 * Gets the first or last visible character of a string after trimming
 * surrounding whitespace.
 */
export function getAdjacentChar(
  str: string | undefined,
  position: PositionOptions,
): string | undefined {
  if (!str)
    return undefined

  str = str.trim()
  return position === 'head' ? str[0] : str[str.length - 1]
}
