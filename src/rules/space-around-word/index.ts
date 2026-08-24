import type { Text } from 'mdast'
import type { ValueOf } from '@/types'
import { fixBoundarySpace, getBoundarySpaceIssue } from '@/rules/shared/boundary-spacing/analyze'
import { createRule } from '@/utils'

export const RULE_NAME = 'space-around-word'
export const MESSAGE_IDS = {
  missingSpaceBefore: 'missingSpaceBefore',
  missingSpaceAfter: 'missingSpaceAfter',
  missingSpacesAround: 'missingSpacesAround',
  unexpectedSpaceBefore: 'unexpectedSpaceBefore',
  unexpectedSpaceAfter: 'unexpectedSpaceAfter',
  unexpectedSpaceAround: 'unexpectedSpaceAround',
} as const

type MessageIds = ValueOf<typeof MESSAGE_IDS>

const isLatinWordType = (type: string | undefined): boolean => type === 'latin'

const ISSUE_TO_MESSAGE_ID = {
  'missing-space-before': 'missingSpaceBefore',
  'missing-space-after': 'missingSpaceAfter',
  'missing-spaces-around': 'missingSpacesAround',
  'unexpected-space-before': 'unexpectedSpaceBefore',
  'unexpected-space-after': 'unexpectedSpaceAfter',
  'unexpected-spaces-around': 'unexpectedSpaceAround',
} as const satisfies Record<ReturnType<typeof getBoundarySpaceIssue>, MessageIds>

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
          messageId: ISSUE_TO_MESSAGE_ID[getBoundarySpaceIssue({ missingBefore, missingAfter, unexpectedBefore, unexpectedAfter })],
          fix(fixer) {
            return fixer.replaceText(node, fixed)
          },
        })
      },
    }
  },
})
