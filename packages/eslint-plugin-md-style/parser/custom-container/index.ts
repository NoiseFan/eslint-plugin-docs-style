import type { Nodes, Root } from 'mdast'
import type { OffsetRange } from '@/types/ast'
import type { BlankNode, ChildrenNode, CustomContainerAST, TagNode } from '@/types/custom-container'
import { hasChildren, isCodeNode, isObject } from '@/parser/ast'

export * from './parser'

export const CUSTOM_CONTAINER_TYPES = [
  'info',
  'tip',
  'warning',
  'danger',
  'details',
  'raw',
  'code-group',
  'v-pre',
  'tabs', // support `vitepress-plugin-tabs`
] as const

export type CustomContainerType = typeof CUSTOM_CONTAINER_TYPES[number]

const CUSTOM_CONTAINER_TYPE_SET = new Set<string>(CUSTOM_CONTAINER_TYPES)

const CUSTOM_CONTAINER_MARKER_PATTERN = String.raw`(^ {0,3}:{3,}[ \t]*)`
const CUSTOM_CONTAINER_TYPE_PATTERN = String.raw`([\w-]+)(?=$|[ \t]|\r?\n)`
const CUSTOM_CONTAINER_TITLE_AND_ATTRS_PATTERN = String.raw`([ \t][^\r\n]*)?`
const CUSTOM_CONTAINER_CLOSE_MARKER_PATTERN = String.raw` {0,3}:{3,}[ \t]*`

export const CUSTOM_CONTAINER_OPEN_MARKER_RE = new RegExp(`${CUSTOM_CONTAINER_MARKER_PATTERN}${CUSTOM_CONTAINER_TYPE_PATTERN}${CUSTOM_CONTAINER_TITLE_AND_ATTRS_PATTERN}`)
export const CUSTOM_CONTAINER_CLOSE_MARKER_RE = new RegExp(`^\r?\n${CUSTOM_CONTAINER_CLOSE_MARKER_PATTERN}$`)
export const CUSTOM_CONTAINER_CLOSE_MARKER_STRICT_RE = new RegExp(`^${CUSTOM_CONTAINER_CLOSE_MARKER_PATTERN}$`)
export const CUSTOM_CONTAINER_ATTRS_RE = /(\{[^{}]+\})\s*$/

/**
 * Checks whether a value is one of the custom-container types supported by VitePress.
 */
export function isCustomContainerType(value: string): value is CustomContainerType {
  return CUSTOM_CONTAINER_TYPE_SET.has(value)
}

export function isOpenTag(value: string): boolean {
  return CUSTOM_CONTAINER_OPEN_MARKER_RE.test(value)
}

export function isCloseTag(value: string): boolean {
  return new RegExp(`${CUSTOM_CONTAINER_CLOSE_MARKER_PATTERN}`).test(value)
}

export function isBlank(value: string): boolean {
  return value === '\n' || value === '\r\n'
}
/**
 * Checks whether adjacent text is a custom container marker on the next line.
 *
 * @see https://vitepress.dev/guide/markdown#custom-containers
 * @example `::: info` -> true (open tag)
 * @example `:::: tip` -> true
 * @example `:::` -> false (close tag)
 */
export function isCustomContainerMarker(str: string | undefined): boolean {
  if (!str)
    return false
  return CUSTOM_CONTAINER_CLOSE_MARKER_RE.test(str) || CUSTOM_CONTAINER_OPEN_MARKER_RE.test(str)
}

/* ==================== Node Type Assertion ==================== */

export const isCustomContainerNode = (node: ChildrenNode | undefined): node is CustomContainerAST => !!node && node.type === 'custom-container'
export const isBlankNode = (node: ChildrenNode | undefined): node is BlankNode => !!node && node.type === 'blank'
export const isOpenNode = (node: ChildrenNode | undefined): node is TagNode => !!node && node.type === 'open'
export const isCloseNode = (node: ChildrenNode | undefined): node is TagNode => !!node && node.type === 'close'

/* ==================== Utils ==================== */

/**
 * Ignore `Custom-containerNode` in `CodeNode` & `InlineCodeNode`.
 * Collects source offsets for fenced code blocks and inline code nodes.
 */
export function getCodeNodeRanges(node: Root): Array<OffsetRange> {
  const ranges: Array<OffsetRange> = []

  function visit(current: Nodes): void {
    if (!isObject(current))
      return
    if (isCodeNode(current)) {
      const position = current.position
      if (!position)
        return

      const start = position.start?.offset
      const end = position.end?.offset
      if (start !== undefined && end !== undefined)
        ranges.push({ start, end })
    }
    if (hasChildren(current)) {
      for (const child of current.children)
        visit(child)
    }
  }

  visit(node)
  return ranges
}
