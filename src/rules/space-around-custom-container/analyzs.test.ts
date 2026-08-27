import type { CustomContainerAST, TagNode } from '@/types/custom-container'
import { describe, expect, it } from 'vitest'
import { parseCustomContainers } from '@/parser/custom-container'
import {
  addMarkerIssue,
  getCustomContainerMarkerIssues,
  getMarkerMessageId,
  getNormalizedMarker,
} from './analyzs'

describe('getCustomContainerMarkerIssues', () => {
  it('returns no issues for documents without containers', () => {
    expect(getCustomContainerMarkerIssues('plain text only')).toEqual([])
  })

  it('normalizes indentation and opening separators', () => {
    expect(getCustomContainerMarkerIssues('  :::  tip 提示\n内容\n  :::  ')).toEqual([
      { start: 0, end: 13, replacement: '::: tip 提示', messageId: 'unexpectedIndentation' },
      { start: 17, end: 24, replacement: ':::', messageId: 'unexpectedIndentation' },
    ])
  })

  it('requires a separator after the opening fence', () => {
    expect(getCustomContainerMarkerIssues(':::tip\n内容\n:::')).toMatchObject([{ replacement: '::: tip' }])
  })

  it('ignores markers inside ignored ranges', () => {
    expect(getCustomContainerMarkerIssues('```md\n  ::: tip\n```', [{ start: 0, end: 21 }])).toEqual([])
  })

  it('collects marker issues from nested parsed containers', () => {
    expect(getCustomContainerMarkerIssues('::::  info\n :::  tip\n内容\n :::\n::::')).toHaveLength(3)
  })

  it('normalizes parsed opening and closing tags', () => {
    const container = parseCustomContainers(' :::  tip 提示\n内容\n :::  ')[0] as CustomContainerAST
    const open = container.children[0] as TagNode
    const close = container.children.at(-1) as TagNode

    expect(getNormalizedMarker(open)).toBe('::: tip 提示')
    expect(getMarkerMessageId(open)).toBe('unexpectedIndentation')
    expect(getNormalizedMarker(close)).toBe(':::')

    const issues = [] as Parameters<typeof addMarkerIssue>[2]
    addMarkerIssue(open, [], issues)
    addMarkerIssue(close, [close.position], issues)
    expect(issues).toHaveLength(1)
  })

  it('classifies each opening and closing marker spacing problem', () => {
    const cases = [
      [':::tip\ncontent\n:::', 'missingSeparator'],
      [':::  tip\ncontent\n:::', 'unexpectedSeparator'],
      ['::: tip\ncontent\n:::  ', 'unexpectedTrailingSpace'],
    ] as const

    for (const [source, messageId] of cases) {
      expect(getCustomContainerMarkerIssues(source).map(issue => issue.messageId)).toContain(messageId)
    }
  })

  it('skips already normalized markers when adding an issue', () => {
    const container = parseCustomContainers('::: tip\ncontent\n:::')[0] as CustomContainerAST
    const issues = [] as Parameters<typeof addMarkerIssue>[2]
    addMarkerIssue(container.children[0] as TagNode, [], issues)
    addMarkerIssue(container.children.at(-1) as TagNode, [], issues)
    expect(issues).toEqual([])
  })
})
