/**
 * A half-open source range relative to the parsed Markdown value.
 */
export interface CustomContainerRange {
  /**
   * Inclusive start offset in JavaScript string code units.
   */
  start: number
  /**
   * Exclusive end offset in JavaScript string code units.
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
 * The opening tag of a VitePress custom container.
 */
export interface CustomContainerOpeningTag {
  /**
   * The complete opening tag text.
   */
  raw: string
  /**
   * The source range of the complete opening tag.
   */
  position: CustomContainerRange
  /**
   * The container type and its source range.
   */
  type: CustomContainerTagValue
  /**
   * The optional title and its source range.
   */
  title: CustomContainerTagValue | null
}

/**
 * The closing tag of a VitePress custom container.
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
 * A parsed VitePress custom container.
 */
export interface CustomContainerNode {
  /**
   * The container type, such as `info` or `warning`.
   */
  type: string
  /**
   * The container content without its boundary line break.
   */
  content: string
  /**
   * The source tags that delimit the container.
   */
  tag: CustomContainerTag
}

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
}
