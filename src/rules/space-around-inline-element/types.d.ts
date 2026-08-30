import type { Emphasis, Image, InlineCode, Link, Strong } from 'mdast'
import type { WhiteSpaceReturn } from '@/types/text'

/**
 * The Markdown inline element node types selected by space-around-inline-element.
 */
export type InlineElement = Link | Image | InlineCode | Emphasis | Strong

export type InlineElementSpaceIssue
  = | 'missing-space-before'
    | 'missing-space-after'
    | 'multiple-spaces-before'
    | 'multiple-spaces-after'
    | 'multiple-spaces-after-punctuation'
    | 'unexpected-space-before'
    | 'unexpected-space-after'

/**
 * The text context adjacent to a link.
 */
export interface AdjacentTextContext {
  /**
   * The neighboring text value, if any.
   */
  value: string | undefined
  /**
   * The neighboring whitespace node.
   */
  whiteSpace: WhiteSpaceReturn
  /**
   * Whether the adjacent text contains punctuation.
   */
  hasPunctuation: boolean
  /**
   * The punctuation classification.
   */
  punctuationType: 'full' | 'half'
}
