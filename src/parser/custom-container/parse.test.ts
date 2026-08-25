import { describe, expect, it } from 'vitest'
import {
  parseBlankNode,
  parseCloseTag,
  parseCustomContainers,
  parseOpenTag,
  splitLines,
} from '@/parser/custom-container'

describe('parseCustomContainers', () => {
  it('parses opening, text, and closing nodes', async () => {
    const container = parseCustomContainers('::: info Title content\ncontent\n:::')

    await expect(JSON.stringify(container, null, 2))
      .toMatchFileSnapshot('__snapshots__/container-ast.json')
  })

  it('includes a blank node for an empty line', () => {
    const container = parseCustomContainers('::: info Title\n\ncontent\n:::')

    expect(container.children).toContainEqual({
      type: 'blank',
      value: '\n',
      position: expect.any(Object),
    })
  })

  it('parses nested containers and increments their depth', async () => {
    const container = parseCustomContainers(':::: info\ntext\n::: tip\nnested\n:::\n::::')
    const nested = container.children.find(child => child.type === 'cumstom-container')

    await expect(JSON.stringify(nested, null, 2))
      .toMatchFileSnapshot('__snapshots__/nested-container-ast.json')
  })

  it('parses a details container with the open attribute', async () => {
    const container = parseCustomContainers('::: details Click me {open}\nContent\n:::')
    await expect(JSON.stringify(container, null, 2))
      .toMatchFileSnapshot(`__snapshots__/multi-attrs.json`)
  })

  it('keeps text that is not part of a container', () => {
    expect(parseCustomContainers('first\nsecond')).toMatchObject({
      depth: 1,
      children: [
        { type: 'text', value: 'first' },
        { type: 'blank', value: '\n' },
        { type: 'text', value: 'second' },
      ],
    })
  })

  it('continues parsing same-level content after a top-level container', () => {
    expect(parseCustomContainers('::: info\ncontent\n:::\nAfter')).toMatchObject({
      children: [
        { type: 'open' },
        { type: 'blank', value: '\n' },
        { type: 'text', value: 'content' },
        { type: 'blank', value: '\n' },
        { type: 'close' },
        { type: 'blank', value: '\n' },
        { type: 'text', value: 'After' },
      ],
    })
  })

  it('preserves consecutive line breaks as one blank node with its full offset', () => {
    expect(parseCustomContainers('first\n\nsecond')).toMatchObject({
      children: [
        { type: 'text', value: 'first', position: { start: 0, end: 5 } },
        { type: 'blank', value: '\n\n', position: { start: 5, end: 7 } },
        { type: 'text', value: 'second', position: { start: 7, end: 13 } },
      ],
    })
  })

  it('preserves a trailing line break and its source offset', () => {
    expect(parseCustomContainers('first\n')).toMatchObject({
      children: [
        { type: 'text', value: 'first', position: { start: 0, end: 5 } },
        { type: 'blank', value: '\n', position: { start: 5, end: 6 } },
      ],
    })
  })

  it('preserves mixed LF and CRLF line breaks', () => {
    expect(parseCustomContainers('first\r\nsecond\nthird')).toMatchObject({
      children: [
        { type: 'text', value: 'first', position: { start: 0, end: 5 } },
        { type: 'blank', value: '\r\n', position: { start: 5, end: 7 } },
        { type: 'text', value: 'second', position: { start: 7, end: 13 } },
        { type: 'blank', value: '\n', position: { start: 13, end: 14 } },
        { type: 'text', value: 'third', position: { start: 14, end: 19 } },
      ],
    })
  })

  it('parses CRLF input and closes the container', async () => {
    const container = parseCustomContainers('::: info Title content\r\ncontent\r\n:::')

    await expect(JSON.stringify(container, null, 2))
      .toMatchFileSnapshot('__snapshots__/CRLF-container.json')
  })
})

describe('splitLines', () => {
  it('preserves line breaks as separate items', () => {
    expect(splitLines('first\nsecond')).toStrictEqual(['first', '\n', 'second'])
  })

  it('preserves empty items between consecutive line breaks', () => {
    expect(splitLines('first\n\nsecond')).toStrictEqual(['first', '\n', '\n', 'second'])
  })

  it('preserves CRLF and does not add a trailing empty item', () => {
    expect(splitLines('first\r\n')).toStrictEqual(['first', '\r\n'])
    expect(splitLines('\r\nfirst\r\nsecond\r\n')).toStrictEqual(['\r\n', 'first', '\r\n', 'second', '\r\n'])
  })

  it('returns an empty array for an empty string', () => {
    expect(splitLines('')).toStrictEqual([])
  })
})

describe('parseOpenTag', () => {
  it('parses an opening tag', () => {
    expect(parseOpenTag('::: info Optional title')).toStrictEqual({
      type: 'open',
      raw: '::: info Optional title',
      value: { content: 'info', start: 4, end: 8 },
      title: 'Optional title',
      position: { start: 0, end: 23 },
    })
  })

  it('parses an optional opening-tag attribute', () => {
    expect(parseOpenTag('::: details Click me {open}')).toMatchObject({
      title: 'Click me',
      attribute: { content: 'open', raw: '{open}' },
    })
    expect(parseOpenTag('::: details Click me')).not.toHaveProperty('attribute')
  })

  it('parses title and attribute from the same optional suffix', () => {
    expect(parseOpenTag('::: details {open}')).toMatchObject({
      title: undefined,
      attribute: { content: 'open', raw: '{open}' },
    })
    expect(parseOpenTag('::: info Optional title')).toMatchObject({
      title: 'Optional title',
    })
  })

  it('calculates positions from the previous node', () => {
    const prevNode = parseOpenTag('::: info')!

    expect(parseOpenTag('::: warning Title', prevNode)).toStrictEqual({
      type: 'open',
      raw: '::: warning Title',
      value: { content: 'warning', start: 12, end: 19 },
      title: 'Title',
      position: { start: 8, end: 25 },
    })
  })

  it('returns null for a non-opening tag', () => {
    expect(parseOpenTag('content')).toBeNull()
  })

  it('preserves a CRLF-free tag line', () => {
    expect(parseOpenTag('::: warning Title \r\n')).toMatchObject({
      value: { content: 'warning', start: 4, end: 11 },
      title: 'Title',
    })
  })
})

describe('parseCloseTag', () => {
  it('parses a closing tag after the previous node', () => {
    const prevNode = parseOpenTag('::: info')!

    expect(parseCloseTag(':::', prevNode)).toStrictEqual({
      type: 'close',
      raw: ':::',
      value: { content: ':::', start: 8, end: 11 },
      position: { start: 8, end: 11 },
    })
  })

  it('accepts CRLF-normalized and longer closing fences', () => {
    expect(parseCloseTag('::::')).toMatchObject({ type: 'close', raw: '::::' })
  })
})

describe('parseBlankNode', () => {
  it('creates a blank node and merges consecutive blank lines', () => {
    const children: Parameters<typeof parseBlankNode>[0] = []

    parseBlankNode(children)
    parseBlankNode(children, { prevNode: children.at(-1) })

    expect(children).toStrictEqual([
      { type: 'blank', value: '\n\n', position: { start: 0, end: 2 } },
    ])
  })

  it('preserves CRLF line endings and offsets', () => {
    const children: Parameters<typeof parseBlankNode>[0] = []

    parseBlankNode(children, { newline: '\r\n' })

    expect(children).toStrictEqual([
      { type: 'blank', value: '\r\n', position: { start: 0, end: 2 } },
    ])
  })
})
