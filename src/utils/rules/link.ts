import type { InlineCode, Link } from 'mdast'
import type { NodeContextReturnType } from '../ast'
import { isTextNode } from '../ast'

export const LINK_SPACE_MESSAGE_IDS = {
  missingSpaceBeforeLink: 'missingSpaceBeforeLink',
  missingSpaceAfterLink: 'missingSpaceAfterLink',
  multipleSpacesBeforeLink: 'multipleSpacesBeforeLink',
  multipleSpacesAfterLink: 'multipleSpacesAfterLink',
  multipleSpacesAfterPunctuation: 'multipleSpacesAfterPunctuation',
  unexpectedSpaceBeforeLink: 'unexpectedSpaceBeforeLink',
  unexpectedSpaceAfterLink: 'unexpectedSpaceAfterLink',
} as const

export type LinkSpaceIssue = typeof LINK_SPACE_MESSAGE_IDS[keyof typeof LINK_SPACE_MESSAGE_IDS]

type PositionOptions = 'head' | 'tail'

/**
 * 是否是全角符号
 */
export function isFullwidthPunctuation(str: string | undefined): boolean {
  if (!str || typeof str !== 'string' || str.length !== 1)
    return false
  return /^[\u3001-\u303F\uFE10-\uFE1F\uFE30-\uFE4F\uFF01-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65“”‘’…]$/u.test(str)
}
const HALFWIDTH_PUNCTUATION_RE = /^\p{P}$/u

/**
 * 是否是半角符号
 *
 */
export function isHalfwidthPunctuation(str: string | undefined): boolean {
  if (!str || typeof str !== 'string' || str.length !== 1)
    return false
  return str.charCodeAt(0) <= 0x7E && HALFWIDTH_PUNCTUATION_RE.test(str)
}

const PUNCTUATION_RE = /^\p{P}$/u

/**
 * 是否是标点符号
 * 包含全角符号、半角符号、数学符号、货币符号
 */
export function isPunctuation(str: string): boolean {
  if (typeof str !== 'string' || str.length !== 1)
    return false

  return PUNCTUATION_RE.test(str)
}

interface whiteSpaceReturn {
  count: number
  start: number
  end: number
}

/**
 * 获取空格数量及其空格所在位置的相对节点
 */
export function getWhiteSpace(str: string | undefined, position: PositionOptions = 'head'): whiteSpaceReturn {
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
    if (!match || !match.index)
      return defaultVal
    return {
      count: match[0].length,
      start: match.index,
      end: str.length,
    }
  }
}

export function hasPunctuation(str: string | undefined, position: PositionOptions = 'head'): boolean {
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

function getAdjacentChar(str: string | undefined, position: PositionOptions): string | undefined {
  if (!str)
    return undefined

  str = str.trim()
  return position === 'head' ? str[0] : str[str.length - 1]
}

interface AdjacentTextContext {
  value: string | undefined
  whiteSpace: whiteSpaceReturn
  hasPunctuation: boolean
  punctuationType: 'full' | 'half'
}
export interface SpaceContext {
  prev?: AdjacentTextContext
  next?: AdjacentTextContext
}

export function getSpaceContext(nodeContext: NodeContextReturnType<Link | InlineCode>): SpaceContext {
  const { prev, next } = nodeContext
  const prevValue = isTextNode(prev) ? prev.value : undefined
  const nextValue = isTextNode(next) ? next.value : undefined
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

export function validateSpace(nodeContext: NodeContextReturnType<Link>): LinkSpaceIssue | undefined {
  const { prev, next } = nodeContext
  const spaceContext = getSpaceContext(nodeContext)

  if (!prev || !spaceContext.prev)
    return

  if (spaceContext.prev.hasPunctuation) {
    if (spaceContext.prev.punctuationType === 'half') {
      if (spaceContext.prev.whiteSpace.count < 1)
        return LINK_SPACE_MESSAGE_IDS.missingSpaceBeforeLink
      if (spaceContext.prev.whiteSpace.count > 1)
        return LINK_SPACE_MESSAGE_IDS.multipleSpacesAfterPunctuation
    }
    else if (spaceContext.prev.whiteSpace.count > 0) {
      return LINK_SPACE_MESSAGE_IDS.unexpectedSpaceBeforeLink
    }
  }
  else {
    if (spaceContext.prev.whiteSpace.count < 1)
      return LINK_SPACE_MESSAGE_IDS.missingSpaceBeforeLink
    if (spaceContext.prev.whiteSpace.count > 1)
      return LINK_SPACE_MESSAGE_IDS.multipleSpacesBeforeLink
  }

  if (!next || !spaceContext.next)
    return
  if (spaceContext.next.hasPunctuation) {
    if (spaceContext.next.whiteSpace.count > 0)
      return LINK_SPACE_MESSAGE_IDS.unexpectedSpaceAfterLink
  }
  else {
    if (spaceContext.next.whiteSpace.count < 1)
      return LINK_SPACE_MESSAGE_IDS.missingSpaceAfterLink
    if (spaceContext.next.whiteSpace.count > 1)
      return LINK_SPACE_MESSAGE_IDS.multipleSpacesAfterLink
  }
}
