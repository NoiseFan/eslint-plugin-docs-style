import type { Text } from 'mdast'
import type { ValueOf } from '@/types'
import type { SPACE_MESSAGE_IDS as MESSAGE_IDS } from '@/utils/space'
import { createRule } from '@/utils'
import { fixBoundarySpace, getBoundarySpaceMessageId, isLatinWordType } from '@/utils/text'

export const RULE_NAME = 'space-around-word'

type MessageIds = ValueOf<typeof MESSAGE_IDS>

type Options = []

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a single space between CJK characters and Latin words.',
    },
    messages: {
      missingSpaceBefore: 'Add a space before the word.',
      missingSpaceAfter: 'Add a space after the word.',
      missingSpacesAround: 'Add spaces before and after the word.',
      unexpectedSpaceBefore: 'Remove the unexpected space before the word.',
      unexpectedSpaceAfter: 'Remove the unexpected space after the word.',
      unexpectedSpaceAround: 'Remove the unexpected spaces around the word.',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      text(node: Text) {
        const { fixed, missingBefore, missingAfter, unexpectedBefore, unexpectedAfter } = fixBoundarySpace(node, isLatinWordType)

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
