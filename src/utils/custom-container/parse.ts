import type { ChildrenNode, CustomContainerAST, TagNode } from '@/types/custom-container'

import { CUSTOM_CONTAINER_OPEN_MARKER_RE } from './index'
/**
 * Parses custom-container markup into a nested AST while preserving source offsets.
 *
 * The optional split state is used by recursive calls so nested containers can
 * continue consuming the same input without reparsing already visited lines.
 */
export function parseCustomContainers(
  value: string,
  opts?: { remainSplits?: Array<string>, depth?: number, parentNode?: ChildrenNode },
): CustomContainerAST {
  const { remainSplits, depth = 1, parentNode } = opts || {}
  const splits: Array<string> = remainSplits ?? splitLines(value)
  const children: ChildrenNode[] = []
  let hasOpenTag = false

  while (splits.length) {
    const item = splits.shift()
    const prevNode: ChildrenNode | undefined = children.at(-1) || parentNode
    if (item === undefined)
      break
    if (!item.length) {
      parseBlankNode(children, prevNode)
      continue
    }

    if (parseOpenNode(item, { value, splits, depth, children, hasOpenTag, prevNode })) {
      hasOpenTag = true
      continue
    }

    const closeTag = parseCloseTag(item, prevNode)
    if (closeTag) {
      children.push(closeTag)
      if (hasOpenTag)
        break
      continue
    }

    const start = prevNode?.position.end || 0
    const end = start + item.length
    children.push({ type: 'text', value: item, position: { start, end } })
  }
  const start = parentNode?.position.end || 0
  return { type: 'cumstom-container', depth, children, position: { start, end: start + value.length } }
}

/**
 * Retains one empty item for every newline character when splitting input lines.
 */
function splitLines(value: string): Array<string> {
  const parts = value.split('\n')
  const last = parts.pop() ?? ''
  const splits = parts.flatMap(part => [part, ''])
  if (last.length)
    splits.push(last)
  return splits
}

/**
 *  Adds a blank-line node, merging it with the preceding blank line when possible.
 */
export function parseBlankNode(children: Array<ChildrenNode>, prevNode?: ChildrenNode): void {
  if (prevNode?.type === 'blank') {
    prevNode.value += '\n'
    prevNode.position.end += 1
  }
  else {
    const prevEndPoint = prevNode ? prevNode.position.end : 0
    const position = { start: prevEndPoint, end: prevEndPoint + 1 }
    children.push({ type: 'blank', value: '\n', position })
  }
}

/**
 * Handles an opening-tag line and, when appropriate,
 * delegates nested content to a recursive container parse.
 */
export function parseOpenNode(
  item: string,
  opts: {
    value: string
    splits: Array<string>
    depth: number
    children: Array<ChildrenNode>
    hasOpenTag: boolean
    prevNode?: ChildrenNode
  },
): boolean {
  const { value, splits, depth, children, hasOpenTag, prevNode } = opts
  const openTag = parseOpenTag(item, prevNode)
  if (!openTag)
    return false

  if (!hasOpenTag) {
    children.push(openTag)
  }
  else {
    splits.unshift(item)
    children.push(parseCustomContainers(value.substring(prevNode?.position.end || 0), { remainSplits: splits, depth: depth + 1, parentNode: prevNode }))
  }
  return true
}

/**
 *  Parses an opening custom-container tag and calculates its source ranges.
 */
export function parseOpenTag(content: string, prevNode?: ChildrenNode): TagNode | null {
  const matched = content.match(CUSTOM_CONTAINER_OPEN_MARKER_RE)
  if (!matched)
    return null
  const offset = prevNode?.position.end || 0
  const values = content.split(/\s/)
  const valueStart = offset + values[0].length + 1
  const value = {
    content: values[1],
    start: valueStart,
    end: valueStart + values[1].length,
  }
  const title = values[2]

  const start = prevNode ? prevNode.position.end : 0
  const end = start + content.length
  return {
    type: 'open',
    raw: content,
    value,
    title,
    position: { start, end },
  }
}

/**
 * Parses the exact closing marker,
 * `:::` and calculates its source range.
 */
export function parseCloseTag(value: string, prevNode?: ChildrenNode): TagNode | null {
  if (value !== ':::')
    return null

  const start = prevNode ? prevNode.position.end : 0
  const end = start + value.length
  return {
    type: 'close',
    raw: value,
    value: { content: value, start, end },
    position: { start, end },
  }
}
