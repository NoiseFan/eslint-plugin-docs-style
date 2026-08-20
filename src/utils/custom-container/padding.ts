import type { CustomContainerPaddingIssue, CustomContainerPaddingIssueKind, CustomContainerRange } from '@/types/custom-container'
import { parseCustomContainers } from './parse'

interface MarkdownLine extends CustomContainerRange {
  blank: boolean
}

interface BoundaryLine {
  line: MarkdownLine
  blankLines: MarkdownLine[]
  range: CustomContainerRange
}

/**
 * Checks padding from the parsed container AST and returns source edits for each violated boundary.
 * Markdown lines are used only to preserve exact whitespace ranges and line endings; nesting decisions come from AST ranges.
 */
export function getCustomContainerPaddingIssues(value: string, ignoredRanges: CustomContainerRange[] = []): CustomContainerPaddingIssue[] {
  const containers = parseCustomContainers(value, ignoredRanges)
  const lines = getMarkdownLines(value)
  const issues: CustomContainerPaddingIssue[] = []

  for (const container of containers) {
    const open = container.tag.open.position
    const close = container.tag.close
    const parent = containers.find(candidate => candidate !== container
      && candidate.tag.open.position.start < open.start
      && candidate.tag.close?.end !== undefined
      && candidate.tag.close.end > (close?.end ?? open.end))

    const openingBoundary = getFollowingBoundary(lines, open.end)
    if (openingBoundary)
      addIssue(issues, value, openingBoundary, 0, 'unexpected', open)

    if (close) {
      const closingBoundary = getPrecedingBoundary(lines, close.start)
      if (closingBoundary)
        addIssue(issues, value, closingBoundary, 0, 'unexpected', close)
    }

    const before = getPrecedingBoundary(lines, open.start)
    if (before) {
      const nested = before.line.start === parent?.tag.open.position.start
      addIssue(issues, value, before, nested ? 0 : 1, nested ? 'unexpected' : 'missing', open)
    }

    if (close) {
      const after = getFollowingBoundary(lines, close.end)
      if (after) {
        const nested = after.line.start === parent?.tag.close?.start
        addIssue(issues, value, after, nested ? 0 : 1, nested ? 'unexpected' : 'missing', close)
      }
    }
  }

  return dedupeIssues(issues).sort((a, b) => a.range.start - b.range.start)
}

/**
 * Splits Markdown into source lines while retaining blank-line ranges.
 */
export function getMarkdownLines(value: string): MarkdownLine[] {
  const lines: MarkdownLine[] = []
  const pattern = /([^\r\n]*)(\r\n|\n|$)/g
  for (const match of value.matchAll(pattern)) {
    if (!match[0])
      continue
    const start = match.index ?? 0
    lines.push({ start, end: start + match[1].length, blank: /^[\t ]*$/.test(match[1]) })
  }
  return lines
}

function getFollowingBoundary(lines: MarkdownLine[], offset: number): BoundaryLine | undefined {
  const index = lines.findIndex(line => line.start >= offset)
  if (index < 0)
    return
  const blankLines: MarkdownLine[] = []
  for (let i = index; i < lines.length; i++) {
    if (lines[i].blank) {
      blankLines.push(lines[i])
      continue
    }
    return { line: lines[i], blankLines, range: { start: offset, end: lines[i].start } }
  }
}

function getPrecedingBoundary(lines: MarkdownLine[], offset: number): BoundaryLine | undefined {
  const index = lines.findLastIndex(line => line.end <= offset)
  if (index < 0)
    return
  const blankLines: MarkdownLine[] = []
  for (let i = index; i >= 0; i--) {
    if (lines[i].blank) {
      blankLines.unshift(lines[i])
      continue
    }
    return { line: lines[i], blankLines, range: { start: lines[i].end, end: offset } }
  }
}

function addIssue(issues: CustomContainerPaddingIssue[], value: string, boundary: BoundaryLine, expectedBlankLines: number, kind: CustomContainerPaddingIssueKind, tag: CustomContainerRange): void {
  if (boundary.blankLines.length === expectedBlankLines)
    return
  const { start, end } = boundary.range
  const gap = value.slice(start, end)
  const lineEnding = gap.match(/\r\n|\n/)?.[0] ?? '\n'
  issues.push({ kind, range: { start, end }, replacement: lineEnding.repeat(expectedBlankLines + 1), tag })
}

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

/**
 * Indexes parsed container tags by source offset for focused utility tests.
 */
export function getContainerTags(value: string, ignoredRanges: CustomContainerRange[] = []): Map<number, { kind: 'open' | 'close', range: CustomContainerRange }> {
  const tags = new Map<number, { kind: 'open' | 'close', range: CustomContainerRange }>()
  for (const container of parseCustomContainers(value, ignoredRanges)) {
    tags.set(container.tag.open.position.start, { kind: 'open', range: container.tag.open.position })
    if (container.tag.close)
      tags.set(container.tag.close.start, { kind: 'close', range: { start: container.tag.close.start, end: container.tag.close.end } })
  }
  return tags
}
