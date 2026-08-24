import type { Link } from 'mdast'
import { describe, expect, it } from 'vitest'
import { findNode, isLinkNode } from '@/utils/ast'
import { parseMarkdown } from '@/utils/markdown'
import {
  getParsedLinkContext,
  getParsedNodeContext,
} from './markdown'

describe('parseMarkdown', () => {
  it('returns the parsed AST and SourceCode wrapper', () => {
    const { ast, sourceCode } = parseMarkdown('# Title\n\nSee [guide](/guide/).')

    expect(ast.type).toStrictEqual('root')
    expect(sourceCode.ast).toStrictEqual(ast)
    expect(findNode(ast, isLinkNode)?.url).toStrictEqual('/guide/')
  })

  it('parses yaml frontmatter as a yaml node', () => {
    const markdown = `---
title: 快速起步 | 指南
next:
  text: Writing Tests
  link: /guide/learn/writing-tests
demo: 123
---`
    const { ast } = parseMarkdown(markdown)

    expect(findNode(ast, node => node.type === 'yaml')?.type).toStrictEqual('yaml')
  })
})

describe('getParsedNodeContext', () => {
  it('returns context for the first requested node', () => {
    const context = getParsedNodeContext('Before [guide](/guide/) after.', isLinkNode)

    expect(context.current.url).toStrictEqual('/guide/')
    expect(context.prev?.type).toStrictEqual('text')
    expect(context.next?.type).toStrictEqual('text')
  })

  it('throws when the requested node is missing', () => {
    expect(() => getParsedNodeContext('Plain text.', isLinkNode)).toThrow(
      'Expected markdown fixture to contain the requested node.',
    )
  })
})

describe('getParsedLinkContext', () => {
  it('returns context for the first parsed link', () => {
    const context = getParsedLinkContext('Before [guide](/guide/) after.')

    expect((context.current as Link).url).toStrictEqual('/guide/')
    expect(context.prev).toMatchObject({ type: 'text', value: 'Before ' })
    expect(context.next).toMatchObject({ type: 'text', value: ' after.' })
  })

  it('throws when the fixture does not contain a link', () => {
    expect(() => getParsedLinkContext('Plain text.')).toThrow(
      'Expected markdown fixture to contain a link.',
    )
  })
})
