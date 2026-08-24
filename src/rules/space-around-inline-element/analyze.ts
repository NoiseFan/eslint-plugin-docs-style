import type { Parents, PhrasingContent } from 'mdast'
import type { SpaceContext } from './space-types'
import type { AdjacentTextContext, InlineElement, InlineElementSpaceIssue } from './types'
import type { NodeContextReturnType } from '@/types/ast'
import { getAdjacentChar, getNodeValue, isTableCell } from '@/parser/ast'
import { isCustomContainerMarker } from '@/parser/custom-container'
import { getLikeAnchor } from '@/utils/anchor'
import {
  CLOSING_PAIRED_PUNCTUATION,
  hasPunctuation,
  isDashPunctuation,
  isFullwidthPunctuation,
  isSlashPunctuation,
  OPENING_PAIRED_PUNCTUATION,
} from '@/utils/punctuation'
import { getWhiteSpace } from '@/utils/space'

/**
 * Validates whether a spacing run contains exactly one required space.
 */
export function validateSingleRequiredSpace<T extends InlineElementSpaceIssue>(
  count: number,
  missingSpaceMessageId: T,
  multipleSpacesMessageId: T,
): T | undefined {
  if (count < 1)
    return missingSpaceMessageId
  if (count > 1)
    return multipleSpacesMessageId
}

/**
 * Validates spacing before an inline node when the previous character is punctuation.
 */
export function validateBeforePunctuation(
  context: AdjacentTextContext,
): InlineElementSpaceIssue | undefined {
  const adjacentChar = getAdjacentChar(context.value, 'tail')
  if (OPENING_PAIRED_PUNCTUATION.has(adjacentChar || '') || isSlashPunctuation(adjacentChar)) {
    if (context.whiteSpace.count > 0)
      return 'unexpected-space-before'
    return
  }

  // hybrid
  if (context.punctuationType === 'half') {
    return validateSingleRequiredSpace(
      context.whiteSpace.count,
      'missing-space-before',
      'multiple-spaces-after-punctuation',
    )
  }

  if (context.whiteSpace.count > 0)
    return 'unexpected-space-before'
}

/**
 * Validates the spacing between the previous node and the current inline node.
 */
export function validateSpaceBeforeNode(
  context: AdjacentTextContext,
): InlineElementSpaceIssue | undefined {
  if (context.hasPunctuation)
    return validateBeforePunctuation(context)

  return validateSingleRequiredSpace(
    context.whiteSpace.count,
    'missing-space-before',
    'multiple-spaces-before',
  )
}

/**
 * Validates spacing after an inline node when the next character is punctuation.
 */
export function validateSpaceAfterPunctuation(context: AdjacentTextContext): InlineElementSpaceIssue | undefined {
  const adjacentChar = getAdjacentChar(context.value, 'head')

  if (getLikeAnchor(context.value) || isCustomContainerMarker(context.value))
    return

  if (
    CLOSING_PAIRED_PUNCTUATION.has(adjacentChar || '')
    && context.whiteSpace.count > 0
  ) {
    return 'unexpected-space-after'
  }

  if (
    (context.punctuationType === 'half' && OPENING_PAIRED_PUNCTUATION.has(adjacentChar || ''))
    || isDashPunctuation(adjacentChar)
  ) {
    return validateSingleRequiredSpace(
      context.whiteSpace.count,
      'missing-space-after',
      'multiple-spaces-after',
    )
  }

  if (context.whiteSpace.count > 0)
    return 'unexpected-space-after'
}

/**
 * Validates the spacing between the current inline node and the next node.
 */
export function validateSpaceAfterNode(context: AdjacentTextContext): InlineElementSpaceIssue | undefined {
  if (context.hasPunctuation)
    return validateSpaceAfterPunctuation(context)

  return validateSingleRequiredSpace(
    context.whiteSpace.count,
    'missing-space-after',
    'multiple-spaces-after',
  )
}

const INLINE_ELEMENT_TYPES = new Set(['link', 'image', 'inlineCode', 'emphasis', 'strong'])

/**
 * Checks whether a phrasing node is one of the selected inline element targets.
 */
export function isInlineElement(node: PhrasingContent | Parents | undefined): node is InlineElement {
  return !!node && INLINE_ELEMENT_TYPES.has(node.type)
}

/**
 * Checks whether the current inline element is nested inside another selected inline element.
 */
export function isNestedInlineElement(nodeContext: NodeContextReturnType<InlineElement>): boolean {
  const { parent } = nodeContext
  return isInlineElement(parent)
}

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

/**
 * Validates spacing around an inline element inside a table cell.
 * Table cells skip checks when the next sibling is another inline element.
 */
function validateTableCellSpace(nodeContext: NodeContextReturnType<InlineElement>): InlineElementSpaceIssue | undefined {
  const { prev, next } = getSpaceContext(nodeContext)
  if (prev && prev.value) {
    const beforeIssue = validateSpaceBeforeNode(prev)
    if (beforeIssue)
      return beforeIssue
  }

  if (!next || isInlineElement(nodeContext.next) || !next.value)
    return

  return validateSpaceAfterNode(next)
}

/**
 * Validates spacing around an inline element in the default text flow.
 */
function validateDefaultSpace(nodeContext: NodeContextReturnType<InlineElement>): InlineElementSpaceIssue | undefined {
  const { prev, next } = getSpaceContext(nodeContext)

  if (prev && nodeContext.prev) {
    const beforeIssue = validateSpaceBeforeNode(prev)
    if (beforeIssue)
      return beforeIssue
  }

  if (!next || isInlineElement(nodeContext.next) || !nodeContext.next)
    return

  return validateSpaceAfterNode(next)
}

/**
 * Validates spacing around an inline element by delegating to the appropriate strategy
 * for table cells or the default text flow.
 * - Regular text and selected inline elements should be separated by one space.
 * - Fullwidth punctuation and paired punctuation usually touch inline elements without spaces.
 * - Adjacent selected inline elements are handled by the following element to avoid duplicate fixes.
 */
export function validateSpace(nodeContext: NodeContextReturnType<InlineElement>): InlineElementSpaceIssue | undefined {
  const { parent } = nodeContext
  if (parent && isTableCell(parent))
    return validateTableCellSpace(nodeContext)

  return validateDefaultSpace(nodeContext)
}
