import type { MarkdownRuleDefinition, MarkdownRuleVisitor } from '@eslint/markdown'
import type { RuleOptions } from './typegen'

/**
 * Type-safe configuration entries for all md-style rules.
 */
export type { RuleOptions }

/**
 * A Markdown rule definition with its exported name and default options.
 */
export interface RuleWithMetaAndName<Options extends unknown[], MessageIds extends string>
  extends MarkdownRuleDefinition<{
    /**
     * Rule options tuple.
     */
    RuleOptions: Options
    /**
     * Allowed message id union.
     */
    MessageIds: MessageIds
  }> {
  /**
   * Rule name
   */
  name: string
  /**
   * Default rule options.
   * @default []
   */
  defaultOptions: Options
}

/**
 * The `create` context type for a Markdown rule definition.
 */
export type RuleContext<MessageIds extends string, Options extends unknown[]> = Parameters<
  MarkdownRuleDefinition<{
    /**
     * Rule options tuple.
     */
    RuleOptions: Options
    /**
     * Allowed message id union.
     */
    MessageIds: MessageIds
  }>['create']
>[0]

export type RuleListener = MarkdownRuleVisitor
