import type { Link } from 'mdast'
import { createRule, getNodePosition } from '../../utils'
import { getLinkSpaceContext, getLinkSpaceIssue } from '../../utils/rules/link'

export const RULE_NAME = 'space-between-link'
const MESSAGE_IDS = {
  missingSpaceBeforeLink: 'missingSpaceBeforeLink',
  missingSpaceAfterLink: 'missingSpaceAfterLink',
  multipleSpacesBeforeLink: 'multipleSpacesBeforeLink',
  multipleSpacesAfterLink: 'multipleSpacesAfterLink',
  unexpectedSpaceBeforeLink: 'unexpectedSpaceBeforeLink',
  unexpectedSpaceAfterLink: 'unexpectedSpaceAfterLink',
} as const

type MessageIds = typeof MESSAGE_IDS[keyof typeof MESSAGE_IDS]
type Options = []

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
      unexpectedSpaceBeforeLink: 'Do not add a space between punctuation and the link.',
      unexpectedSpaceAfterLink: 'Do not add a space between the link and punctuation.',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const source = context.sourceCode.text

    return {
      link(node: Link) {
        const { position, start, end } = getNodePosition(node)
        if (!position)
          return

        const issue = getLinkSpaceIssue(source, start, end)
        if (!issue)
          return

        const ctx = getLinkSpaceContext(source, start, end)

        if (issue === MESSAGE_IDS.missingSpaceBeforeLink) {
          context.report({
            node: node as any,
            messageId: MESSAGE_IDS.missingSpaceBeforeLink,
            fix(fixer) {
              return fixer.insertTextBeforeRange([start, start], ' ')
            },
          })
          return
        }

        if (issue === MESSAGE_IDS.multipleSpacesBeforeLink) {
          context.report({
            node: node as any,
            messageId: MESSAGE_IDS.multipleSpacesBeforeLink,
            fix(fixer) {
              return fixer.replaceTextRange([ctx.beforeSpaceStart, ctx.beforeSpaceEnd], ' ')
            },
          })
          return
        }

        if (issue === MESSAGE_IDS.unexpectedSpaceBeforeLink) {
          context.report({
            node: node as any,
            messageId: MESSAGE_IDS.unexpectedSpaceBeforeLink,
            fix(fixer) {
              return fixer.removeRange([ctx.beforeSpaceStart, ctx.beforeSpaceEnd])
            },
          })
          return
        }

        if (issue === MESSAGE_IDS.missingSpaceAfterLink) {
          context.report({
            node: node as any,
            messageId: MESSAGE_IDS.missingSpaceAfterLink,
            fix(fixer) {
              return fixer.insertTextAfterRange([end, end], ' ')
            },
          })
          return
        }

        if (issue === MESSAGE_IDS.multipleSpacesAfterLink) {
          context.report({
            node: node as any,
            messageId: MESSAGE_IDS.multipleSpacesAfterLink,
            fix(fixer) {
              return fixer.replaceTextRange([ctx.afterSpaceStart, ctx.afterSpaceEnd], ' ')
            },
          })
          return
        }

        if (issue === MESSAGE_IDS.unexpectedSpaceAfterLink) {
          context.report({
            node: node as any,
            messageId: MESSAGE_IDS.unexpectedSpaceAfterLink,
            fix(fixer) {
              return fixer.removeRange([ctx.afterSpaceStart, ctx.afterSpaceEnd])
            },
          })
        }
      },
    }
  },
})
