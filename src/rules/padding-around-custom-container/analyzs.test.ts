import { describe, expect, it } from 'vitest'
import { parseCustomContainers } from '@/parser/custom-container'
import { collectEdits } from './analyzs'

describe('collectEdits', () => {
  it('reports missing padding around a top-level container', () => {
    const source = 'Before\n::: info\ncontent\n:::\nAfter'

    expect(collectEdits(parseCustomContainers(source), 0)).toEqual([
      { start: 6, end: 7, replacement: '\n\n', messageId: 'missing' },
      { start: 27, end: 28, replacement: '\n\n', messageId: 'missing' },
    ])
  })

  it('reports unexpected padding at container boundaries', () => {
    const source = '::: info\n\ncontent\n\n:::'

    expect(collectEdits(parseCustomContainers(source), 4)).toEqual([
      { start: 12, end: 14, replacement: '\n', messageId: 'unexpected' },
      { start: 21, end: 23, replacement: '\n', messageId: 'unexpected' },
    ])
  })

  it('analyzes nested containers using their parent children', () => {
    const source = '::: info\nOuter\n\n::: tip\n\nInner\n\n:::\n\nOuter\n:::'

    expect(collectEdits(parseCustomContainers(source), 0)).toEqual([
      { start: 23, end: 25, replacement: '\n', messageId: 'unexpected' },
      { start: 30, end: 32, replacement: '\n', messageId: 'unexpected' },
    ])
  })

  it('preserves CRLF when normalizing padding', () => {
    const source = 'Before\r\n::: info\r\n\r\ncontent\r\n:::\r\nAfter'

    expect(collectEdits(parseCustomContainers(source), 0)).toEqual([
      { start: 16, end: 20, replacement: '\r\n', messageId: 'unexpected' },
      { start: 6, end: 8, replacement: '\r\n\r\n', messageId: 'missing' },
      { start: 32, end: 34, replacement: '\r\n\r\n', messageId: 'missing' },
    ])
  })

  it('reports a shared boundary between continuous containers once', () => {
    const source = '::: info\ncontent\n:::\n::: tip\ncontent\n:::'

    expect(collectEdits(parseCustomContainers(source), 0)).toEqual([
      { start: 20, end: 21, replacement: '\n\n', messageId: 'missing' },
    ])
  })

  it('preserves the required line break inside an empty container', () => {
    expect(collectEdits(parseCustomContainers('::: info\n:::'), 0)).toEqual([])
    expect(collectEdits(parseCustomContainers('::: info\n\n:::'), 0)).toEqual([
      { start: 8, end: 10, replacement: '\n', messageId: 'unexpected' },
    ])
  })

  it('ignores an unclosed container', () => {
    const source = 'Before\n::: info\ncontent'
    expect(collectEdits(parseCustomContainers(source), 0)).toEqual([])
  })
})
