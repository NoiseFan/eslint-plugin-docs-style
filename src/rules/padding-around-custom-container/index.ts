import type { Root } from 'mdast'
import type { ValueOf } from '@/types'
import { parseCustomContainers } from '@/parser/custom-container'
import { createRule } from '@/utils'
import { collectEdits, getCodeRanges, MESSAGE_IDS } from './analyzs'

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
        const codeRanges = getCodeRanges(node)
        const start = node.position?.start.offset ?? 0
        const ast = parseCustomContainers(source.slice(start))
        const edits = collectEdits(ast, start)
        const seen = new Set<string>()

        for (const edit of edits) {
          if (codeRanges.some(range => edit.start < range.end && edit.end > range.start))
            continue

          const key = `${edit.start}:${edit.end}:${edit.replacement}`
          if (seen.has(key))
            continue
          seen.add(key)

          context.report({
            node,
            messageId: edit.messageId,
            loc: {
              start: context.sourceCode.getLocFromIndex(edit.start),
              end: context.sourceCode.getLocFromIndex(edit.end),
            },
            fix: fixer => fixer.replaceTextRange([edit.start, edit.end], edit.replacement),
          })
        }
      },
    }
  },
})
