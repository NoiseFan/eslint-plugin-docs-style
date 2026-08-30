import type { Root } from 'mdast'
import type { ValueOf } from '@/types/utils'
import { getNodePosition } from '@/parser/ast'
import { getCodeNodeRanges, parseCustomContainers } from '@/parser/custom-container'
import { createRule } from '@/utils'
import { getNodesIssues } from './analyzs'

export const RULE_NAME = 'padding-around-custom-container'

export const MESSAGE_IDS = {
  missing: 'missing',
  unexpected: 'unexpected',
} as const
export type MessageIds = ValueOf<typeof MESSAGE_IDS>
export type Mode = 'compact' | 'loose'
type Options = [Mode?]

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
    schema: [{ enum: ['compact', 'loose'] }],
  },
  defaultOptions: ['loose'],
  create(context) {
    return {
      root(node: Root) {
        const { position, start } = getNodePosition(node)
        /* v8 ignore if -- @preserve */
        if (!position)
          return

        const source = context.sourceCode.text
        const ignoreRanges = getCodeNodeRanges(node)
        const nodes = parseCustomContainers(source.slice(start))
        const [mode] = context.options
        const issues = getNodesIssues(nodes, { offset: start, ignoreRanges, mode })

        for (const { start, end, messageId, replacement } of issues) {
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
