import { getParsedNodeContext } from '@tests/helpers/markdown'
import { describe, expect, it } from 'vitest'
import { isInlineCodeNode } from '@/parser/ast'
import {
  validateSpace,
  validateSpaceAfterPunctuation,
} from '@/rules/space-around-inline-element/analyze'

describe('validateSpaceAfterPunctuation', () => {
  describe('closing paired punctuation', () => {
    it('allows no space before closing punctuation', () => {
      expect(validateSpaceAfterPunctuation({
        value: ') next',
        whiteSpace: { count: 0, start: 0, end: 0 },
        hasPunctuation: true,
        punctuationType: 'half',
      })).toBeUndefined()
    })

    it('reports a single unexpected space before closing punctuation', () => {
      expect(validateSpaceAfterPunctuation({
        value: ' ) next',
        whiteSpace: { count: 1, start: 0, end: 1 },
        hasPunctuation: true,
        punctuationType: 'half',
      })).toBe('unexpected-space-after')
    })

    it('reports multiple unexpected spaces before closing punctuation', () => {
      expect(validateSpaceAfterPunctuation({
        value: '  ) next',
        whiteSpace: { count: 2, start: 0, end: 2 },
        hasPunctuation: true,
        punctuationType: 'half',
      })).toBe('unexpected-space-after')
    })
  })

  describe('opening paired punctuation', () => {
    it('reports a missing space before opening punctuation', () => {
      expect(validateSpaceAfterPunctuation({
        value: '(next',
        whiteSpace: { count: 0, start: 0, end: 0 },
        hasPunctuation: true,
        punctuationType: 'half',
      })).toBe('missing-space-after')
    })

    it('allows a single space before opening punctuation', () => {
      expect(validateSpaceAfterPunctuation({
        value: ' (next',
        whiteSpace: { count: 1, start: 1, end: 2 },
        hasPunctuation: true,
        punctuationType: 'half',
      })).toBeUndefined()
    })

    it('reports multiple spaces before opening punctuation', () => {
      expect(validateSpaceAfterPunctuation({
        value: '  (next',
        whiteSpace: { count: 2, start: 0, end: 2 },
        hasPunctuation: true,
        punctuationType: 'half',
      })).toBe('multiple-spaces-after')
    })
  })
})

describe('validateSpace', () => {
  it('allows spaced adjacent inline elements in table cells', () => {
    const markdown = '| Setting | Value|\n| --- | --- |\n| Working directory | `/path` `/to/your-project-root`|'
    expect(validateSpace(getParsedNodeContext(markdown, isInlineCodeNode))).toBeUndefined()
  })

  it('skips standalone inline elements in table cells without adjacent text', () => {
    const markdown = '| Setting | Value|\n| --- | --- |\n| Working directory | `/path/to/your-project-root`|'
    expect(validateSpace(getParsedNodeContext(markdown, isInlineCodeNode))).toBeUndefined()
  })
})
