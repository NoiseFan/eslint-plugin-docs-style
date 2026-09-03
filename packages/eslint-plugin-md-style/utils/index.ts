import type { MarkdownRuleDefinition } from '@eslint/markdown'
import type { RuleWithMetaAndName } from '@/types'

export function createRule<Options extends unknown[], MessageIds extends string>({
  name,
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
      docs: {
        ...meta?.docs,
        url: `https://github.com/NoiseFan/eslint-plugin-md-style/blob/main/docs/rules/en/${name}.md`,
      },
    },
  }
}
