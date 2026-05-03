import { createRule, getNodePosition } from '../../utils'
import { calcAnchorPositionCompensate, getLikeAnchor, hasChinese, isStrictAnchor, normalizeAnchor } from '../../utils/rules/anchor'
import { isFrontmatter } from '../../utils/rules/heading'

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
      description: 'Require strict lowercase anchors for headings that contain CJK text.',
    },
    messages: {
      missingAnchor: 'Non-ASCII heading must have an anchor in the format "{#lowercase-anchor}".',
      invalidHeadingAnchor: 'Anchor must use lowercase letters and valid characters only.',
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

        const source = context.sourceCode.text.slice(start, end)
        if (isStrictAnchor(source) || !hasChinese(source) || isFrontmatter(source))
          return

        const liked = getLikeAnchor(source)
        if (!liked) {
          context.report({
            node,
            messageId: MESSAGE_IDS.missingAnchor,
          })
          return
        }
        const { rawLikeAnchor, isLikeAnchor } = liked

        const compensate = calcAnchorPositionCompensate(source)
        const remainingContent = source.slice(0, -rawLikeAnchor.length - compensate).trim()

        const anchor = normalizeAnchor(rawLikeAnchor)
        if (rawLikeAnchor === anchor)
          return

        context.report({
          node,
          messageId: isLikeAnchor ? MESSAGE_IDS.missingAnchor : MESSAGE_IDS.invalidHeadingAnchor,
          fix(fixer) {
            return fixer.replaceTextRange([start, end], `${remainingContent} {#${anchor}}`)
          },
        })
      },
    }
  },
})
