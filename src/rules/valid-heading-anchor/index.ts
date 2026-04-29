import type { Heading } from 'mdast'
import { createRule, getNodePosition } from '../../utils'
import { getAnchor, hasAnchor, hasChinese, hasExplicitAnchor, normalizeAnchor } from '../../utils/rules/anchor'
import { isFrontmatter, isHeading } from '../../utils/rules/heading'

export const RULE_NAME = 'valid-heading-anchor'
const MESSAGE_IDS = {
  invalidHeadingAnchor: 'invalidHeadingAnchor',
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
      invalidHeadingAnchor: 'Heading anchors must use lowercase letters, digits, hyphens, and underscores only.',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const content = context.sourceCode.text

    return {
      heading(node: Heading) {
        const { position, start, end } = getNodePosition(node)
        if (!position)
          return

        if (isFrontmatter(content) || !isHeading(content))
          return

        if (!hasExplicitAnchor(content))
          return

        if (!hasChinese(content) && hasAnchor(content))
          return
        const rawAnchor = getAnchor(content)
        if (!rawAnchor)
          return

        const anchor = normalizeAnchor(rawAnchor)
        if (rawAnchor === anchor)
          return

        context.report({
          node: node as any,
          messageId: MESSAGE_IDS.invalidHeadingAnchor,
          fix(fixer) {
            return fixer.replaceTextRange([start, end], content.replace(/\{#[^}]+\}$/, `{#${anchor}}`))
          },
        })
      },
    }
  },
})
