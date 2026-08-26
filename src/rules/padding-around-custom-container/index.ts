import type { Root } from 'mdast'
import type { ValueOf } from '@/types'
import { parseCustomContainers } from '@/parser/custom-container'
import { createRule } from '@/utils'
import { getCodeNodeRanges, getNodesIssues, MESSAGE_IDS } from './analyzs'

export const RULE_NAME = 'padding-around-custom-container'
export { MESSAGE_IDS }
type MessageIds = ValueOf<typeof MESSAGE_IDS>
type Options = []

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce padding around VitePress custom containers.',
    },
    messages: {
      missing: 'A custom container must be separated from surrounding content by one blank line.',
      unexpected: 'Unexpected blank lines around a custom container.',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      root(node: Root) {
        const source = context.sourceCode.text
        const ignoreRanges = getCodeNodeRanges(node)
        const start = node.position?.start.offset ?? 0
        const nodes = parseCustomContainers(source.slice(start))
        const edits = getNodesIssues(nodes, start)

        for (const { start, end, messageId, replacement } of edits) {
          if (ignoreRanges.some(range => start < range.end && end > range.start))
            continue

          context.report({
            node,
            messageId,
            loc: {
              start: context.sourceCode.getLocFromIndex(start),
              end: context.sourceCode.getLocFromIndex(end),
            },
            fix: fixer => fixer.replaceTextRange([start, end], replacement),
          })
        }
      },
    }
  },
})
