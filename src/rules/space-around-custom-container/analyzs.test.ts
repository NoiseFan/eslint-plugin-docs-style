import type { CustomContainerAST, TagNode } from '@/types/custom-container'
import { describe, expect, it } from 'vitest'
import { parseCustomContainers } from '@/parser/custom-container'
import {
  analyzeMarker,
  getMarkerMessageId,
  getSourceIssues,
  normalizedMarker,
} from './analyzs'

describe('getCustomContainerMarkerIssues', () => {
  it('returns no issues for documents without containers', () => {
    expect(getSourceIssues('plain text only')).toEqual([])
  })

  it('normalizes indentation and opening separators', () => {
    expect(getSourceIssues('  :::  tip 提示\n内容\n  :::  ')).toEqual([
      { start: 0, end: 13, replacement: '::: tip 提示', messageId: 'unexpectedIndentation' },
      { start: 17, end: 24, replacement: ':::', messageId: 'unexpectedIndentation' },
    ])
  })

  it('requires a separator after the opening fence', () => {
    expect(getSourceIssues(':::tip\n内容\n:::')).toMatchObject([{ replacement: '::: tip' }])
  })

  it('ignores markers inside ignored ranges', () => {
    expect(getSourceIssues('```md\n  ::: tip\n```', [{ start: 0, end: 21 }])).toEqual([])
  })

  it('collects marker issues from nested parsed containers', () => {
    expect(getSourceIssues('::::  info\n :::  tip\n内容\n :::\n::::')).toHaveLength(3)
  })

  it('normalizes parsed opening and closing tags', () => {
    const container = parseCustomContainers(' :::  tip 提示\n内容\n :::  ')[0] as CustomContainerAST
    const open = container.children[0] as TagNode
    const close = container.children.at(-1) as TagNode

    expect(normalizedMarker(open)).toBe('::: tip 提示')
    expect(getMarkerMessageId(open)).toBe('unexpectedIndentation')
    expect(normalizedMarker(close)).toBe(':::')

    const issues = [] as Parameters<typeof analyzeMarker>[2]
    analyzeMarker(open, [], issues)
    analyzeMarker(close, [close.position], issues)
    expect(issues).toHaveLength(1)
  })

  it('classifies each opening and closing marker spacing problem', () => {
    const cases = [
      [':::tip\ncontent\n:::', 'missingSeparator'],
      [':::  tip\ncontent\n:::', 'unexpectedSeparator'],
      ['::: tip\ncontent\n:::  ', 'unexpectedTrailingSpace'],
    ] as const

    for (const [source, messageId] of cases) {
      expect(getSourceIssues(source).map(issue => issue.messageId)).toContain(messageId)
    }
  })

  it('skips already normalized markers when adding an issue', () => {
    const container = parseCustomContainers('::: tip\ncontent\n:::')[0] as CustomContainerAST
    const issues = [] as Parameters<typeof analyzeMarker>[2]
    analyzeMarker(container.children[0] as TagNode, [], issues)
    analyzeMarker(container.children.at(-1) as TagNode, [], issues)
    expect(issues).toEqual([])
  })
})
