import type { Text } from 'mdast'
import type { Position } from '../ast'

export type TextType
  = | 'cjk'
    | 'latin'
    | 'number'
    | 'space'
    | 'newline'
    | 'fullwidth-punctuation'
    | 'halfwidth-punctuation'
    | 'dash'
    | 'symbol'
    | 'emoji'
    | 'invisible'
    | 'other'

export interface TextToken {
  /**
   * Token category
   */
  type: TextType
  /**
   * Original token text
   */
  value: string
  /**
   * Token position in the source text
   */
  position: Position
}

export interface TextAst {
  /**
   * AST node type
   */
  type: 'text'
  /**
   * Original text content
   */
  value: string
  /**
   * Back-reference to the mdast text node when available
   */
  node?: Text
  /**
   * Node position in the source text
   */
  position: Position
  /**
   * Tokenized children derived from the text content
   */
  children: TextToken[]
}
