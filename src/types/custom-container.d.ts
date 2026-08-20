/**
 * A ahalf-open source range relative to the parsed Markdown value.
 */
export interface CustomContainerRange {
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
 * A parsed value together with its source range.
 */
export interface CustomContainerTagValue extends CustomContainerRange {
  /**
   * The parsed value.
   */
  value: string
}

/**
 * The opening tag of a custom container.
 */
export interface CustomContainerOpeningTag {
  /**
   * The complete opening tag text.
   */
  content: string
  /**
   * The source range of the complete opening tag.
   */
  position: CustomContainerRange
  /**
   * The container type and its source range.
   */
  type: string
  /**
   * The optional title and its source range.
   */
  title: CustomContainerTagValue | null
}

/**
 * The closing tag of a custom container.
 */
export interface CustomContainerClosingTag extends CustomContainerRange {
  /**
   * The complete closing tag text.
   */
  raw: string
}

/**
 * The opening and closing tags that delimit a custom container.
 */
export interface CustomContainerTag {
  /**
   * The opening tag.
   */
  open: CustomContainerOpeningTag
  /**
   * The closing tag, or `null` when the container is unclosed.
   */
  close: CustomContainerClosingTag | null
}

/**
 * Parsed custom container AST
 */
export interface CustomContainerNode {
  /**
   * Container type
   * @example `info`, `warning`
   */
  type: string
  /**
   * The container content without its boundary line break.
   */
  content: string
  /**
   * Child containers and normalized blank-line nodes.
   */
  children?: CustomContainerChild[]
  /**
   * Nesting depth
   * @default 1
   */
  depth?: number
  /**
   * The source tags that delimit the container.
   */
  tag: CustomContainerTag
}

export interface CustomContainerBlankLineNode {
  type: 'blank-line'
  value: string
  length: number
  position?: CustomContainerRange
}

export type CustomContainerChild = CustomContainerNode | CustomContainerBlankLineNode

/**
 * Internal container state retained while parsing nested containers.
 */
export interface PendingCustomContainer extends CustomContainerNode {
  /**
   * The number of marker characters in the opening tag.
   */
  markerLength: number
  /**
   * The offset where the container content begins.
   */
  contentStart: number
  containerType: string
  parent?: PendingCustomContainer
}

export type CustomContainerPaddingIssueKind
  = | 'missing'
    | 'unexpected'

/**
 * A source edit needed to normalize whitespace next to a container marker.
 */
export interface CustomContainerPaddingIssue {
  /**
   * The violated container boundary.
   */
  kind: CustomContainerPaddingIssueKind
  /**
   * The whitespace range to replace.
   */
  range: CustomContainerRange
  /**
   * The normalized line breaks for the whitespace range.
   */
  replacement: string
  /**
   * The container marker range used when reporting the issue.
   */
  tag: CustomContainerRange
}
