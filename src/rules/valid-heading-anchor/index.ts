import { createRule, getNodePosition } from '../../utils'
import { calcAnchorPositionCompensate, getLikeAnchor, hasChinese, isStrictAnchor, normalizeAnchor } from '../../utils/rules/anchor'

export const RULE_NAME = 'valid-heading-anchor'
const MESSAGE_IDS = {
  missingAnchor: 'missingAnchor',
  invalidHeadingAnchor: 'invalidHeadingAnchor',
} as const
type Options = []
type MessageIds = typeof MESSAGE_IDS[keyof typeof MESSAGE_IDS]

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: '',
    },
    messages: {
      missingAnchor: 'Non-ASCII heading must have an anchor in the format "{#lowercase-anchor}".',
      invalidHeadingAnchor: 'invalidHeadingAnchor',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      heading(node) {
        const { position, start, end } = getNodePosition(node)
        if (!position)
          return

        const content = context.sourceCode.text.slice(start, end)
        if (isStrictAnchor(content) || !hasChinese(content))
          return

        const liked = getLikeAnchor(content)
        if (!liked) {
          context.report({
            node: node as any,
            messageId: MESSAGE_IDS.missingAnchor,
          })
          return
        }
        const { rawLikeAnchor, isLikeAnchor } = liked

        const compensate = calcAnchorPositionCompensate(content)
        const remainingContent = content.slice(0, -rawLikeAnchor.length - compensate).trim()

        const anchor = normalizeAnchor(rawLikeAnchor)
        if (rawLikeAnchor === anchor)
          return

        context.report({
          node: node as any,
          messageId: isLikeAnchor ? MESSAGE_IDS.missingAnchor : MESSAGE_IDS.invalidHeadingAnchor,
          fix(fixer) {
            return fixer.replaceTextRange([start, end], `${remainingContent} {#${anchor}}`)
          },
        })
      },
    }
  },
})
