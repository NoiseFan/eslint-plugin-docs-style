import type { BlankNode, ChildrenNode, CustomContainerAST, TagNode } from '@/types/custom-container'
import { CUSTOM_CONTAINER_ATTRS_RE, CUSTOM_CONTAINER_OPEN_MARKER_RE } from '.'

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
    /* v8 ignore if -- @preserve */
    if (item === undefined)
      break
    if (item === '\n' || item === '\r\n') {
      parseBlankNode(children, { newline: item, prevNode })
      continue
    }

    if (parseOpenNode(item, { value, splits, depth, children, hasOpenTag, prevNode })) {
      hasOpenTag = true
      continue
    }

    const closeTag = parseCloseTag(item, prevNode)
    if (closeTag) {
      children.push(closeTag)
      if (hasOpenTag && parentNode)
        break
      continue
    }

    const start = prevNode?.position.end || 0
    const end = start + item.length
    children.push({ type: 'text', value: item, position: { start, end } })
  }
  const start = parentNode?.position.end || 0
  const end = children.at(-1)?.position.end || start
  return { type: 'cumstom-container', depth, children, position: { start, end } }
}

/**
 * Splits text and keeps line-break tokens so their exact source ranges survive parsing.
 */
export function splitLines(value: string): Array<string> {
  return value.split(/(\r?\n)/).filter(Boolean)
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
export function parseOpenTag(raw: string, prevNode?: ChildrenNode): TagNode | null {
  const match = raw.match(CUSTOM_CONTAINER_OPEN_MARKER_RE)
  if (!match)
    return null

  const [_, marker, type, titleAndAttrs] = match
  const tag = marker + type
  const offset = prevNode?.position.end || 0
  const valueStart = offset + tag.length - type.length
  const value = {
    content: type,
    start: valueStart,
    end: valueStart + type.length,
  }
  const titleAndAttrsValue = titleAndAttrs?.trim() || ''

  // parse attrs
  const attributeMatch = titleAndAttrsValue.match(CUSTOM_CONTAINER_ATTRS_RE)
  const attrs = attributeMatch
    ? { content: attributeMatch[1].slice(1, -1), raw: attributeMatch[1] }
    : void 0

  // parse title
  const title = (attributeMatch
    ? titleAndAttrsValue.slice(0, attributeMatch.index).trim()
    : titleAndAttrsValue) || void 0

  const start = prevNode ? prevNode.position.end : 0
  const end = start + raw.length
  return {
    type: 'open',
    raw,
    value,
    title,
    ...(attrs ? { attribute: attrs } : {}),
    position: { start, end },
  }
}

/**
 * Parses the exact closing marker,
 * `:::` and calculates its source range.
 */
export function parseCloseTag(value: string, prevNode?: ChildrenNode): TagNode | null {
  if (!value.endsWith(':::'))
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

/**
 *  Adds a blank-line node, merging it with the preceding blank line when possible.
 */
export function parseBlankNode(
  children: Array<ChildrenNode>,
  opts?: Partial<{
    newline: string
    prevNode: ChildrenNode
  }>,
): void {
  const { newline = '\n', prevNode } = opts || {}
  if (prevNode?.type === 'blank') {
    prevNode.value += newline
    prevNode.position.end += newline.length
  }
  else {
    const prevEndPoint = prevNode ? prevNode.position.end : 0
    children.push({
      type: 'blank',
      value: newline,
      position: { start: prevEndPoint, end: prevEndPoint + newline.length },
    })
  }
}

export const isCoustomContainer = (node: ChildrenNode | undefined): node is CustomContainerAST => !!node && node.type === 'cumstom-container'
export const isBlankNode = (node: ChildrenNode | undefined): node is BlankNode => !!node && node.type === 'blank'
export const isOpenNode = (node: ChildrenNode | undefined): node is TagNode => !!node && node.type === 'open'
export const isCloseNode = (node: ChildrenNode | undefined): node is TagNode => !!node && node.type === 'close'
