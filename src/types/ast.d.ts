import type { Parents, PhrasingContent, RootContent } from 'mdast'

/**
 * The resolved source position of a node.
 */
export interface NodePositionReturnType {
  /**
   * Whether the node has a complete position.
   */
  position: boolean
  /**
   * The start offset of the node.
   */
  start: number
  /**
   * The end offset of the node.
   */
  end: number
}

export type SiblingNode<Current extends RootContent = RootContent> = Current extends PhrasingContent
  ? PhrasingContent
  : RootContent

/**
 * The current node together with its parent and adjacent siblings.
 */
export interface NodeContextReturnType<
  Current extends RootContent = RootContent,
  Sibling extends RootContent = SiblingNode<Current>,
> {
  parent?: Parents
  /**
   * The previous sibling node.
   */
  prev?: Sibling
  /**
   * The next sibling node.
   */
  next?: Sibling
  /**
   * The current node.
   */
  current: Current
}

export interface SourceCodeWithAncestors {
  getAncestors: (node: RootContent) => unknown[]
}

export interface RuleContextWithAncestors {
  sourceCode: SourceCodeWithAncestors
}
