import type { Parents, PhrasingContent, RootContent } from 'mdast'

export type SiblingNode<Current extends RootContent> = Current extends PhrasingContent
  ? PhrasingContent
  : RootContent

export interface NodeContextReturnType<
  Current extends RootContent = RootContent,
  Sibling extends RootContent = SiblingNode<Current>,
> {
  parent?: Parents
  prev?: Sibling
  next?: Sibling
  current: Current
}

export interface SourceCodeWithAncestors {
  getAncestors: (node: RootContent) => unknown[]
}

export interface RuleContextWithAncestors {
  sourceCode: SourceCodeWithAncestors
}
