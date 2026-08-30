import type { Issues } from './analyzs'
import type { } from '@/types/custom-container'
import { describe, expect, it } from 'vitest'
import { parseCustomContainers } from '@/parser/custom-container'
import {
  addInnerIssues,
  analyzeInnerBoundary,
  checkOuterSide,
  dedupeIssues,
  getContainerBoundary,
  getLineBreak,
  getLineBreakFromChildren,
  getNodesIssues,
  isExternalContent,

} from './analyzs'

describe('collectIssues', () => {
  it('reports missing padding around a top-level container', () => {
    const source = 'Before\n::: info\ncontent\n:::\nAfter'

    expect(getNodesIssues(parseCustomContainers(source))).toEqual([
      { start: 6, end: 7, replacement: '\n\n', messageId: 'missing' },
      { start: 27, end: 28, replacement: '\n\n', messageId: 'missing' },
    ])
  })

  it('reports a shared boundary between continuous containers once', () => {
    const source = '::: info\ncontent\n:::\n::: tip\ncontent\n:::'

    expect(getNodesIssues(parseCustomContainers(source))).toEqual([
      { start: 20, end: 21, replacement: '\n\n', messageId: 'missing' },
    ])
  })

  it('analyzes nested containers using their parent children', () => {
    const source = '::: info\nOuter\n\n::: tip\n\nInner\n\n:::\n\nOuter\n:::'

    expect(getNodesIssues(parseCustomContainers(source))).toEqual([
      { start: 23, end: 25, replacement: '\n', messageId: 'unexpected' },
      { start: 30, end: 32, replacement: '\n', messageId: 'unexpected' },
    ])
  })

  it('preserves the required line break inside an empty container', () => {
    expect(getNodesIssues(parseCustomContainers('::: info\n:::'))).toEqual([])
    expect(getNodesIssues(parseCustomContainers('::: info\n\n:::'))).toEqual([
      { start: 8, end: 10, replacement: '\n', messageId: 'unexpected' },
    ])
  })

  it('preserves CRLF when normalizing padding', () => {
    const source = 'Before\r\n::: info\r\n\r\ncontent\r\n:::\r\nAfter'

    expect(getNodesIssues(parseCustomContainers(source))).toEqual([
      { start: 16, end: 20, replacement: '\r\n', messageId: 'unexpected' },
      { start: 6, end: 8, replacement: '\r\n\r\n', messageId: 'missing' },
      { start: 32, end: 34, replacement: '\r\n\r\n', messageId: 'missing' },
    ])
  })

  it('ignores an unclosed container', () => {
    const source = 'Before\n::: info\ncontent'
    expect(getNodesIssues(parseCustomContainers(source))).toEqual([])
  })

  it('reports unexpected padding at container boundaries', () => {
    const source = '::: info\n\ncontent\n\n:::'

    expect(getNodesIssues(parseCustomContainers(source), { offset: 4 })).toEqual([
      { start: 12, end: 14, replacement: '\n', messageId: 'unexpected' },
      { start: 21, end: 23, replacement: '\n', messageId: 'unexpected' },
    ])
  })

  it('requires one blank line at inner boundaries in loose mode', () => {
    const source = '::: info\ncontent\n:::'

    expect(getNodesIssues(parseCustomContainers(source), { mode: 'loose' })).toEqual([
      { start: 8, end: 9, replacement: '\n\n', messageId: 'missing' },
      { start: 16, end: 17, replacement: '\n\n', messageId: 'missing' },
    ])
  })
})

describe('analyzs helpers', () => {
  it('finds the outermost container tags', () => {
    const container = parseCustomContainers('::: info\ntext\n:::')
      .find(node => node.type === 'custom-container')!
    expect(getContainerBoundary(container)).toEqual({ openIndex: 0, closeIndex: 4 })
  })

  it('normalizes inner blank lines and skips already normalized values', () => {
    const issues: Issues = []
    const opts = { offset: 10, issues }

    addInnerIssues({ type: 'blank', value: '\n\n', position: { start: 4, end: 6 } }, opts)
    addInnerIssues({ type: 'blank', value: '\n', position: { start: 8, end: 9 } }, opts)

    expect(issues).toEqual([{ start: 14, end: 16, replacement: '\n', messageId: 'unexpected' }])
  })

  it('inserts loose-mode padding around direct content boundaries', () => {
    const container = parseCustomContainers('::: info\ncontent\nmore\n:::').find(node => node.type === 'custom-container')!
    const children = container.children.filter(node => node.type !== 'blank')
    const issues: Issues = []

    analyzeInnerBoundary(children, { openIndex: 0, closeIndex: 3 }, {
      offset: 10,
      issues,
      mode: 'loose',
    })

    expect(issues).toEqual([
      { start: 19, end: 19, replacement: '\n\n', messageId: 'missing' },
      { start: 31, end: 31, replacement: '\n\n', messageId: 'missing' },
    ])
  })

  it('identifies external content and line-break styles', () => {
    const nodes = parseCustomContainers('::: info\ncontent\n:::').find(node => node.type === 'custom-container')!.children
    expect(isExternalContent(nodes[0], { index: 0, length: nodes.length })).toBeFalsy()
    expect(isExternalContent(nodes[2], { index: 2, length: nodes.length })).toBeTruthy()
    expect(isExternalContent(nodes.at(-1), { index: nodes.length - 1, length: nodes.length })).toBeFalsy()
    expect(isExternalContent(undefined, { index: 0, length: 0 })).toBeFalsy()

    expect(getLineBreak('a\r\nb')).toBe('\r\n')
    expect(getLineBreak('a\nb')).toBe('\n')
    expect(getLineBreakFromChildren([{ type: 'text', value: 'x', position: { start: 0, end: 1 } }])).toBe('\n')
  })

  it('creates outer issues and removes exact duplicates', () => {
    const container = parseCustomContainers('::: info\ncontent\n:::')
      .find(node => node.type === 'custom-container')!
    const children = container.children

    const issues: Issues = []
    checkOuterSide(children, { boundaryIndex: 0, direction: -1, offset: 0, issues })
    expect(issues).toEqual([])

    const compactChildren = children.filter(node => node.type !== 'blank')
    const missing: Issues = []
    checkOuterSide(compactChildren, { boundaryIndex: 0, direction: 1, offset: 5, issues: missing })
    checkOuterSide(compactChildren, { boundaryIndex: 2, direction: -1, offset: 5, issues: missing })
    expect(missing).toHaveLength(2)

    const duplicate = { start: 1, end: 1, replacement: '\n', messageId: 'missing' as const }
    expect(dedupeIssues([duplicate, duplicate])).toEqual([duplicate])
  })
})
