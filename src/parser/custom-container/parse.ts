import type { BlankNode, ChildrenNode, CustomContainerAST, CustomContainerBlockNode, OffsetRange, TagNode } from '@/types/custom-container'
import { CUSTOM_CONTAINER_ATTRS_RE, CUSTOM_CONTAINER_CLOSE_MARKER_STRICT_RE, CUSTOM_CONTAINER_OPEN_MARKER_RE, isBlank, isOpenTag } from '.'

interface ParseState { splits: string[], offset: number }

/**
 * Parses top-level text into container, blank-line, and text nodes.
 */
export function parseCustomContainers(value: string): CustomContainerBlockNode[] {
  const state: ParseState = { splits: splitLines(value), offset: 0 }
  const nodes: CustomContainerBlockNode[] = []

  while (state.splits.length) {
    const item = state.splits[0]
    const previous = nodes.at(-1)
    if (isOpenTag(item)) {
      nodes.push(parseCustomContainer(state, 1, previous))
      continue
    }

    const consumed = consume(state)
    if (isBlank(consumed.value)) {
      const blankNode = parseBlankNode({ newline: consumed.value, prevNode: previous })
      if (blankNode)
        nodes.push(blankNode)
      continue
    }

    nodes.push({ type: 'text', value: consumed.value, position: consumed.position })
  }
  return nodes
}

/**
 * Parses one container by consuming its opening tag, nested containers, content,
 * and a closing fence whose marker is at least as wide as the opening fence.
 */
function parseCustomContainer(state: ParseState, depth: number, parentNode?: ChildrenNode): CustomContainerAST {
  const children: ChildrenNode[] = []
  const raw = state.splits[0]
  const openTag = parseOpenTag(raw, parentNode)!
  consume(state)
  children.push(openTag)

  while (state.splits.length) {
    const item = state.splits[0]
    const previous = children.at(-1)

    // nested container
    const nestedOpen = parseOpenTag(item, previous)
    if (nestedOpen) {
      children.push(parseCustomContainer(state, depth + 1, previous))
      continue
    }

    // close node
    const closeTag = parseCloseTag(item, previous)
    const consumed = consume(state)

    if (closeTag && closeTag.markerLength >= openTag.markerLength) {
      children.push(closeTag)
      break
    }

    // blank node
    if (isBlank(consumed.value)) {
      const blankNode = parseBlankNode({ newline: consumed.value, prevNode: previous })
      if (blankNode)
        children.push(blankNode)
      continue
    }

    // text node
    children.push({ type: 'text', value: consumed.value, position: consumed.position })
  }
  return {
    type: 'custom-container',
    depth,
    children,
    position: {
      start: openTag.position.start,
      end: children.at(-1)?.position.end ?? openTag.position.end,
    },
  }
}

/**
 * Consumes the next split and advances its source offset.
 */
function consume(state: ParseState): { value: string, position: OffsetRange } {
  const value = state.splits.shift()!
  const start = state.offset
  state.offset += value.length
  return { value, position: { start, end: state.offset } }
}

/**
 * Splits text and keeps line-break tokens so their exact source ranges survive parsing.
 */
export function splitLines(value: string): Array<string> {
  return value.split(/(\r?\n)/).filter(Boolean)
}

/**
 * Parses an opening custom-container tag and calculates its source ranges.
 */
export function parseOpenTag(raw: string, prevNode?: ChildrenNode | CustomContainerBlockNode): TagNode | null {
  const match = raw.match(CUSTOM_CONTAINER_OPEN_MARKER_RE)
  /* v8 ignore if -- @preserve */
  if (!match)
    return null

  const [_, rawMarker, type, titleAndAttrs] = match
  const tag = rawMarker + type
  const marker = rawMarker.trim()
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

  return {
    type: 'open',
    markerLength: marker.length,
    raw,
    value,
    title,
    ...(attrs ? { attribute: attrs } : {}),
    position: { start: offset, end: offset + raw.length },
  }
}

/**
 * Parses the exact closing marker,
 * `:::` and calculates its source range.
 */
export function parseCloseTag(raw: string, prevNode?: ChildrenNode | CustomContainerBlockNode): TagNode | null {
  const match = raw.match(CUSTOM_CONTAINER_CLOSE_MARKER_STRICT_RE)
  /* v8 ignore if -- @preserve */
  if (!match)
    return null
  const marker = match[0].match(/:{3,}/)?.[0] ?? ''

  const start = prevNode?.position.end || 0
  const end = start + raw.length
  return {
    type: 'close',
    markerLength: marker.length,
    raw,
    value: { content: raw, start, end },
    position: { start, end },
  }
}

/**
 * Adds a blank-line node
 * merging it with the preceding blank line when possible.
 */
export function parseBlankNode(
  opts?: Partial<{
    newline?: string
    prevNode?: ChildrenNode | CustomContainerBlockNode
  }>,
): BlankNode | null {
  const { newline = '\n', prevNode } = opts || {}
  if (prevNode?.type === 'blank') {
    prevNode.value += newline
    prevNode.position.end += newline.length
    return null
  }
  const start = prevNode?.position.end || 0
  return {
    type: 'blank',
    value: newline,
    position: { start, end: start + newline.length },
  }
}

export const isCoustomContainer = (node: ChildrenNode | undefined): node is CustomContainerAST => !!node && node.type === 'custom-container'
export const isBlankNode = (node: ChildrenNode | undefined): node is BlankNode => !!node && node.type === 'blank'
export const isOpenNode = (node: ChildrenNode | undefined): node is TagNode => !!node && node.type === 'open'
export const isCloseNode = (node: ChildrenNode | undefined): node is TagNode => !!node && node.type === 'close'
