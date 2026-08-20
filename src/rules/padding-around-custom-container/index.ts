import type { Code, Root } from 'mdast'
import type { ValueOf } from '@/types'
import type { CustomContainerRange } from '@/types/custom-container'
import { createRule } from '@/utils'
import { getNodePosition } from '@/utils/ast'
import { getCustomContainerPaddingIssues } from '@/utils/custom-container'

export const RULE_NAME = 'padding-around-custom-container'
export const MESSAGE_IDS = {
  missing: 'missing',
  unexpected: 'unexpected',
} as const
type Options = []
type MessageIds = ValueOf<typeof MESSAGE_IDS>

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Require consistent blank lines around VitePress custom containers.',
    },
    messages: {
      missing: 'Expected exactly one blank line around this custom container.',
      unexpected: 'Unexpected blank line inside this custom container.',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const ignoredRanges: CustomContainerRange[] = []

    return {
      code(node: Code) {
        const { position, start, end } = getNodePosition(node)
        /* v8 ignore if -- @preserve */
        if (!position)
          return

        ignoredRanges.push({ start, end })
      },
      'root:exit': (node: Root) => {
        const { position } = getNodePosition(node)
        /* v8 ignore if -- @preserve */
        if (!position)
          return

        for (const issue of getCustomContainerPaddingIssues(context.sourceCode.text, ignoredRanges)) {
          context.report({
            node,
            messageId: issue.kind,
            loc: {
              start: context.sourceCode.getLocFromIndex(issue.tag.start),
              end: context.sourceCode.getLocFromIndex(issue.tag.end),
            },
            fix: fixer => fixer.replaceTextRange(
              [issue.range.start, issue.range.end],
              issue.replacement,
            ),
          })
        }
      },
    }
  },
})
