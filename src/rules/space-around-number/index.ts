import type { Text } from 'mdast'
import type { ValueOf } from '@/types'
import { fixBoundarySpace, getBoundarySpaceMessageId } from '@/rules/shared/text-boundary-spacing'
import { createRule } from '@/utils'

export const RULE_NAME = 'space-around-number'
export const MESSAGE_IDS = {
  missingSpaceBefore: 'missingSpaceBefore',
  missingSpaceAfter: 'missingSpaceAfter',
  missingSpacesAround: 'missingSpacesAround',
  unexpectedSpaceBefore: 'unexpectedSpaceBefore',
  unexpectedSpaceAfter: 'unexpectedSpaceAfter',
  unexpectedSpaceAround: 'unexpectedSpaceAround',
} as const

type MessageIds = ValueOf<typeof MESSAGE_IDS>

type Options = []

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a single space between CJK characters and numbers.',
    },
    messages: {
      missingSpaceBefore: 'Add a space before the number.',
      missingSpaceAfter: 'Add a space after the number.',
      missingSpacesAround: 'Add spaces before and after the number.',
      unexpectedSpaceBefore: 'Remove the unexpected space before the number.',
      unexpectedSpaceAfter: 'Remove the unexpected space after the number.',
      unexpectedSpaceAround: 'Remove the unexpected spaces around the number.',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      text(node: Text) {
        const { fixed, missingBefore, missingAfter, unexpectedBefore, unexpectedAfter } = fixBoundarySpace(node, type => type === 'number')

        if (fixed === node.value)
          return

        context.report({
          node,
          messageId: getBoundarySpaceMessageId({ missingBefore, missingAfter, unexpectedBefore, unexpectedAfter }),
          fix(fixer) {
            return fixer.replaceText(node, fixed)
          },
        })
      },
    }
  },
})
