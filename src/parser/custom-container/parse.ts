import type { BlankNode, ChildrenNode, CustomContainerAST, CustomContainerBlockNode, OffsetRange, TagNode } from '@/types/custom-container'
import { CUSTOM_CONTAINER_ATTRS_RE, CUSTOM_CONTAINER_CLOSE_MARKER_STRICT_RE, CUSTOM_CONTAINER_OPEN_MARKER_RE, isBlank } from '.'

interface ParseState { splits: string[], offset: number }

export function parseCustomContainers(value: string): CustomContainerBlockNode[] {
  const state: ParseState = { splits: splitLines(value), offset: 0 }
  const nodes: CustomContainerBlockNode[] = []

  while (state.splits.length) {
    const item = state.splits[0]
    const previous = nodes.at(-1)
    if (parseOpenTag(item, previous)) {
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
 * Parses custom-container markup into a nested AST while preserving source offsets.
 *
 * The optional split state is used by recursive calls so nested containers can
 * continue consuming the same input without reparsing already visited lines.
 */
function parseCustomContainer(state: ParseState, depth: number, parentNode?: ChildrenNode): CustomContainerAST {
  const children: ChildrenNode[] = []
  const raw = state.splits[0]
  const openTag = parseOpenTag(raw, parentNode)
  if (!openTag)
    return { type: 'custom-container', depth, children, position: { start: state.offset, end: state.offset } }
  consume(state)
  children.push(openTag)
  const markerLength = raw.match(CUSTOM_CONTAINER_OPEN_MARKER_RE)?.[1].match(/:{3,}/)?.[0].length ?? 3

  while (state.splits.length) {
    const item = state.splits[0]
    const previous = children.at(-1)
    const nestedOpen = parseOpenTag(item, previous)
    if (nestedOpen) {
      children.push(parseCustomContainer(state, depth + 1, previous))
      continue
    }
    const closeMatch = item.match(CUSTOM_CONTAINER_CLOSE_MARKER_STRICT_RE)
    const closeMarkerLength = closeMatch?.[0].match(/:{3,}/)?.[0].length ?? 0

    if (closeMatch && closeMarkerLength >= markerLength) {
      const consumed = consume(state)
      children.push(parseCloseTag(consumed.value, previous)!)
      break
    }
    const consumed = consume(state)
    if (isBlank(consumed.value)) {
      const blankNode = parseBlankNode({ newline: consumed.value, prevNode: previous })
      if (blankNode)
        children.push(blankNode)
      continue
    }

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
 *  Parses an opening custom-container tag and calculates its source ranges.
 */
export function parseOpenTag(raw: string, prevNode?: ChildrenNode | CustomContainerBlockNode): TagNode | null {
  const match = raw.match(CUSTOM_CONTAINER_OPEN_MARKER_RE)
  /* v8 ignore if -- @preserve */
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

  return {
    type: 'open',
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
export function parseCloseTag(value: string, prevNode?: ChildrenNode | CustomContainerBlockNode): TagNode | null {
  /* v8 ignore if -- @preserve */
  if (!CUSTOM_CONTAINER_CLOSE_MARKER_STRICT_RE.test(value))
    return null

  const start = prevNode?.position.end || 0
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
