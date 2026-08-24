import type { OffsetRange, SourceLine } from '@/types/custom-container'
import { splitLines } from './parse'

/** Splits source into line ranges while retaining blank-line classification. */
export function getSourceLines(value: string): SourceLine[] {
  const lines: SourceLine[] = []
  let start = 0
  let line = ''

  for (const part of splitLines(value)) {
    if (isLineEnding(part)) {
      lines.push(createSourceLine(line, start))
      start += line.length + part.length
      line = ''
    }
    else {
      line += part
    }
  }

  if (line || start < value.length)
    lines.push(createSourceLine(line, start))

  return lines
}

/** Checks whether a source line belongs to an excluded range. */
export function isIgnoredLine(line: SourceLine, ranges: OffsetRange[]): boolean {
  return ranges.some(range => line.start >= range.start && line.start < range.end)
}

/** Builds one source-line record from its content and absolute offset. */
function createSourceLine(value: string, start: number): SourceLine {
  return { value, start, end: start + value.length, blank: /^[\t ]*$/.test(value) }
}

/** Identifies the line-ending tokens emitted by `splitLines`. */
function isLineEnding(value: string): boolean {
  return value === '\n' || value === '\r\n'
}
