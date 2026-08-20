import type { CustomContainerNode, CustomContainerOpeningTag, CustomContainerTagValue, PendingCustomContainer } from '@/types/custom-container'

interface ContainerTypeOpts { params: string, tagStart: number, type: string }

const CUSTOM_CONTAINER_TAG_RE = /^ {0,3}(:{3,})(?:[\t ]([^\r\n]*))?\r?$/gm

/**
 * Parses VitePress custom containers from a Markdown text node into a small
 * container AST. All offsets are relative to the provided string.
 */
export function parseCustomContainers(value: string): CustomContainerNode[] {
  const containers: PendingCustomContainer[] = []
  const stack: PendingCustomContainer[] = []

  for (const match of value.matchAll(CUSTOM_CONTAINER_TAG_RE)) {
    const tagStart = match.index ?? 0
    const raw = match[0].replace(/\r$/, '')
    const marker = match[1]
    const params = match[2]?.trim()

    if (!params) {
      const current = stack.at(-1)
      /* v8 ignore if -- @preserve */
      if (!current || marker.length < current.markerLength)
        continue

      stack.pop()
      current.content = trimContentBoundary(value.slice(current.contentStart, tagStart))
      current.tag.close = {
        raw,
        start: tagStart,
        end: tagStart + raw.length,
      }
      continue
    }

    const type = parseType(params)
    const openingTag = parseOpeningTag(raw, marker, { params, tagStart, type })
    const container = createContainer(raw, value, { tagStart, marker, type, openingTag })

    containers.push(container)
    stack.push(container)
  }

  for (const container of stack)
    container.content = trimContentBoundary(value.slice(container.contentStart))

  return containers.map(({ markerLength: _markerLength, contentStart: _contentStart, ...container }) => container)
}

/**
 * Extract the container type from an opening tag's parameter text.
 */
export function parseType(params: string): string {
  return params.split(/[\t ]/, 1)[0]
}

/**
 * Parse an opening tag into its raw text, type, and optional title ranges.
 */
export function parseOpeningTag(raw: string, marker: string, opts: ContainerTypeOpts): CustomContainerOpeningTag {
  const { params, tagStart, type } = opts
  const typeStart = tagStart + raw.indexOf(type, marker.length)
  return {
    raw,
    position: { start: tagStart, end: tagStart + raw.length },
    type: { value: type, start: typeStart, end: typeStart + type.length },
    title: parseTitle(raw, typeStart, { params, tagStart, type }),
  }
}

/**
 * Parse the optional title from an opening tag and calculate its source range.
 */
export function parseTitle(raw: string, typeStart: number, opts: ContainerTypeOpts): CustomContainerTagValue | null {
  const { params, type, tagStart } = opts
  const value = params.slice(type.length).trim()
  if (!value)
    return null

  const start = tagStart + raw.indexOf(value, typeStart - tagStart + type.length)
  return { value, start, end: start + value.length }
}

/**
 * Create the pending state used while collecting a container's content.
 */
export function createContainer(
  raw: string,
  value: string,
  opts: Omit<ContainerTypeOpts, 'params'> & { marker: string, openingTag: CustomContainerOpeningTag },
): PendingCustomContainer {
  const { tagStart, marker, type, openingTag } = opts
  return {
    type,
    content: '',
    tag: { open: openingTag, close: null },
    markerLength: marker.length,
    contentStart: getNextLineStart(value, tagStart + raw.length),
  }
}

/**
 * Returns the offset immediately after the line break following an opening
 * tag, or the tag end when it is the last line.
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
