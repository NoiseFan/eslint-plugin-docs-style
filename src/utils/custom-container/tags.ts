import type { CustomContainerAST, CustomContainerTags, OffsetRange, TagNode } from '@/types/custom-container'
import { CUSTOM_CONTAINER_OPEN_MARKER_RE, isCustomContainerCloseLine } from '.'
import { getSourceLines, isIgnoredLine } from './lines'
import { parseCustomContainers } from './parse'

interface ContainerFragment {
  value: string
  range: OffsetRange
}

/** Finds complete container fragments while excluding Markdown code ranges. */
export function getContainerTagsFromSource(
  value: string,
  ignoredRanges: OffsetRange[] = [],
): CustomContainerTags[] {
  return findContainerFragments(value, ignoredRanges)
    .flatMap((fragment) => {
      const parsedValue = maskIgnoredRanges(fragment.value, ignoredRanges, fragment.range.start)
      return getContainerTagsFromParsedValue(parsedValue, fragment.range.start)
    })
    .sort(compareTagStarts)
}

/** Flattens a parsed nested AST into absolute opening and closing marker ranges. */
export function getContainerTags(
  container: CustomContainerAST,
  offset: number,
  source: string,
): CustomContainerTags[] {
  return collectContainerTags(container, offset, source, { value: 0 })
}

/** Parses one source fragment before flattening its nested container ranges. */
function getContainerTagsFromParsedValue(value: string, offset: number): CustomContainerTags[] {
  return getContainerTags(parseCustomContainers(value), offset, value)
}

/** Recursively collects one container and all nested containers in source order. */
function collectContainerTags(
  container: CustomContainerAST,
  offset: number,
  source: string,
  cursor: { value: number },
): CustomContainerTags[] {
  const open = findTag(container, 'open')
  const close = findLastTag(container, 'close')
  if (!open) {
    return container.children
      .filter(isContainer)
      .flatMap(child => collectContainerTags(child, offset, source, cursor))
  }

  const openRange = shiftRange(resolveTagRange(open, source, cursor), offset)
  const nested = container.children
    .filter(isContainer)
    .flatMap(child => collectContainerTags(child, offset, source, cursor))
  const closeRange = close
    ? shiftRange(resolveTagRange(close, source, cursor), offset)
    : undefined

  return [
    {
      open: openRange,
      close: closeRange,
    },
    ...nested,
  ]
}

/** Resolves parser-relative tag ranges against the original source fragment. */
function resolveTagRange(
  tag: TagNode,
  source: string,
  cursor: { value: number },
): OffsetRange {
  const start = source.indexOf(tag.raw, cursor.value)
  if (start < 0)
    return tag.position

  cursor.value = start + tag.raw.length
  return { start, end: start + tag.raw.length }
}

/** Finds a tag of the requested kind among direct container children. */
function findTag(container: CustomContainerAST, type: TagNode['type']): TagNode | undefined {
  return container.children.find((child): child is TagNode => child.type === type)
}

/** Finds the last direct closing tag, preserving the parser's source order. */
function findLastTag(container: CustomContainerAST, type: TagNode['type']): TagNode | undefined {
  return container.children.findLast((child): child is TagNode => child.type === type)
}

/** Identifies nested custom-container AST nodes. */
function isContainer(child: CustomContainerAST['children'][number]): child is CustomContainerAST {
  return child.type === 'cumstom-container'
}

/** Adds a fragment offset to a parser-relative range. */
function shiftRange(range: OffsetRange, offset: number): OffsetRange {
  return { start: range.start + offset, end: range.end + offset }
}

/** Masks excluded source ranges without changing offsets or line boundaries. */
function maskIgnoredRanges(value: string, ranges: OffsetRange[], offset: number): string {
  const relevantRanges = ranges
    .map(range => ({
      start: Math.max(range.start - offset, 0),
      end: Math.min(range.end - offset, value.length),
    }))
    .filter(range => range.start < range.end)
    .sort((a, b) => a.start - b.start)

  if (!relevantRanges.length)
    return value

  let cursor = 0
  let masked = ''
  for (const range of relevantRanges) {
    if (range.start > cursor)
      masked += value.slice(cursor, range.start)
    if (range.end > cursor) {
      const start = Math.max(range.start, cursor)
      masked += value.slice(start, range.end).replace(/[^\r\n]/g, ' ')
      cursor = range.end
    }
  }

  return masked + value.slice(cursor)
}

/** Finds top-level container fragments by pairing opening and closing lines. */
function findContainerFragments(value: string, ignoredRanges: OffsetRange[]): ContainerFragment[] {
  const stack: number[] = []
  const fragments: ContainerFragment[] = []

  for (const line of getSourceLines(value)) {
    if (isIgnoredLine(line, ignoredRanges))
      continue

    if (CUSTOM_CONTAINER_OPEN_MARKER_RE.test(line.value)) {
      stack.push(line.start)
      continue
    }

    if (!isCustomContainerCloseLine(line.value) || !stack.length)
      continue

    const start = stack.pop()!
    if (!stack.length)
      fragments.push({ value: value.slice(start, line.end), range: { start, end: line.end } })
  }

  return fragments
}

/** Sorts tag ranges in source order. */
function compareTagStarts(a: CustomContainerTags, b: CustomContainerTags): number {
  return a.open.start - b.open.start
}
