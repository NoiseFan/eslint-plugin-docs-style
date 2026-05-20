import type { NodeContextReturnType } from '@/types/ast'
import type { AdjacentTextContext, InlineElement, InlineElementSpaceIssue } from '@/types/inline-element'
import { MESSAGE_IDS as INLINE_SPACE_MESSAGE_IDS } from '@/rules/space-around-inline-element'
import { getLikeAnchor } from './anchor'
import { getAdjacentChar, isInlineElement, isTableCell } from './ast'
import { CLOSING_PAIRED_PUNCTUATION, isDashPunctuation, isSlashPunctuation, OPENING_PAIRED_PUNCTUATION } from './punctuation'
import { getSpaceContext } from './space'

/**
 * Checks whether adjacent text is a custom container marker on the next line.
 *
 * @deprecated Temporary workaround to prevent space-between-link from reporting
 * false positives on custom containers. Remove this and handle the case in a
 * dedicated custom container rule when one exists.
 * @see https://vitepress.dev/guide/markdown#custom-containers
 * @example `\n:::` -> true
 * @example `\n::::` -> true
 * @example `:::` -> false
 */
export function isCustomContainerMarker(str: string | undefined): boolean {
  return /^[ \t]*\n[ \t]*:{3,}[ \t]*$/u.test(str || '')
}

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
      return INLINE_SPACE_MESSAGE_IDS.unexpectedSpaceBefore
    return
  }

  // hybrid
  if (context.punctuationType === 'half') {
    return validateSingleRequiredSpace(
      context.whiteSpace.count,
      INLINE_SPACE_MESSAGE_IDS.missingSpaceBefore,
      INLINE_SPACE_MESSAGE_IDS.multipleSpacesAfterPunctuation,
    )
  }

  if (context.whiteSpace.count > 0)
    return INLINE_SPACE_MESSAGE_IDS.unexpectedSpaceBefore
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
    INLINE_SPACE_MESSAGE_IDS.missingSpaceBefore,
    INLINE_SPACE_MESSAGE_IDS.multipleSpacesBefore,
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
    return INLINE_SPACE_MESSAGE_IDS.unexpectedSpaceAfter
  }

  if (
    (context.punctuationType === 'half' && OPENING_PAIRED_PUNCTUATION.has(adjacentChar || ''))
    || isDashPunctuation(adjacentChar)
  ) {
    return validateSingleRequiredSpace(
      context.whiteSpace.count,
      INLINE_SPACE_MESSAGE_IDS.missingSpaceAfter,
      INLINE_SPACE_MESSAGE_IDS.multipleSpacesAfter,
    )
  }

  if (context.whiteSpace.count > 0)
    return INLINE_SPACE_MESSAGE_IDS.unexpectedSpaceAfter
}

/**
 * Validates the spacing between the current inline node and the next node.
 */
export function validateSpaceAfterNode(context: AdjacentTextContext): InlineElementSpaceIssue | undefined {
  if (context.hasPunctuation)
    return validateSpaceAfterPunctuation(context)

  return validateSingleRequiredSpace(
    context.whiteSpace.count,
    INLINE_SPACE_MESSAGE_IDS.missingSpaceAfter,
    INLINE_SPACE_MESSAGE_IDS.multipleSpacesAfter,
  )
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
