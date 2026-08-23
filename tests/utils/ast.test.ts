import { describe, expect, it } from 'vitest'
import {
  findNode,
  getAdjacentChar,
  getNodeContext,
  getNodeContextByParent,
  hasChildren,
  isLinkNode,
  isParagraphNode,
  isTextNode,
} from '@/utils/ast'
import { parseMarkdown } from '@/utils/markdown'
import { buildTextNodeAst } from '@/utils/text'

describe('isParentNode', () => {
  it('returns true for nodes with children', () => {
    const { ast } = parseMarkdown('A [link](/guide/) here.')
    const paragraph = findNode(ast, isParagraphNode)

    expect(hasChildren(ast)).toBeTruthy()
    expect(paragraph && hasChildren(paragraph)).toBeTruthy()
  })

  it('returns false for leaf nodes', () => {
    const { ast } = parseMarkdown('Plain text.')
    const text = findNode(ast, isTextNode)

    expect(text && hasChildren(text)).toBeFalsy()
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

describe('getNodeContextByParent', () => {
  it('returns adjacent token nodes from a tokenized text AST', () => {
    const { children } = buildTextNodeAst({
      type: 'text',
      value: '在 watch 模式下，',
    })

    expect(getNodeContextByParent(children, 1)).toStrictEqual({
      prev: children[0],
      current: children[1],
      next: children[2],
    })
  })

  it('returns undefined for missing adjacent siblings at the edges', () => {
    const { children } = buildTextNodeAst({
      type: 'text',
      value: '在 watch 模式下，',
    })

    expect(getNodeContextByParent(children, 0)).toStrictEqual({
      prev: undefined,
      current: children[0],
      next: children[1],
    })
  })
})

describe('getNodeContext', () => {
  it('returns no siblings when the ancestor list has no parent node', () => {
    const { ast } = parseMarkdown('Plain text.')
    const paragraph = findNode(ast, isParagraphNode)

    expect(paragraph).toBeDefined()
    expect(getNodeContext({ sourceCode: { getAncestors: () => [] } }, paragraph!)).toStrictEqual({
      prev: undefined,
      next: undefined,
      current: paragraph,
    })
  })

  it('returns no siblings when the current node is absent from its parent', () => {
    const { ast } = parseMarkdown('Plain text.')
    const paragraph = findNode(ast, isParagraphNode)
    const parent = { type: 'root', children: [] }

    expect(paragraph).toBeDefined()
    expect(getNodeContext({ sourceCode: { getAncestors: () => [parent] } }, paragraph!)).toStrictEqual({
      parent,
      prev: undefined,
      next: undefined,
      current: paragraph,
    })
  })
})

describe('getAdjacentChar', () => {
  it('returns the first visible character after trimming leading whitespace', () => {
    expect(getAdjacentChar('  在 watch 模式下，', 'head')).toBe('在')
  })

  it('returns the last visible character after trimming trailing whitespace', () => {
    expect(getAdjacentChar('在 watch 模式下，  ', 'tail')).toBe('，')
  })

  it('returns undefined for empty and whitespace-only strings', () => {
    expect(getAdjacentChar('', 'head')).toBeUndefined()
    expect(getAdjacentChar('   ', 'tail')).toBeUndefined()
    expect(getAdjacentChar(undefined, 'head')).toBeUndefined()
  })
})
