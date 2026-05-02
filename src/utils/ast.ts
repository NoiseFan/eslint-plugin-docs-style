import type { Link, Nodes, Paragraph, Parents, PhrasingContent, RootContent, Text } from 'mdast'
import type { NodeContextReturnType, RuleContextWithAncestors } from '../types/ast'

export type {
  NodeContextReturnType,
  RuleContextWithAncestors,
  SiblingNode,
  SourceCodeWithAncestors,
} from '../types/ast'

/* ==================== Internal guards ==================== */

/**
 * Checks whether an unknown value behaves like an mdast parent node.
 *
 * This intentionally accepts unknown values because ESLint's ancestor API does
 * not expose mdast-specific types.
 */
function hasChildren(node: unknown): node is Parents {
  return !!node && typeof node === 'object' && 'children' in node && Array.isArray(node.children)
}

/* ==================== Node type guards ==================== */

/**
 * Narrows any mdast node to a parent-like node with a children array.
 *
 * The Markdown parser can return both container nodes and leaf nodes. This
 * helper keeps traversal code type-safe without relying on a fixed list of
 * container node types.
 */
export function isParentNode(node: Nodes): node is Parents {
  return 'children' in node && Array.isArray(node.children)
}

/**
 * Narrows an mdast node to a paragraph node.
 */
export function isParagraphNode(node: Nodes | undefined): node is Paragraph {
  return node?.type === 'paragraph'
}

/**
 * Narrows an mdast node to a text node.
 */
export function isTextNode(node: Nodes | undefined): node is Text {
  return node?.type === 'text'
}

/**
 * Narrows an mdast node to a Markdown link node.
 */
export function isLinkNode(node: Nodes): node is Link {
  return node.type === 'link'
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

  if (!isParentNode(node))
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
 * Returns the current node's parent and adjacent siblings in the Markdown AST.
 */
export function getNodeContext<Current extends PhrasingContent>(
  context: RuleContextWithAncestors,
  node: Current,
): NodeContextReturnType<Current, PhrasingContent>
export function getNodeContext<Current extends RootContent>(
  context: RuleContextWithAncestors,
  node: Current,
): NodeContextReturnType<Current, RootContent>
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
