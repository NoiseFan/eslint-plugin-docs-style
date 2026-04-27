import type { Heading } from 'mdast'
import { createRule } from '../../utils'
import { getLikeAnchor, hasAnchor, hasChinese } from './utils'

export const RULE_NAME = 'valid-heading-anchor'

type MESSAGE_IDS = 'missingAnchor'

type Options = []

function getNodeText(node: any): string {
  if (typeof node?.value === 'string')
    return node.value

  if (Array.isArray(node?.children))
    return node.children.map(getNodeText).join('')

  return ''
}

export default createRule<Options, MESSAGE_IDS>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce valid title anchors in headings.',
    },
    messages: {
      missingAnchor: 'Non-ASCII heading must have an anchor in the format "{# lowercase-anchor}".',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      heading(node: Heading) {
        const content = getNodeText(node)
        if (!hasChinese(content) || hasAnchor(content))
          return

        const likeAnchor = getLikeAnchor(content)
        if (!likeAnchor) {
          context.report({
            node: node as any,
            messageId: 'missingAnchor',
          })
          return
        }

        context.report({
          node: node as any,
          messageId: 'missingAnchor',
          fix(fixer) {
            const start = node.children[0].position!.start.offset!
            const end = node.children.at(-1)!.position!.end.offset!
            const rawHeadingText = context.sourceCode.getText().slice(start, end)
            const rawLikeAnchor = getLikeAnchor(rawHeadingText) ?? likeAnchor

            const anchor = likeAnchor
              .toLowerCase()
              .replace(/`/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
            const headingContent = rawHeadingText.slice(0, -rawLikeAnchor.length - 2)

            return fixer.replaceTextRange([start, end], `${headingContent} {#${anchor}}`)
          },
        })
      },
    }
  },
})
