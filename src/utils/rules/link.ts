import type { InlineCode, Link, PhrasingContent } from 'mdast'
import type { LinkSpaceIssue, PositionOptions, SpaceContext } from '../../types/link'
import type { NodeContextReturnType } from '../ast'
import { isParentNode } from '../ast'

export const LINK_SPACE_MESSAGE_IDS = {
  missingSpaceBeforeLink: 'missingSpaceBeforeLink',
  missingSpaceAfterLink: 'missingSpaceAfterLink',
  multipleSpacesBeforeLink: 'multipleSpacesBeforeLink',
  multipleSpacesAfterLink: 'multipleSpacesAfterLink',
  multipleSpacesAfterPunctuation: 'multipleSpacesAfterPunctuation',
  unexpectedSpaceBeforeLink: 'unexpectedSpaceBeforeLink',
  unexpectedSpaceAfterLink: 'unexpectedSpaceAfterLink',
} as const

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

interface whiteSpaceReturn {
  count: number
  start: number
  end: number
}

/**
 * Gets the count and range of consecutive whitespace at the start or end of a string.
 * @example `  text`, `head` -> { count: 2, start: 0, end: 2 }
 * @example `text  `, `tail` -> { count: 2, start: 4, end: 6 }
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
 * Checks whether the start or end of a string is adjacent to punctuation.
 * @example `。 hello`, `head` -> true
 * @example `hello .`, `tail` -> true
 */
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

/**
 * Gets the character adjacent to the start or end of a string.
 */
function getAdjacentChar(str: string | undefined, position: PositionOptions): string | undefined {
  if (!str)
    return undefined

  str = str.trim()
  return position === 'head' ? str[0] : str[str.length - 1]
}

type AdjacentTextContext = NonNullable<SpaceContext['prev']>

/**
 * Extracts the plain-text value of a phrasing node.
 * If the node does not expose `value`, recursively concatenates the text from its children.
 */
function getNodeValue(node: PhrasingContent | undefined): string | undefined {
  if (!node)
    return
  if ('value' in node)
    return node.value
  if (isParentNode(node)) {
    const value = node.children
      .map(getNodeValue)
      .join('')

    return value || undefined
  }
}

/**
 * Gets whitespace and punctuation information for text adjacent to a link or inline code node.
 */
export function getSpaceContext(nodeContext: NodeContextReturnType<Link | InlineCode>): SpaceContext {
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

/**
 * Validates whether a spacing run contains exactly one required space.
 */
function validateSingleRequiredSpace(
  count: number,
  missingSpaceMessageId: LinkSpaceIssue,
  multipleSpacesMessageId: LinkSpaceIssue,
): LinkSpaceIssue | undefined {
  if (count < 1)
    return missingSpaceMessageId
  if (count > 1)
    return multipleSpacesMessageId
}

/**
 * Validates the spacing before a link when the previous character is punctuation.
 */
function validateSpaceBeforeLinkAfterPunctuation(context: AdjacentTextContext): LinkSpaceIssue | undefined {
  if (context.punctuationType === 'half') {
    return validateSingleRequiredSpace(
      context.whiteSpace.count,
      LINK_SPACE_MESSAGE_IDS.missingSpaceBeforeLink,
      LINK_SPACE_MESSAGE_IDS.multipleSpacesAfterPunctuation,
    )
  }

  if (context.whiteSpace.count > 0)
    return LINK_SPACE_MESSAGE_IDS.unexpectedSpaceBeforeLink
}

/**
 * Validates the spacing between the previous node and the current link.
 */
function validateSpaceBeforeLink(context: AdjacentTextContext): LinkSpaceIssue | undefined {
  if (context.hasPunctuation)
    return validateSpaceBeforeLinkAfterPunctuation(context)

  return validateSingleRequiredSpace(
    context.whiteSpace.count,
    LINK_SPACE_MESSAGE_IDS.missingSpaceBeforeLink,
    LINK_SPACE_MESSAGE_IDS.multipleSpacesBeforeLink,
  )
}

/**
 * Validates the spacing after a link when the next character is punctuation.
 */
function validateSpaceAfterLinkBeforePunctuation(context: AdjacentTextContext): LinkSpaceIssue | undefined {
  if (isDashPunctuation(getAdjacentChar(context.value, 'head'))) {
    return validateSingleRequiredSpace(
      context.whiteSpace.count,
      LINK_SPACE_MESSAGE_IDS.missingSpaceAfterLink,
      LINK_SPACE_MESSAGE_IDS.multipleSpacesAfterLink,
    )
  }

  if (context.whiteSpace.count > 0)
    return LINK_SPACE_MESSAGE_IDS.unexpectedSpaceAfterLink
}

/**
 * Validates the spacing between the current link and the next node.
 */
function validateSpaceAfterLink(context: AdjacentTextContext): LinkSpaceIssue | undefined {
  if (context.hasPunctuation)
    return validateSpaceAfterLinkBeforePunctuation(context)

  return validateSingleRequiredSpace(
    context.whiteSpace.count,
    LINK_SPACE_MESSAGE_IDS.missingSpaceAfterLink,
    LINK_SPACE_MESSAGE_IDS.multipleSpacesAfterLink,
  )
}

/**
 * Validates whether the spacing around a link node follows the typography rules.
 * - Regular text and links should be separated by a single space.
 * - Fullwidth punctuation usually touches the link without spaces.
 * - Halfwidth punctuation, hyphens, and similar cases are handled by dedicated rules.
 */
export function validateSpace(nodeContext: NodeContextReturnType<Link>): LinkSpaceIssue | undefined {
  const { prev, next } = nodeContext
  const spaceContext = getSpaceContext(nodeContext)

  if (!prev || !spaceContext.prev)
    return

  const beforeLinkIssue = validateSpaceBeforeLink(spaceContext.prev)
  if (beforeLinkIssue)
    return beforeLinkIssue

  if (!next || !spaceContext.next)
    return

  return validateSpaceAfterLink(spaceContext.next)
}
