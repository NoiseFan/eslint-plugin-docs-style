import { fromMarkdown } from 'mdast-util-from-markdown'
import { describe, expect, it } from 'vitest'
import { customContainer, customContainerFromMarkdown, parseMarkdown } from '../src/index'

describe('parseMarkdown', () => {
  it('parses CommonMark and preserves source positions', () => {
    expect(parseMarkdown('# Hello\n\nWorld')).toMatchObject({
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          position: {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: 8, offset: 7 },
          },
        },
        {
          type: 'paragraph',
          position: {
            start: { line: 3, column: 1, offset: 9 },
            end: { line: 3, column: 6, offset: 14 },
          },
        },
      ],
    })
  })

  it('enables GFM by default and can disable it', () => {
    expect(parseMarkdown('| a |\n| - |').children[0]?.type).toBe('table')
    expect(parseMarkdown('| a |\n| - |', { gfm: false }).children[0]?.type).toBe('paragraph')
  })

  it('accepts Uint8Array input', () => {
    expect(parseMarkdown(new Uint8Array([104, 101, 108, 108, 111])).children[0]).toMatchObject({
      type: 'paragraph',
    })
  })

  it('can disable custom containers', () => {
    expect(parseMarkdown('::: warning\nbody\n:::', { customContainer: false }).children)
      .not
      .toContainEqual(expect.objectContaining({ type: 'customContainer' }))
  })

  it('composes the two extensions without the convenience parser', () => {
    const root = fromMarkdown('::: info\nbody\n:::', {
      extensions: [customContainer()],
      mdastExtensions: [customContainerFromMarkdown()],
    })
    expect(root.children[0]).toMatchObject({ type: 'customContainer' })
  })

  it('parses GFM task lists alongside containers', () => {
    expect(parseMarkdown('::: info\n- [x] done\n:::').children[0]).toMatchObject({
      type: 'customContainer',
      children: [{ children: [{ checked: true }] }],
    })
  })
})
