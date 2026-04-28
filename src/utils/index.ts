import type { Rule } from 'eslint'
import type { Nodes } from 'mdast'
import type { RuleContext, RuleListener, RuleWithMetaAndName } from '../types'

export function createRule<Options extends readonly unknown[], MessageIds extends string>({ create, meta }: Readonly<RuleWithMetaAndName<Options, MessageIds>>): Rule.RuleModule {
  return {
    create: ((
      context: Readonly<RuleContext<MessageIds, Options>>,
    ): RuleListener => create(context, context.options as Options)) as any,
    meta: meta as any,
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
