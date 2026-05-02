import { describe, expect, it } from 'vitest'
import { findNode, isLinkNode, isParagraphNode, isParentNode, isTextNode } from './ast'
import { parseMarkdown } from './markdown'

describe('isParentNode', () => {
  it('returns true for nodes with children', () => {
    const { ast } = parseMarkdown('A [link](/guide/) here.')
    const paragraph = findNode(ast, isParagraphNode)

    expect(isParentNode(ast)).toBeTruthy()
    expect(paragraph && isParentNode(paragraph)).toBeTruthy()
  })

  it('returns false for leaf nodes', () => {
    const { ast } = parseMarkdown('Plain text.')
    const text = findNode(ast, isTextNode)

    expect(text && isParentNode(text)).toBeFalsy()
  })
})

describe('findNode', () => {
  it('returns the first node that matches the predicate', () => {
    const { ast } = parseMarkdown('First [one](/one/) and [two](/two/).')
    const link = findNode(ast, isLinkNode)

    expect(link?.url).toStrictEqual('/one/')
  })

  it('returns undefined when no node matches', () => {
    const { ast } = parseMarkdown('Plain text.')

    expect(findNode(ast, isLinkNode)).toBeUndefined()
  })
})

describe('isLinkNode', () => {
  it('narrows link nodes', () => {
    const { ast } = parseMarkdown('[guide](/guide/)')
    const paragraph = findNode(ast, isParagraphNode)
    const link = findNode(ast, isLinkNode)

    expect(paragraph && isLinkNode(paragraph)).toBeFalsy()
    expect(link && isLinkNode(link)).toBeTruthy()
  })
})
