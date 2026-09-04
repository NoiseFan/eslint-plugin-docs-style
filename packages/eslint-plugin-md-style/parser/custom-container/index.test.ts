import type { Root } from 'mdast'
import { describe, expect, it } from 'vitest'
import { CUSTOM_CONTAINER_TYPES, getCodeNodeRanges, isCloseTag, isCustomContainerMarker, isCustomContainerType, isOpenTag } from '.'
import { parseMarkdown } from '../markdown'

describe('isCustomContainerType', () => {
  it.each(CUSTOM_CONTAINER_TYPES)('accepts %s', (type) => {
    expect(isCustomContainerType(type)).toBeTruthy()
  })

  it.each(['note', 'INFO', '', 'warning!'])('rejects %s', (type) => {
    expect(isCustomContainerType(type)).toBeFalsy()
  })
})

describe('isOpenTag', () => {
  it('should return true for opening tags', () => {
    const inputs = ['::: info', ':::info', '::: info\ncontent', ':::: warning Optional title', ' ::: details {open}', '   ::: code-group', ':::\ttip']
    for (const input of inputs)
      expect(isOpenTag(input), input).toBeTruthy()
  })

  it('should return false for non-opening tags', () => {
    const inputs = [':::', '    ::: info', 'text ::: info']
    for (const input of inputs)
      expect(isOpenTag(input), input).toBeFalsy()
  })
})

describe('isCloseTag', () => {
  it('should return true for closing tags', () => {
    const inputs = [':::', '::::', ' :::', '   :::', ':::\t', 'text:::', '::: text', '\n:::', ':::\n']
    for (const input of inputs)
      expect(isCloseTag(input), input).toBeTruthy()
  })

  it('should return false for non-closing tags', () => {
    const inputs = [':', '::']
    for (const input of inputs)
      expect(isCloseTag(input), input).toBeFalsy()
  })
})

describe('isCustomContainerMarker', () => {
  it('should return true for custom container markers on the next line', () => {
    const inputs = ['::: info', '::: tip', ':::: warning']
    for (const input of inputs)
      expect(isCustomContainerMarker(input), input).toBeTruthy()
  })

  it('should return false for inline punctuation and non-marker values', () => {
    const inputs = [undefined, '', ':::', ' ::: ', '\n::', '\n: text', '\n::: text', 'text\n:::']
    for (const input of inputs)
      expect(isCustomContainerMarker(input), input).toBeFalsy()
  })
})

describe('getCodeNodeRanges', () => {
  it('collects code node ranges while walking nested markdown', () => {
    const { ast } = parseMarkdown('Before `inline`\n\n```ts\ncode\n```')
    expect(getCodeNodeRanges(ast)).toEqual([{ start: 17, end: 31 }])

    expect(getCodeNodeRanges(null as unknown as Root)).toEqual([])
    expect(getCodeNodeRanges({ type: 'root', children: [{ type: 'code', value: 'code' }] })).toEqual([])
  })
})
