import type { Heading } from 'mdast'
import { createRule, getNodePosition } from '../../utils'
import { getLikeAnchor, hasAnchor, hasChinese, normalizeAnchor } from '../../utils/rules/anchor'

export const RULE_NAME = 'valid-heading-anchor'
const MESSAGE_IDS = {
  validHeadingAnchor: 'validHeadingAnchor',
} as const

type MessageIds = typeof MESSAGE_IDS[keyof typeof MESSAGE_IDS]
type Options = []

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Normalize non-ASCII heading anchor suffixes to lowercase, URL-safe anchors.',
    },
    messages: {
      validHeadingAnchor: 'Heading anchors must use lowercase letters, digits, and hyphens only.',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      heading(node: Heading) {
        const content = context.sourceCode.getText()
        if (!hasChinese(content) && hasAnchor(content))
          return
        const rawLikeAnchor = getLikeAnchor(content)
        if (!rawLikeAnchor)
          return

        const anchor = normalizeAnchor(rawLikeAnchor)
        if (rawLikeAnchor === anchor)
          return

        const { position, start, end } = getNodePosition(node)
        if (!position)
          return

        context.report({
          node: node as any,
          messageId: MESSAGE_IDS.validHeadingAnchor,
          fix(fixer) {
            return fixer.replaceTextRange([start, end], content.replace(/\{#[^}]+\}$/, `{#${anchor}}`))
          },
        })
      },
    }
  },
})
