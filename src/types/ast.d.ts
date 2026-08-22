import type { Parents, PhrasingContent, RootContent } from 'mdast'

/**
 * Source location range for a token or auxiliary text AST node
 */
export interface Position {
  /**
   * Inclusive start point
   */
  start: PositionParam
  /**
   * Exclusive end point
   */
  end: PositionParam
}

/**
 * Source location point compatible with mdast position points
 */
export interface PositionParam {
  /**
   * Line number
   * @default 1
   */
  line: number
  /**
   * column number
   * @default 1
   */
  column: number
  /**
   * offset in JavaScript string code units
   * @default 0
   */
  offset: number
}

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
