import type { Root } from 'mdast'
import type { ValueOf } from '@/types'
import { getNodePosition } from '@/parser/ast'
import { getCodeNodeRanges } from '@/rules/padding-around-custom-container/analyzs'
import { createRule } from '@/utils'
import { CUSTOM_CONTAINER_MARKER_MESSAGE_IDS, getCustomContainerMarkerIssues } from './analyzs'

export const RULE_NAME = 'space-around-custom-container'
export const MESSAGE_IDS = CUSTOM_CONTAINER_MARKER_MESSAGE_IDS
type MessageIds = ValueOf<typeof MESSAGE_IDS>

export default createRule<[], MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: { description: 'Enforce spacing around VitePress custom-container markers.' },
    messages: {
      unexpectedIndentation: 'Do not indent a custom-container marker.',
      missingSeparator: 'Add one space between the opening fence and its type.',
      unexpectedSeparator: 'Use exactly one space between the opening fence and its type.',
      unexpectedTrailingSpace: 'Remove trailing spaces from a custom-container closing marker.',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      root(node: Root) {
        const { position } = getNodePosition(node)
        if (!position)
          return
        const source = context.sourceCode.text
        const issues = getCustomContainerMarkerIssues(source, getCodeNodeRanges(node))
        for (const issue of issues) {
          context.report({
            node,
            messageId: issue.messageId,
            loc: {
              start: context.sourceCode.getLocFromIndex(issue.start),
              end: context.sourceCode.getLocFromIndex(issue.end),
            },
            fix: fixer => fixer.replaceTextRange([issue.start, issue.end], issue.replacement),
          })
        }
      },
    }
  },
})
