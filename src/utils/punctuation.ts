import type { PositionOptions } from '@/types'

export const OPENING_PAIRED_PUNCTUATION = new Set(['(', '[', '{', '<', '（', '【', '《', '“', '‘'])
export const CLOSING_PAIRED_PUNCTUATION = new Set([')', ']', '}', '>', '）', '】', '》', '”', '’'])

/**
 * Checks whether the character is a slash used as a path-like separator.
 */
export function isSlashPunctuation(str: string | undefined): boolean {
  return str === '/'
}

/**
 * Checks whether the character is fullwidth punctuation.
 * @example `。` -> true
 * @example `,` -> false
 */
export function isFullwidthPunctuation(str: string | undefined): boolean {
  if (!str || str.length !== 1)
    return false
  return /^[\u3001-\u303F\uFE10-\uFE1F\uFE30-\uFE4F\uFF01-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65“”‘’…]$/u.test(str)
}

const HALFWIDTH_PUNCTUATION_RE = /^\p{P}$/u

/**
 * Checks whether the character is halfwidth punctuation.
 * @example `,` -> true
 * @example `，` -> false
 */
export function isHalfwidthPunctuation(str: string | undefined): boolean {
  if (!str || str.length !== 1)
    return false
  return str.charCodeAt(0) <= 0x7E && HALFWIDTH_PUNCTUATION_RE.test(str)
}

const DASH_PUNCTUATION_RE = /^[-\u2013\u2014\u2212]$/u

/**
 * Checks whether the character is hyphen-like punctuation.
 * @example `—` -> true
 * @example `.` -> false
 */
export function isDashPunctuation(str: string | undefined): boolean {
  if (!str || str.length !== 1)
    return false

  return DASH_PUNCTUATION_RE.test(str)
}

const PUNCTUATION_RE = /^\p{P}$/u

/**
 * Checks whether the character is punctuation.
 * Covers fullwidth punctuation, halfwidth punctuation, and other Unicode punctuation characters.
 * @example `。` -> true
 * @example `$` -> false
 */
export function isPunctuation(str: string): boolean {
  if (!str || str.length !== 1)
    return false

  return PUNCTUATION_RE.test(str)
}

/**
 * Checks whether the start or end of a string is adjacent to punctuation.
 * @example `。 hello`, `head` -> true
 * @example `hello .`, `tail` -> true
 */
export function hasPunctuation(
  str: string | undefined,
  position: PositionOptions = 'head',
): boolean {
  if (!str)
    return false
  str = str.trim()
  if (position === 'head') {
    return isPunctuation(str[0])
  }
  else {
    return isPunctuation(str[str.length - 1])
  }
}
