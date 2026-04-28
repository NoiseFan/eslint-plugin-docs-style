import type { Heading } from 'mdast'
import { createRule, getNodePosition } from '../../utils'
import { getLikeAnchor, hasAnchor, hasChinese, normalizeAnchor } from '../../utils/rules/anchor'

export const RULE_NAME = 'no-missing-heading-anchor'

const MESSAGE_IDS = {
  missingAnchor: 'missingAnchor',
} as const

type MessageIds = typeof MESSAGE_IDS[keyof typeof MESSAGE_IDS]

type Options = []

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Require anchors for headings that contain Chinese characters.',
    },
    messages: {
      missingAnchor: 'Non-ASCII heading must have an anchor in the format "{#lowercase-anchor}".',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      heading(node: Heading) {
        const content = context.sourceCode.getText()
        if (!hasChinese(content) || hasAnchor(content))
          return

        const likeAnchor = getLikeAnchor(content)
        if (!likeAnchor) {
          context.report({
            node: node as any,
            messageId: MESSAGE_IDS.missingAnchor,
          })
          return
        }

        const { position, start, end } = getNodePosition(node)
        if (!position)
          return

        context.report({
          node: node as any,
          messageId: MESSAGE_IDS.missingAnchor,
          fix(fixer) {
            const rawLikeAnchor = getLikeAnchor(content) ?? likeAnchor

            const anchor = normalizeAnchor(rawLikeAnchor)
            const headingContent = content.slice(0, -rawLikeAnchor.length - 2)

            return fixer.replaceTextRange([start, end], `${headingContent} {#${anchor}}`)
          },
        })
      },
    }
  },
})
