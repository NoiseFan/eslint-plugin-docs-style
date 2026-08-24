import { describe, expect, it } from 'vitest'
import { findNode, isLinkNode } from '@/parser/ast'
import { parseMarkdown } from '@/parser/markdown'

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
