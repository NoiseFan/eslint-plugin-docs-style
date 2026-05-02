import type { MarkdownRuleDefinition, MarkdownRuleVisitor } from '@eslint/markdown'

export interface RuleWithMetaAndName<Options extends unknown[], MessageIds extends string>
  extends MarkdownRuleDefinition<{
    RuleOptions: Options
    MessageIds: MessageIds
  }> {
  name: string
  defaultOptions: Options
}

export type RuleContext<MessageIds extends string, Options extends unknown[]> = Parameters<
  MarkdownRuleDefinition<{
    RuleOptions: Options
    MessageIds: MessageIds
  }>['create']
>[0]

export type RuleListener = MarkdownRuleVisitor
