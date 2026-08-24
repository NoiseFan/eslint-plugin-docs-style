import type { PositionOptions, WhiteSpaceReturn } from '@/types'

/**
 * Gets the count and range of consecutive whitespace at the start or end of a string.
 * @example `  text`, `head` -> { count: 2, start: 0, end: 2 }
 * @example `text  `, `tail` -> { count: 2, start: 4, end: 6 }
 */
export function getWhiteSpace(
  str: string | undefined,
  position: PositionOptions = 'head',
): WhiteSpaceReturn {
  const defaultVal = { count: 0, start: 0, end: 0 }
  if (!str || str.length === 0)
    return defaultVal
  if (position === 'head') {
    const match = str.match(/^\s+/)
    if (!match || !match[0])
      return defaultVal
    return {
      count: match[0].length,
      start: 0,
      end: match[0].length,
    }
  }
  else {
    const match = str.match(/\s+$/)
    if (!match || match.index == null)
      return defaultVal
    return {
      count: match[0].length,
      start: match.index,
      end: str.length,
    }
  }
}
