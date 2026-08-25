import type { Text } from 'mdast'
import type { ValueOf } from '@/types'
import type { CustomContainerAST, CustomContainerBlockNode, TagNode } from '@/types/custom-container'
import { getNodePosition } from '@/parser/ast'
import { isCustomContainerType, parseCustomContainers } from '@/parser/custom-container'
import { createRule } from '@/utils'

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
      description: 'Require custom containers to use a supported type.',
    },
    messages: {
      invalidType: 'Invalid custom container type "{{type}}". Use info, tip, warning, danger, details, raw, code-group, v-pre, or tabs.',
      invalidTypeCase: 'Custom container type "{{type}}" must be lowercase.',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      text(node: Text) {
        const { position, start: startPoint } = getNodePosition(node)
        /* v8 ignore if -- @preserve */
        if (!position)
          return

        for (const tag of getOpeningTags(parseCustomContainers(node.value))) {
          const issue = getTypeIssue(tag.value.content)
          if (!issue)
            continue

          const normalizedType = 'normalizedType' in issue ? issue.normalizedType : undefined

          const start = startPoint + tag.value.start
          const end = startPoint + tag.value.end

          context.report({
            node,
            messageId: issue.messageId,
            data: { type: tag.value.content },
            loc: {
              start: context.sourceCode.getLocFromIndex(start),
              end: context.sourceCode.getLocFromIndex(end),
            },
            fix: normalizedType
              ? fixer => fixer.replaceTextRange([start, end], normalizedType)
              : undefined,
          })
        }
      },
    }
  },
})

function* getOpeningTags(nodes: CustomContainerBlockNode[]): Generator<TagNode> {
  for (const node of nodes) {
    if (node.type !== 'cumstom-container')
      continue
    yield* getOpeningTagsFromContainer(node)
  }
}

function* getOpeningTagsFromContainer(container: CustomContainerAST): Generator<TagNode> {
  for (const child of container.children) {
    if (child.type === 'cumstom-container')
      yield* getOpeningTagsFromContainer(child)
    else if (child.type === 'open')
      yield child
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
