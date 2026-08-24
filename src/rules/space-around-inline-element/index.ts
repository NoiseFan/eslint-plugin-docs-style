import type { Emphasis, Image, InlineCode, Link, Strong } from 'mdast'
import type { InlineElement, InlineElementSpaceIssue } from './types'
import type { RuleContext, ValueOf } from '@/types'
import { getNodeContext, getNodePosition } from '@/parser/ast'
import { createRule } from '@/utils'
import { getSpaceContext, isNestedInlineElement, validateSpace } from './analyze'

export const RULE_NAME = 'space-around-inline-element'
export const MESSAGE_IDS = {
  missingSpaceBefore: 'missingSpaceBefore',
  missingSpaceAfter: 'missingSpaceAfter',
  multipleSpacesBefore: 'multipleSpacesBefore',
  multipleSpacesAfter: 'multipleSpacesAfter',
  multipleSpacesAfterPunctuation: 'multipleSpacesAfterPunctuation',
  unexpectedSpaceBefore: 'unexpectedSpaceBefore',
  unexpectedSpaceAfter: 'unexpectedSpaceAfter',
} as const
type MessageIds = ValueOf<typeof MESSAGE_IDS>
type Options = []

const ISSUE_TO_MESSAGE_ID: Record<InlineElementSpaceIssue, MessageIds> = {
  'missing-space-before': MESSAGE_IDS.missingSpaceBefore,
  'missing-space-after': MESSAGE_IDS.missingSpaceAfter,
  'multiple-spaces-before': MESSAGE_IDS.multipleSpacesBefore,
  'multiple-spaces-after': MESSAGE_IDS.multipleSpacesAfter,
  'multiple-spaces-after-punctuation': MESSAGE_IDS.multipleSpacesAfterPunctuation,
  'unexpected-space-before': MESSAGE_IDS.unexpectedSpaceBefore,
  'unexpected-space-after': MESSAGE_IDS.unexpectedSpaceAfter,
}

const BEFORE_INLINE_ELEMENT_MESSAGE_IDS = new Set<MessageIds>([
  MESSAGE_IDS.missingSpaceBefore,
  MESSAGE_IDS.multipleSpacesBefore,
  MESSAGE_IDS.multipleSpacesAfterPunctuation,
  MESSAGE_IDS.unexpectedSpaceBefore,
])

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce spacing around Markdown inline elements.',
    },
    messages: {
      missingSpaceBefore: 'A space is required before the inline element.',
      missingSpaceAfter: 'A space is required after the inline element.',
      multipleSpacesBefore: 'Use exactly one space before the inline element.',
      multipleSpacesAfter: 'Use exactly one space after the inline element.',
      multipleSpacesAfterPunctuation: 'Use one space after punctuation.',
      unexpectedSpaceBefore: 'Do not add a space between punctuation and the inline element.',
      unexpectedSpaceAfter: 'Do not add a space between the inline element and punctuation.',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      link(node: Link) {
        checkInlineElement(context, node)
      },
      image(node: Image) {
        checkInlineElement(context, node)
      },
      inlineCode(node: InlineCode) {
        checkInlineElement(context, node)
      },
      emphasis(node: Emphasis) {
        checkInlineElement(context, node)
      },
      strong(node: Strong) {
        checkInlineElement(context, node)
      },
    }
  },
})

/**
 * Checks one selected inline element and reports the fix range around it.
 */
function checkInlineElement(context: RuleContext<MessageIds, Options>, node: InlineElement): void {
  const { position, start, end } = getNodePosition(node)
  /* v8 ignore if -- @preserve */
  if (!position)
    return

  const nodeContext = getNodeContext(context, node)
  if (isNestedInlineElement(nodeContext))
    return

  const spaceContext = getSpaceContext(nodeContext)
  const issue = validateSpace(nodeContext)
  if (!issue)
    return

  const messageId = ISSUE_TO_MESSAGE_ID[issue]

  if (BEFORE_INLINE_ELEMENT_MESSAGE_IDS.has(messageId) && spaceContext.prev) {
    const { count } = spaceContext.prev.whiteSpace
    const replaceText = messageId === MESSAGE_IDS.unexpectedSpaceBefore ? '' : ' '

    context.report({
      node,
      messageId,
      fix(fixer) {
        return fixer.replaceTextRange([start - count, start], replaceText)
      },
    })
    return
  }

  if (spaceContext.next) {
    const { count } = spaceContext.next.whiteSpace
    const replaceText = messageId === MESSAGE_IDS.unexpectedSpaceAfter ? '' : ' '

    context.report({
      node,
      messageId,
      fix(fixer) {
        return fixer.replaceTextRange([end, end + count], replaceText)
      },
    })
  }
}
