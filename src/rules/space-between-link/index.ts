import type { Link } from 'mdast'
import { createRule, getNodePosition } from '../../utils'
import { getNodeContext } from '../../utils/ast'
import { getSpaceContext, LINK_SPACE_MESSAGE_IDS as MESSAGE_IDS, validateSpace } from '../../utils/rules/link'

export const RULE_NAME = 'space-between-link'

type MessageIds = typeof MESSAGE_IDS[keyof typeof MESSAGE_IDS]
type Options = []

const BEFORE_LINK_MESSAGE_IDS = new Set<MessageIds>([
  MESSAGE_IDS.missingSpaceBeforeLink,
  MESSAGE_IDS.multipleSpacesBeforeLink,
  MESSAGE_IDS.multipleSpacesAfterPunctuation,
  MESSAGE_IDS.unexpectedSpaceBeforeLink,
])

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce spacing around Markdown links: one space next to text, no spaces next to punctuation.',
    },
    messages: {
      missingSpaceBeforeLink: 'A space is required before the link.',
      missingSpaceAfterLink: 'A space is required after the link.',
      multipleSpacesBeforeLink: 'Use exactly one space before the link.',
      multipleSpacesAfterLink: 'Use exactly one space after the link.',
      multipleSpacesAfterPunctuation: 'Use one space after punctuation.',
      unexpectedSpaceBeforeLink: 'Do not add a space between punctuation and the link.',
      unexpectedSpaceAfterLink: 'Do not add a space between the link and punctuation.',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      link(node: Link) {
        const { position, start, end } = getNodePosition(node)
        if (!position)
          return

        const nodeContext = getNodeContext(context, node)
        const spaceContext = getSpaceContext(nodeContext)

        const messageId = validateSpace(nodeContext)
        if (!messageId)
          return

        if (BEFORE_LINK_MESSAGE_IDS.has(messageId) && spaceContext.prev) {
          const { count } = spaceContext.prev.whiteSpace
          const replaceText = messageId === MESSAGE_IDS.unexpectedSpaceBeforeLink ? '' : ' '

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
          const replaceText = messageId === MESSAGE_IDS.unexpectedSpaceAfterLink ? '' : ' '
          context.report({
            node,
            messageId,
            fix(fixer) {
              return fixer.replaceTextRange([end, end + count], replaceText)
            },
          })
        }
      },
    }
  },
})
