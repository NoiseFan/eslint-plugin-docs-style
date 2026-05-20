import type { PhrasingContent } from 'mdast'
import type { NodeContextReturnType } from '@/types/ast'
import type { PositionOptions } from '@/types/inline-element'
import type { SpaceContext, WhiteSpaceReturn } from '@/types/space'
import { getAdjacentChar, getNodeValue } from './ast'
import { hasPunctuation, isFullwidthPunctuation } from './punctuation'

export const SPACE_MESSAGE_IDS = {
  missingSpaceBefore: 'missingSpaceBefore',
  missingSpaceAfter: 'missingSpaceAfter',
  missingSpacesAround: 'missingSpacesAround',
  unexpectedSpaceBefore: 'unexpectedSpaceBefore',
  unexpectedSpaceAfter: 'unexpectedSpaceAfter',
  unexpectedSpaceAround: 'unexpectedSpaceAround',
} as const

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

/**
 * Gets whitespace and punctuation information for text adjacent to a link or inline code node.
 */
export function getSpaceContext(
  nodeContext: NodeContextReturnType<PhrasingContent>,
): SpaceContext {
  const { prev, next } = nodeContext
  const prevValue = getNodeValue(prev)
  const nextValue = getNodeValue(next)

  return {
    prev: {
      value: prevValue,
      whiteSpace: getWhiteSpace(prevValue, 'tail'),
      hasPunctuation: hasPunctuation(prevValue, 'tail'),
      punctuationType: isFullwidthPunctuation(getAdjacentChar(prevValue, 'tail')) ? 'full' : 'half',
    },
    next: {
      value: nextValue,
      whiteSpace: getWhiteSpace(nextValue),
      hasPunctuation: hasPunctuation(nextValue),
      punctuationType: isFullwidthPunctuation(getAdjacentChar(nextValue, 'head')) ? 'full' : 'half',
    },
  }
}
