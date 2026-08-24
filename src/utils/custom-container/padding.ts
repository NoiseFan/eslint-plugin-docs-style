import type { CustomContainerPaddingIssue, CustomContainerTags, OffsetRange, SourceLine } from '@/types/custom-container'
import { getSourceLines } from './lines'
import { getContainerTagsFromSource } from './tags'

interface Boundary {
  line: SourceLine
  blankLines: SourceLine[]
  range: OffsetRange
}

interface BoundaryCheck {
  boundary: Boundary | undefined
  expected: number
  kind: CustomContainerPaddingIssue['kind']
  tag: OffsetRange | undefined
}

/** Calculates whitespace edits around parsed custom containers. */
export function getCustomContainerPaddingIssues(
  value: string,
  ignoredRanges: OffsetRange[] = [],
): CustomContainerPaddingIssue[] {
  const lines = getSourceLines(value)
  const containers = getContainerTagsFromSource(value, ignoredRanges)
  const parents = getParentContainers(containers)
  const issues = containers.flatMap(container => getContainerIssues(value, lines, parents, container))

  return dedupeIssues(issues).sort(compareIssueStarts)
}

/** Builds nearest-parent relationships once for all containers in source order. */
function getParentContainers(containers: CustomContainerTags[]): Map<CustomContainerTags, CustomContainerTags> {
  const parents = new Map<CustomContainerTags, CustomContainerTags>()
  const stack: CustomContainerTags[] = []

  for (const container of containers) {
    while (stack.length && !contains(stack.at(-1)!, container))
      stack.pop()

    const parent = stack.at(-1)
    if (parent)
      parents.set(container, parent)
    stack.push(container)
  }

  return parents
}

/** Checks whether one container fully contains another. */
function contains(parent: CustomContainerTags, child: CustomContainerTags): boolean {
  return parent.open.start < child.open.start
    && (parent.close?.end ?? Number.POSITIVE_INFINITY) > (child.close?.end ?? child.open.end)
}

/** Gets all edits for one container's internal and external boundaries. */
function getContainerIssues(
  value: string,
  lines: SourceLine[],
  parents: Map<CustomContainerTags, CustomContainerTags>,
  container: CustomContainerTags,
): CustomContainerPaddingIssue[] {
  const parent = parents.get(container)
  const before = getBoundary(lines, container.open.start, 'previous')
  const after = container.close && getBoundary(lines, container.close.end, 'next')
  const nestedBefore = before && isAdjacentTo(before.line, parent?.open)
  const nestedAfter = after && isAdjacentTo(after.line, parent?.close)

  const checks: BoundaryCheck[] = [
    { boundary: getBoundary(lines, container.open.end, 'next'), expected: 0, kind: 'unexpected', tag: container.open },
    { boundary: container.close && getBoundary(lines, container.close.start, 'previous'), expected: 0, kind: 'unexpected', tag: container.close },
    { boundary: before, expected: nestedBefore ? 0 : 1, kind: nestedBefore ? 'unexpected' : 'missing', tag: container.open },
    { boundary: after, expected: nestedAfter ? 0 : 1, kind: nestedAfter ? 'unexpected' : 'missing', tag: container.close },
  ]

  return checks.map(check => createIssue(value, check)).filter(isIssue)
}

/** Tests whether a boundary line is the requested parent marker line. */
function isAdjacentTo(line: SourceLine, marker: OffsetRange | undefined): boolean {
  return marker?.start === line.start
}

/** Finds the nearest non-blank line and blank lines between it and an offset. */
function getBoundary(lines: SourceLine[], offset: number, direction: 'next' | 'previous'): Boundary | undefined {
  const isNext = direction === 'next'
  const index = isNext
    ? lines.findIndex(line => line.start >= offset)
    : lines.findLastIndex(line => line.end <= offset)
  if (index < 0)
    return undefined

  const blankLines: SourceLine[] = []
  const step = isNext ? 1 : -1
  for (let i = index; i >= 0 && i < lines.length; i += step) {
    const line = lines[i]
    if (line.blank) {
      isNext ? blankLines.push(line) : blankLines.unshift(line)
      continue
    }

    return {
      line,
      blankLines,
      range: isNext ? { start: offset, end: line.start } : { start: line.end, end: offset },
    }
  }
}

/** Creates an edit when observed blank-line count differs from expected. */
function createIssue(value: string, check: BoundaryCheck): CustomContainerPaddingIssue | undefined {
  const { boundary, expected, kind, tag } = check
  if (!boundary || !tag || boundary.blankLines.length === expected)
    return undefined

  return {
    kind,
    range: boundary.range,
    replacement: getLineEnding(value, boundary.range).repeat(expected + 1),
    tag,
  }
}

/** Narrows optional boundary results to concrete diagnostics. */
function isIssue(issue: CustomContainerPaddingIssue | undefined): issue is CustomContainerPaddingIssue {
  return issue !== undefined
}

/** Picks the first existing line ending in a boundary, defaulting to LF. */
function getLineEnding(value: string, range: OffsetRange): string {
  return value.slice(range.start, range.end).match(/\r\n|\n/)?.[0] ?? '\n'
}

/** Sorts diagnostics in source order. */
function compareIssueStarts(a: CustomContainerPaddingIssue, b: CustomContainerPaddingIssue): number {
  return a.range.start - b.range.start
}

/** Removes duplicate edits created by overlapping nested boundaries. */
function dedupeIssues(issues: CustomContainerPaddingIssue[]): CustomContainerPaddingIssue[] {
  const seen = new Set<string>()
  return issues.filter((issue) => {
    const key = `${issue.range.start}:${issue.range.end}:${issue.kind}`
    if (seen.has(key))
      return false
    seen.add(key)
    return true
  })
}
