import type { MarkdownRuleDefinition, MarkdownRuleVisitor } from '@eslint/markdown'
import type { OffsetRange } from './custom-container'

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

export type ValueOf<T> = T[keyof T]

export type PositionOptions = 'head' | 'tail'

export interface WhiteSpaceReturn extends OffsetRange {
  count: number
}
