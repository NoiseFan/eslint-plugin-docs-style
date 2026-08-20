import type { CustomContainerBlankLineNode, CustomContainerNode, CustomContainerOpeningTag, CustomContainerRange, CustomContainerTagValue, PendingCustomContainer } from '@/types/custom-container'

const CUSTOM_CONTAINER_TAG_RE = /^ {0,3}(:{3,})(?:[\t ]([^\r\n]*))?\r?$/gm

/**
 * Parses VitePress custom containers from a Markdown text node into a smallcontainer AST.
 * All offsets are relative to the provided string.
 * Matches inside ignored source ranges, such as fenced code blocks, are skipped.
 */
export function parseCustomContainers(value: string, ignoredRanges: CustomContainerRange[] = []): CustomContainerNode[] {
  const containers: PendingCustomContainer[] = []
  const stack: PendingCustomContainer[] = []

  for (const match of value.matchAll(CUSTOM_CONTAINER_TAG_RE)) {
    const startPosition = match.index ?? 0
    if (ignoredRanges.some(range => startPosition >= range.start && startPosition < range.end))
      continue

    const matched = {
      raw: match[0].replace(/\r$/, ''),
      marker: match[1],
      type: match[2]?.trim(),
    }

    // 处理结束标记
    if (!matched.type) {
      const current = stack.at(-1)
      /* v8 ignore if -- @preserve */
      if (!current || matched.marker.length < current.markerLength)
        continue

      stack.pop()
      current.content = trimContentBoundary(value.slice(current.contentStart, startPosition))
      current.tag.close = { raw: matched.raw, start: startPosition, end: startPosition + matched.raw.length }
      continue
    }

    const type = parseType(matched.type)
    const openingTag = parseOpenTag(matched.marker, { raw: matched.raw, value: matched.type, startPosition, type })
    // TODO
    const container = createContainer(value, { tagStart: startPosition, raw: matched.raw, marker: matched.marker, type, openingTag })

    containers.push(container)
    stack.push(container)
  }

  for (const container of stack)
    container.content = trimContentBoundary(value.slice(container.contentStart))

  return finalizeContainers(value, containers)
}
interface OpenTagOptsType { raw: string, value: string, type: string, startPosition: number }

/**
 * Extract the container type from an opening tag's parameter text.
 */
export function parseType(params: string): string {
  return params.split(/[\t ]/, 1)[0]
}

/**
 * Parse an opening tag into its raw text, type, and optional title ranges.
 */
export function parseOpenTag(marker: string, opts: OpenTagOptsType): CustomContainerOpeningTag {
  const { raw, value, type, startPosition } = opts

  const typeStart = startPosition + raw.indexOf(type, marker.length)
  const position = { start: typeStart, end: startPosition + raw.length }
  const title = parseTitle(typeStart, { raw, value, type, startPosition: typeStart })

  return {
    content: raw,
    position,
    type,
    title,
  }
}

/**
 * Parse the optional title from an opening tag and calculate its source range.
 */
export function parseTitle(tagStart: number, opts: OpenTagOptsType): CustomContainerTagValue | null {
  const { raw, value, type, startPosition } = opts

  const title = value.slice(type.length).trim()
  if (!title)
    return null

  const start = tagStart + raw.indexOf(title, startPosition - tagStart + type.length)
  const end = start + title.length
  return { value: title, start, end }
}

/**
 * Converts pending parser state into the public container AST and populates
 * child nodes and nesting depth for every container.
 */
export function finalizeContainers(value: string, pending: PendingCustomContainer[]): CustomContainerNode[] {
  const nodes = pending.map(({ markerLength: _markerLength, contentStart: _contentStart, containerType: _containerType, parent: _parent, ...container }) => ({ ...container, type: 'custom-container' } as CustomContainerNode))
  for (const node of nodes) {
    const direct = findDirectChildren(node, nodes)
    node.children = buildChildren(value, node, direct)
    node.depth = calculateDepth(node, nodes)
  }
  return nodes
}

/**
 * Returns every container whose source range is nested inside the parent.
 */
export function findNestedContainers(parent: CustomContainerNode, nodes: CustomContainerNode[]): CustomContainerNode[] {
  return nodes.filter((child) => {
    const isChild = child !== parent
    const isOpenIn = child.tag.open.position.start > parent.tag.open.position.end
      && (parent.tag.close == null || child.tag.open.position.start < parent.tag.close.start)
    const isCloseIn = child.tag.close == null
      || parent.tag.close == null
      || child.tag.close.end <= parent.tag.close.end

    return isChild && isOpenIn && isCloseIn
  })
}

/**
 * Returns only the immediate nested containers,
 * excluding descendants of a nearer child container.
 */
export function findDirectChildren(parent: CustomContainerNode, nodes: CustomContainerNode[]): CustomContainerNode[] {
  const nested = findNestedContainers(parent, nodes)
  return nested.filter((child) => {
    const hasAncestor = nested.some((other) => {
      const isBefore = other !== child && other.tag.open.position.start < child.tag.open.position.start
      const contains = other.tag.close == null
        || (child.tag.close != null && other.tag.close.end >= child.tag.close.end)
      return isBefore && contains
    })

    return !hasAncestor
  })
}

/**
 * Calculates a container's one-based nesting depth from source ranges.
 */
export function calculateDepth(node: CustomContainerNode, nodes: CustomContainerNode[]): number {
  const end = node.tag.close?.end ?? node.tag.open.position.end
  const parents = nodes.filter((parent) => {
    const isParent = parent !== node && parent.tag.open.position.start < node.tag.open.position.start
    const contains = parent.tag.close?.end !== undefined && parent.tag.close.end >= end
    return isParent && contains
  })

  return parents.length + 1
}

/**
 * Orders direct children and inserts merged blank-line nodes between them.
 */
export function buildChildren(value: string, parent: CustomContainerNode, children: CustomContainerNode[]): (CustomContainerNode | CustomContainerBlankLineNode)[] {
  if (!children.length)
    return []
  const result: (CustomContainerNode | CustomContainerBlankLineNode)[] = []
  let cursor = parent.tag.open.position.end
  for (const child of children.sort((a, b) => a.tag.open.position.start - b.tag.open.position.start)) {
    const gap = value.slice(cursor, child.tag.open.position.start)
    const match = gap.match(/(?:\r?\n[\t ]*)+/)
    if (match && /^\s*$/.test(gap))
      result.push({ type: 'blank-line', value: match[0], length: (match[0].match(/\r?\n/g) ?? []).length })
    result.push(child)
    cursor = child.tag.close?.end ?? child.tag.open.position.end
  }
  return result
}

/**
 * Create the pending state used while collecting a container's content.
 */
export function createContainer(value: string, opts: { tagStart: number, raw: string, marker: string, type: string, openingTag: CustomContainerOpeningTag }): PendingCustomContainer {
  const { tagStart, raw, marker, type, openingTag } = opts
  return {
    type,
    content: '',
    tag: { open: openingTag, close: null },
    markerLength: marker.length,
    contentStart: getNextLineStart(value, tagStart + raw.length),
    containerType: type,
  }
}

/**
 * Returns the offset immediately after the line break following an opening tag
 * or the tag end when it is the last line.
 */
export function getNextLineStart(value: string, tagEnd: number): number {
  if (value.startsWith('\r\n', tagEnd))
    return tagEnd + 2
  if (value[tagEnd] === '\n')
    return tagEnd + 1
  return tagEnd
}

/**
 * Removes the single line break that separates container content from its
 * closing tag while preserving all other content whitespace.
 */
function trimContentBoundary(content: string): string {
  return content.replace(/\r?\n$/, '')
}
