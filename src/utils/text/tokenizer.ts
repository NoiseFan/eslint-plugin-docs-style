import type { Text } from 'mdast'
import type { ValueOf } from '@/types'
import type { TextAst, TextPoint, TextPosition, TextToken } from '@/types/text/tokenizer'
import { isDashPunctuation, isFullwidthPunctuation, isHalfwidthPunctuation } from '../punctuation'

export const TEXT_TYPE = {
  'cjk': 'cjk',
  'latin': 'latin',
  'number': 'number',
  'space': 'space',
  'newline': 'newline',
  'fullwidth-punctuation': 'fullwidth-punctuation',
  'halfwidth-punctuation': 'halfwidth-punctuation',
  'dash': 'dash',
  'symbol': 'symbol',
  'emoji': 'emoji',
  'invisible': 'invisible',
  'other': 'other',
} as const

export type TextType = ValueOf<typeof TEXT_TYPE>

const CJK_RE = /^\p{Script=Han}$|^\p{Script=Hiragana}$|^\p{Script=Katakana}$|^\p{Script=Hangul}$/u
const LATIN_RE = /^\p{Script=Latin}$/u
const NUMBER_RE = /^\p{Number}$/u
const SYMBOL_RE = /^\p{Symbol}$/u
const EMOJI_RE = /^\p{Extended_Pictographic}$/u
const SPACE_RE = /^[\t\v\f \u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]$/u
const NEWLINE_RE = /^[\n\r\u2028\u2029]$/u
const INVISIBLE_CODE_POINTS = new Set([
  0x00AD,
  0x034F,
  0x061C,
  0x115F,
  0x1160,
  0x17B4,
  0x17B5,
  0x180E,
  0xFEFF,
  0xFFA0,
])

/**
 * Checks whether the character is an invisible Unicode control or filler.
 * These characters affect rendering, cursor movement, or text direction but
 * should not be treated as visible spacing, punctuation, or symbols.
 */
function isInvisible(char: string): boolean {
  const codePoint = char.codePointAt(0)

  return codePoint != null && (
    INVISIBLE_CODE_POINTS.has(codePoint)
    || (codePoint >= 0x200B && codePoint <= 0x200F)
    || (codePoint >= 0x202A && codePoint <= 0x202E)
    || (codePoint >= 0x2060 && codePoint <= 0x206F)
  )
}

export function isLatinWordType(type: string | undefined): boolean {
  return type === TEXT_TYPE.latin
}

export function isNumberType(type: string | undefined): boolean {
  return type === TEXT_TYPE.number
}

function isNumber(char: string, prev: TextToken | undefined): boolean {
  return NUMBER_RE.test(char) || (prev?.type === TEXT_TYPE.number && (char === '.' || char === '%'))
}

const TEXT_TYPE_MATCHERS = [
  { type: TEXT_TYPE.newline, test: (char: string) => NEWLINE_RE.test(char) },
  { type: TEXT_TYPE.space, test: (char: string) => SPACE_RE.test(char) },
  { type: TEXT_TYPE.invisible, test: (char: string) => isInvisible(char) },
  { type: TEXT_TYPE.cjk, test: (char: string) => CJK_RE.test(char) },
  { type: TEXT_TYPE.latin, test: (char: string) => LATIN_RE.test(char) },
  { type: TEXT_TYPE.number, test: isNumber },
  { type: TEXT_TYPE.dash, test: (char: string) => isDashPunctuation(char) },
  { type: TEXT_TYPE['fullwidth-punctuation'], test: (char: string) => isFullwidthPunctuation(char) },
  { type: TEXT_TYPE['halfwidth-punctuation'], test: (char: string) => isHalfwidthPunctuation(char) },
  { type: TEXT_TYPE.emoji, test: (char: string) => EMOJI_RE.test(char) },
  { type: TEXT_TYPE.symbol, test: (char: string) => SYMBOL_RE.test(char) },
] as const satisfies readonly {
  type: TextType
  test: (char: string, prev: TextToken | undefined) => boolean
}[]

const DEFAULT_START_POINT = {
  line: 1,
  column: 1,
  offset: 0,
} as const satisfies TextPoint

function advancePoint(point: TextPoint, char: string): TextPoint {
  if (NEWLINE_RE.test(char)) {
    return {
      line: point.line + 1,
      column: 1,
      offset: point.offset + char.length,
    }
  }

  return {
    line: point.line,
    column: point.column + char.length,
    offset: point.offset + char.length,
  }
}

/**
 * Classifies a single Unicode code point for Markdown text style rules.
 */
export function getTextType(char: string, prev?: TextToken): TextType {
  for (const matcher of TEXT_TYPE_MATCHERS) {
    if (matcher.test(char, prev))
      return matcher.type
  }

  return TEXT_TYPE.other
}

/**
 * Tokenizes text into consecutive typed runs while preserving source positions.
 */
export function tokenizeText(value: string, start: TextPoint = DEFAULT_START_POINT): TextToken[] {
  const tokens: TextToken[] = []
  let point = start
  let prevToken: undefined | TextToken

  for (const char of value) {
    const type = getTextType(char, prevToken)
    const tokenStart = point
    const tokenEnd = advancePoint(point, char)

    if (prevToken?.type === type) {
      prevToken.value += char
      prevToken.position.end = tokenEnd
    }
    else {
      prevToken = {
        type,
        value: char,
        position: {
          start: tokenStart,
          end: tokenEnd,
        },
      }
      tokens.push(prevToken)
    }

    point = tokenEnd
  }

  return tokens
}

/**
 * Converts an mdast text node into a tokenized text AST with normalized source positions.
 */
export function buildTextNodeAst(node: Text): TextAst {
  const start = node.position?.start
  const end = node.position?.end
  const position: TextPosition = {
    start: {
      line: start?.line ?? DEFAULT_START_POINT.line,
      column: start?.column ?? DEFAULT_START_POINT.column,
      offset: start?.offset ?? DEFAULT_START_POINT.offset,
    },
    end: {
      line: end?.line ?? DEFAULT_START_POINT.line,
      column: end?.column ?? DEFAULT_START_POINT.column + node.value.length,
      offset: end?.offset ?? DEFAULT_START_POINT.offset + node.value.length,
    },
  }

  return {
    type: 'text',
    value: node.value,
    position,
    children: tokenizeText(node.value, position.start),
    node,
  }
}
