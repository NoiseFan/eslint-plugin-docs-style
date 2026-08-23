/**
 * AST node representing a custom Markdown container and its nested content.
 */
export interface CustomContainerAST {
  /**
   * Node discriminator for custom containers
   */
  type: 'cumstom-container'
  /**
   *  Source range covering the complete container
   */
  position: OffsetRange
  /**
   * Nesting depth within custom containers
   * @default 1
   */
  depth?: number
  /**
   * Nodes contained by this custom container
   */
  children: Array<ChildrenNode>
}

/**
 * A node that can occur inside a custom container.
 */
export type ChildrenNode = CustomContainerAST | TagNode | BlankNode | TextNode

/**
 * AST node for an opening or closing custom-container tag.
 */
export interface TagNode {
  /**
   * Whether the tag opens or closes the container
   */
  type: 'open' | 'close'
  /**
   * Original tag text as it appeared in the source
   */
  raw: string
  /**
   *  Tag content and its source range
   */
  value: { content: string } & OffsetRange
  /**
   * Optional title associated with an opening tag
   */
  title?: string
  /**
   * Source range covering the tag
   */
  position: OffsetRange
}

/**
 * Half-open character offset range in the source document.
 */
export interface OffsetRange {
  /**
   * Start offset
   */
  start: number
  /**
   * End offset
   */
  end: number
}

/**
 *  AST node representing a blank line inside a custom container.
 */
export interface BlankNode {
  /**
   *  Node discriminator for blank lines
   */
  type: 'blank'
  /**
   * Original blank-line text
   */
  value: string
  /**
   * Source range covering the blank line
   */
  position: OffsetRange
}

/**
 * AST node representing plain text inside a custom container.
 */
export interface TextNode {
  /**
   *  Node discriminator for text nodes
   */
  type: 'text'
  /**
   * Original text content
   */
  value: string
  /**
   * Source range covering the text
   */
  position: OffsetRange
}
