export interface CustomContainerAST {
  type: 'cumstom-container'
  /**
   * Nesting depth
   * @default 1
   */
  depth?: number
  /**
   * Children nodes
   */
  children: Array<ChildrenNode>
}

export type ChildrenNode = CustomContainerAST | TagNode | BlankNode | TextNode

export interface TagNode {
  type: 'open' | 'close'
  raw: string
  value: string
  title?: string
}

export interface BlankNode {
  type: 'blank'
  value: string
}

export interface TextNode {
  type: 'text'
  value: string
}
