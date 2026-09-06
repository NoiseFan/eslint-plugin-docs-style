import type { CustomContainer } from '@/'
import { parseMarkdown } from '@/'
import { describe, expect, it } from 'vitest'

function firstContainer(source: string): CustomContainer {
  const node = parseMarkdown(source).children[0]
  expect(node?.type).toBe('customContainer')
  return node as CustomContainer
}

describe('customContainerFromMarkdown', () => {
  it('creates a parent node whose body is parsed as Markdown', () => {
    const container = firstContainer('::: warning Be careful\n\n**content**\n\n:::')

    expect(container).toMatchObject({
      type: 'customContainer',
      tag: {
        open: {
          type: { value: 'warning' },
          label: { value: 'Be careful' },
          markerLength: 3,
        },
        close: { markerLength: 3 },
      },
      children: [{
        type: 'paragraph',
        children: [{ type: 'strong', children: [{ type: 'text', value: 'content' }] }],
      }],
    })
  })

  it('keeps opening fields focused and precisely positioned', () => {
    const container = firstContainer(' ::: details Click me {open}\r\nContent\r\n ::::')
    expect(container.tag.open).toEqual({
      type: {
        value: 'details',
        position: {
          start: { line: 1, column: 6, offset: 5 },
          end: { line: 1, column: 13, offset: 12 },
        },
      },
      label: {
        value: 'Click me',
        position: {
          start: { line: 1, column: 14, offset: 13 },
          end: { line: 1, column: 22, offset: 21 },
        },
      },
      markerLength: 3,
      attr: {
        value: 'open',
        position: {
          start: { line: 1, column: 23, offset: 22 },
          end: { line: 1, column: 29, offset: 28 },
        },
      },
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 29, offset: 28 },
      },
    })
    expect(container.tag.close).toEqual({
      markerLength: 4,
      position: {
        start: { line: 3, column: 1, offset: 39 },
        end: { line: 3, column: 6, offset: 44 },
      },
    })
  })

  it('supports nested containers and resumes parent flow content', () => {
    const outer = firstContainer(':::: info\nbefore\n\n::: tip\n- nested\n:::\n\nafter\n::::')

    expect(outer.children.map(node => node.type)).toEqual([
      'paragraph',
      'customContainer',
      'paragraph',
    ])
    expect((outer.children[1] as CustomContainer).children[0]).toMatchObject({
      type: 'list',
      children: [{ type: 'listItem' }],
    })
  })

  it('does not let a shorter fence close a wider container', () => {
    const container = firstContainer(':::: info\ntext\n:::\nmore\n::::')
    expect(container.children).toMatchObject([{
      type: 'paragraph',
      children: [{ type: 'text', value: 'text\n:::\nmore' }],
    }])
    expect(container.tag.close?.markerLength).toBe(4)
  })

  it('omits closeTag on an unclosed container', () => {
    const container = firstContainer('::: warning\nbody')
    expect(container).not.toHaveProperty('closeTag')
    expect(container.position?.end).toEqual({ line: 2, column: 5, offset: 16 })
  })

  it('does not recognize markers in code', () => {
    const root = parseMarkdown('```md\n::: warning\n```\n\n    ::: tip\n\n`::: note`')
    expect(JSON.stringify(root)).not.toContain('customContainer')
  })

  it('parses standard block structures inside the container', () => {
    const container = firstContainer([
      '::: info',
      '# Heading',
      '',
      '> quote',
      '',
      '- list',
      '',
      '```ts',
      'code',
      '```',
      ':::',
    ].join('\n'))
    expect(container.children.map(node => node.type)).toEqual([
      'heading',
      'blockquote',
      'list',
      'code',
    ])
  })

  it('supports adjacent containers surrounded by Markdown', () => {
    const root = parseMarkdown('before\n\n::: info\na\n:::\n::: tip\nb\n:::\n\nafter')
    expect(root.children.map(node => node.type)).toEqual([
      'paragraph',
      'customContainer',
      'customContainer',
      'paragraph',
    ])
  })

  it('works inside block quotes and list items without claiming their prefixes', () => {
    const quote = parseMarkdown('> ::: warning\n> body\n> :::').children[0]
    const quotedContainer = quote && 'children' in quote ? quote.children[0] as CustomContainer : undefined
    expect(quotedContainer).toMatchObject({
      type: 'customContainer',
      position: { start: { column: 3, offset: 2 } },
      tag: {
        open: { position: { start: { column: 3, offset: 2 } } },
        close: { position: { start: { column: 3, offset: 23 } } },
      },
    })

    const list = parseMarkdown('- ::: tip\n  body\n  :::').children[0]
    const item = list && 'children' in list ? list.children[0] : undefined
    const listedContainer = item && 'children' in item ? item.children[0] as CustomContainer : undefined
    expect(listedContainer).toMatchObject({
      type: 'customContainer',
      position: { start: { column: 3, offset: 2 } },
    })
  })

  it('accepts an equal or longer closing fence and trailing whitespace only', () => {
    expect(firstContainer('::: info\na\n:::').tag.close?.markerLength).toBe(3)
    expect(firstContainer('::: info\na\n::::  ').tag.close?.markerLength).toBe(4)
    expect(firstContainer('::: info\na\n::: trailing')).not.toHaveProperty('closeTag')
  })

  it.each([0, 1, 2, 3])('accepts %i leading spaces', (indent) => {
    expect(parseMarkdown(`${' '.repeat(indent)}::: info`).children[0]?.type).toBe('customContainer')
  })

  it('keeps offsets correct for LF, CRLF, and a final newline', () => {
    const lf = firstContainer('::: info\nbody\n:::\n')
    const crlf = firstContainer('::: info\r\nbody\r\n:::\r\n')
    expect(lf.position?.end).toEqual({ line: 3, column: 4, offset: 17 })
    expect(crlf.position?.end).toEqual({ line: 3, column: 4, offset: 19 })
    expect(crlf.children[0]?.position?.start.offset).toBe(10)
  })

  it('is JSON serializable', () => {
    expect(() => JSON.stringify(firstContainer('::: info\nbody\n:::'))).not.toThrow()
  })

  it.each([
    ': warning',
    ':: warning',
    '::: ',
    '::: warning!',
    '    ::: warning',
  ])('rejects invalid opening syntax: %j', (source) => {
    expect(parseMarkdown(source).children[0]?.type).not.toBe('customContainer')
  })
})
