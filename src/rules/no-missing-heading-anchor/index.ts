import type { Heading } from 'mdast'
import { createRule } from '../../utils'
import { getLikeAnchor, hasAnchor, hasChinese, normalizeAnchor } from '../../utils/rules/anchor'

export const RULE_NAME = 'no-missing-heading-anchor'

const MESSAGE_IDS = 'missingAnchor'

type Options = []

export default createRule<Options, typeof MESSAGE_IDS>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Non-ASCII heading must have an anchor',
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
            messageId: MESSAGE_IDS,
          })
          return
        }

        context.report({
          node: node as any,
          messageId: MESSAGE_IDS,
          fix(fixer) {
            const start = node.position!.start.offset!
            const end = node.position!.end.offset!
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
