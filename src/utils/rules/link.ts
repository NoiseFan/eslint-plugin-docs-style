import type { LinkSpaceContext, LinkSpaceIssue } from '../../types'

const LEFT_PUNCTUATION = new Set(['(', '[', '{', '<', '（', '【', '《', '“', '‘', '，', '。', '！', '？', '：', '；', '、'])

const RIGHT_PUNCTUATION = new Set([')', ']', '}', '>', ',', '.', '!', '?', ':', ';', '）', '】', '》', '”', '’', '，', '。', '！', '？', '：', '；', '、'])

function isWhitespace(char: string | undefined): boolean {
  return !!char && /\s/.test(char)
}

function isLeftPunctuation(char: string | undefined): boolean {
  return !!char && LEFT_PUNCTUATION.has(char)
}

function isRightPunctuation(char: string | undefined): boolean {
  return !!char && RIGHT_PUNCTUATION.has(char)
}

/**
 * Returns whether the character before a link requires exactly one space.
 * @example: `在 [link](/link)` and `foo [link](/link)`.
 */
export function needsSpaceBeforeLink(char: string | undefined): boolean {
  if (!char)
    return false

  return !isWhitespace(char) && !isLeftPunctuation(char)
}

/**
 * Returns whether the character after a link requires exactly one space.
 * @example: `[link](/link) 中` and `[link](/link) guide`.
 */
export function needsSpaceAfterLink(char: string | undefined): boolean {
  if (!char)
    return false

  return !isWhitespace(char) && !isRightPunctuation(char)
}

function findPreviousNonSpaceIndex(str: string, index: number): number {
  for (let i = index; i >= 0; i--) {
    if (!isWhitespace(str[i]))
      return i
  }
  return -1
}

function findNextNonSpaceIndex(str: string, index: number): number {
  for (let i = index; i < str.length; i++) {
    if (!isWhitespace(str[i]))
      return i
  }
  return -1
}

/**
 * Returns the `[start, end)` offset range of the first Markdown inline link.
 */
export function getLinkRange(str: string): [number, number] | null {
  const match = /\[[^\]]+\]\([^)]+\)/.exec(str)
  if (!match || match.index === undefined)
    return null

  return [match.index, match.index + match[0].length]
}

export function validLinkSpace(str: string): boolean {
  const range = getLinkRange(str)
  if (!range)
    return true

  const [start, end] = range
  return getLinkSpaceIssue(str, start, end) == null
}

/**
 * Collects the nearest non-space characters around a link and the raw space ranges
 * adjacent to it, so callers can both validate and autofix spacing.
 * @example: in `foo  [link](/link)  bar`, both adjacent space ranges have length 2.
 */
export function getLinkSpaceContext(source: string, start: number, end: number): LinkSpaceContext {
  const beforeIndex = findPreviousNonSpaceIndex(source, start - 1)
  const afterIndex = findNextNonSpaceIndex(source, end)
  const beforeSpaceStart = beforeIndex + 1
  const beforeSpaceEnd = start
  const afterSpaceStart = end
  const afterSpaceEnd = afterIndex >= 0 ? afterIndex : end

  return {
    beforeIndex,
    afterIndex,
    beforeSpaceStart,
    beforeSpaceEnd,
    afterSpaceStart,
    afterSpaceEnd,
    beforeChar: beforeIndex >= 0 ? source[beforeIndex] : undefined,
    afterChar: afterIndex >= 0 ? source[afterIndex] : undefined,
    hasSpaceBefore: isWhitespace(source[start - 1]),
    hasSpaceAfter: isWhitespace(source[end]),
  }
}

/**
 * Resolves the concrete spacing issue around a link.
 * Rules:
 * - normal text around a link requires exactly one space
 * - compact punctuation around a link requires zero spaces
 */
export function getLinkSpaceIssue(source: string, start: number, end: number): LinkSpaceIssue | null {
  const context = getLinkSpaceContext(source, start, end)
  const beforeSpaceLength = context.beforeSpaceEnd - context.beforeSpaceStart
  const afterSpaceLength = context.afterSpaceEnd - context.afterSpaceStart

  if (needsSpaceBeforeLink(context.beforeChar) && !context.hasSpaceBefore)
    return 'missingSpaceBeforeLink'

  if (needsSpaceBeforeLink(context.beforeChar) && beforeSpaceLength > 1)
    return 'multipleSpacesBeforeLink'

  if (isLeftPunctuation(context.beforeChar) && context.hasSpaceBefore)
    return 'unexpectedSpaceBeforeLink'

  if (needsSpaceAfterLink(context.afterChar) && !context.hasSpaceAfter)
    return 'missingSpaceAfterLink'

  if (needsSpaceAfterLink(context.afterChar) && afterSpaceLength > 1)
    return 'multipleSpacesAfterLink'

  if (isRightPunctuation(context.afterChar) && context.hasSpaceAfter)
    return 'unexpectedSpaceAfterLink'

  return null
}
