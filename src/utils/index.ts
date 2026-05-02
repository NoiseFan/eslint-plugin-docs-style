import type { MarkdownRuleDefinition } from '@eslint/markdown'
import type { Nodes } from 'mdast'
import type { RuleWithMetaAndName } from '../types'

export function createRule<Options extends unknown[], MessageIds extends string>({
  create,
  defaultOptions,
  meta,
}: Readonly<RuleWithMetaAndName<Options, MessageIds>>): MarkdownRuleDefinition<{
  RuleOptions: Options
  MessageIds: MessageIds
}> {
  return {
    create,
    meta: {
      defaultOptions,
      ...meta,
    },
  }
}

interface IPosition { position: boolean, start: number, end: number }
export function getNodePosition(node: Nodes): IPosition {
  const start = node.position?.start.offset
  const end = node.position?.end.offset
  if (start == null || end == null)
    return { position: false, start: 0, end: 0 }

  return { position: true, start, end }
}
