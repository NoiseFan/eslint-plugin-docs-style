import type { Rule } from 'eslint'
import type { RuleContext, RuleListener, RuleWithMetaAndName } from '../types'

export function createRule<Options extends readonly unknown[], MessageIds extends string>({ create, meta }: Readonly<RuleWithMetaAndName<Options, MessageIds>>): Rule.RuleModule {
  return {
    create: ((
      context: Readonly<RuleContext<MessageIds, Options>>,
    ): RuleListener => create(context, context.options as Options)) as any,
    meta: meta as any,
  }
}
