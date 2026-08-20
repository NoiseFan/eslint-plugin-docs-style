import type { Text } from 'mdast'
import type { RuleContext, ValueOf } from '@/types'
import { createRule } from '@/utils'
import { getNodePosition } from '@/utils/ast'
import { isCustomContainerType, parseCustomContainers } from '@/utils/custom-container'

export const RULE_NAME = 'valid-custom-container-type'
export const MESSAGE_IDS = {
  invalidType: 'invalidType',
  invalidTypeCase: 'invalidTypeCase',
} as const
type Options = []
type MessageIds = ValueOf<typeof MESSAGE_IDS>

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Require VitePress custom containers to use a supported type.',
    },
    messages: {
      invalidType: 'Invalid custom container type "{{type}}". Use info, tip, warning, danger, details, or raw.',
      invalidTypeCase: 'Custom container type "{{type}}" must be lowercase.',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      text(node: Text) {
        checkCustomContainerTypes(context, node)
      },
    }
  },
})

/**
 * Reports unsupported custom-container types and casing errors found in a
 * Markdown text node, normalizing casing when the type is otherwise valid.
 */
function checkCustomContainerTypes(
  context: RuleContext<MessageIds, Options>,
  node: Text,
): void {
  const { position, start } = getNodePosition(node)
  /* v8 ignore if -- @preserve */
  if (!position)
    return

  for (const container of parseCustomContainers(node.value)) {
    const issue = getTypeIssue(container.type)
    if (!issue)
      continue

    const { start: typeStart, end: typeEnd } = container.tag.open.type
    const normalizedType = 'normalizedType' in issue ? issue.normalizedType : undefined
    context.report({
      node,
      messageId: issue.messageId,
      data: { type: container.type },
      loc: {
        start: context.sourceCode.getLocFromIndex(start + typeStart),
        end: context.sourceCode.getLocFromIndex(start + typeEnd),
      },
      fix: normalizedType
        ? fixer => fixer.replaceTextRange([start + typeStart, start + typeEnd], normalizedType)
        : undefined,
    })
  }
}

function getTypeIssue(type: string): { messageId: MessageIds, normalizedType?: string } | null {
  if (isCustomContainerType(type))
    return null

  const normalizedType = type.toLowerCase()
  if (isCustomContainerType(normalizedType))
    return { messageId: MESSAGE_IDS.invalidTypeCase, normalizedType }

  return { messageId: MESSAGE_IDS.invalidType }
}
