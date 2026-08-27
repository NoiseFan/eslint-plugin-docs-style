import type { CustomContainerAST, TagNode } from '@/types/custom-container'
import { describe, expect, it } from 'vitest'
import { parseCustomContainers } from '@/parser/custom-container'
import {
  addMarkerIssue,
  collectMarkerIssues,
  getCustomContainerMarkerIssues,
  getMarkerMessageId,
  getNormalizedMarker,
} from './analyzs'

describe('getCustomContainerMarkerIssues', () => {
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
    const issues = [] as Parameters<typeof collectMarkerIssues>[2]
    collectMarkerIssues(parseCustomContainers('::::  info\n :::  tip\n内容\n :::\n::::'), [], issues)
    expect(issues).toHaveLength(3)
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
})
