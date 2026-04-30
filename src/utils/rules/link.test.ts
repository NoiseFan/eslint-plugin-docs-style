import { describe, expect, it } from 'vitest'
import {
  getLinkRange,
  getLinkSpaceContext,
  getLinkSpaceIssue,
  needsSpaceAfterLink,
  needsSpaceBeforeLink,
  validLinkSpace,
} from './link'

describe('getLinkRange', () => {
  it('returns the first markdown link range and null when missing', () => {
    expect(getLinkRange('foo [link](/link) bar')).toEqual([4, 17])
    expect(getLinkRange('plain text')).toBeNull()
  })
})

describe('needsSpaceBeforeLink', () => {
  it('returns true for normal text and false for compact left punctuation', () => {
    expect(needsSpaceBeforeLink('在')).toBeTruthy()
    expect(needsSpaceBeforeLink('a')).toBeTruthy()
    expect(needsSpaceBeforeLink('。')).toBeFalsy()
    expect(needsSpaceBeforeLink('(')).toBeFalsy()
    expect(needsSpaceBeforeLink(undefined)).toBeFalsy()
  })
})

describe('needsSpaceAfterLink', () => {
  it('returns true for normal text and false for compact right punctuation', () => {
    expect(needsSpaceAfterLink('中')).toBeTruthy()
    expect(needsSpaceAfterLink('g')).toBeTruthy()
    expect(needsSpaceAfterLink('。')).toBeFalsy()
    expect(needsSpaceAfterLink(',')).toBeFalsy()
    expect(needsSpaceAfterLink(undefined)).toBeFalsy()
  })
})

describe('getLinkSpaceContext', () => {
  it('returns adjacent chars and raw whitespace ranges around a link', () => {
    const source = 'foo  [link](/link)  bar'
    const range = getLinkRange(source)
    expect(range).not.toBeNull()
    const [start, end] = range!

    expect(getLinkSpaceContext(source, start, end)).toEqual({
      beforeIndex: 2,
      afterIndex: 20,
      beforeSpaceStart: 3,
      beforeSpaceEnd: 5,
      afterSpaceStart: 18,
      afterSpaceEnd: 20,
      beforeChar: 'o',
      afterChar: 'b',
      hasSpaceBefore: true,
      hasSpaceAfter: true,
    })
  })
})

describe('getLinkSpaceIssue', () => {
  it('detects each supported spacing issue', () => {
    const cases = new Map<string, string | null>([
      ['在 [入门指南](/guide/) 中，', null],
      ['prev paragraph. \n\n[`toContain`](/api/expect#tocontain) checks that an array includes a particular item.', null],
      ['在[入门指南](/guide/) 中，', 'missingSpaceBeforeLink'],
      ['在  [入门指南](/guide/) 中，', 'multipleSpacesBeforeLink'],
      ['在。 [入门指南](/guide/) 中，', 'unexpectedSpaceBeforeLink'],
      ['在 [入门指南](/guide/)中，', 'missingSpaceAfterLink'],
      ['在 [入门指南](/guide/)  中，', 'multipleSpacesAfterLink'],
      ['在 [入门指南](/guide/) 。', 'unexpectedSpaceAfterLink'],
      ['In the,[Getting Started](/guide/) guide,', 'missingSpaceBeforeLink'],
    ])

    for (const [source, expected] of cases) {
      const range = getLinkRange(source)
      expect(range).not.toBeNull()
      const [start, end] = range!
      expect(getLinkSpaceIssue(source, start, end)).toBe(expected)
    }
  })
})

describe('validLinkSpace', () => {
  it('should return true for links with valid surrounding spacing', () => {
    const inputs: Array<string> = [
      '在 [入门指南](/guide/) 中，',
      '在。[入门指南](/guide/) 中，',
      '在 [入门指南](/guide/)。',
      '上一段。\n\n[`toContain`](/api/expect#tocontain) checks that an array includes a particular item.',
      'In the [Getting Started](/guide/) guide,',
      'In the, [Getting Started](/guide/) guide,',
      'In the [Getting Started](/guide/),',
    ]

    for (const input of inputs) {
      expect(validLinkSpace(input)).toBeTruthy()
    }
  })

  it('should return false for links with invalid surrounding spacing', () => {
    const inputs: Array<string> = [
      '在[入门指南](/guide/) 中，',
      '在  [入门指南](/guide/) 中，',
      '在。 [入门指南](/guide/) 中，',
      '在 [入门指南](/guide/)中，',
      '在 [入门指南](/guide/)  中，',
      '在 [入门指南](/guide/) 。',
      'In the,[Getting Started](/guide/) guide,',
    ]

    for (const input of inputs) {
      expect(validLinkSpace(input)).toBeFalsy()
    }
  })
})
