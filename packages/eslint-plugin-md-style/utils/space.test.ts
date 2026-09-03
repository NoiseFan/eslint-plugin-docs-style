import { describe, expect, it } from 'vitest'
import { getWhiteSpace } from '@/utils/space'

describe('getWhiteSpace', () => {
  it('counts leading whitespace', () => {
    expect(getWhiteSpace(' this is a paragraph')).toStrictEqual({ count: 1, start: 0, end: 1 })
    expect(getWhiteSpace('  this is a paragraph ', 'head')).toStrictEqual({ count: 2, start: 0, end: 2 })
  })

  it('counts trailing whitespace', () => {
    expect(getWhiteSpace('this is a paragraph ', 'tail')).toStrictEqual({ count: 1, start: 19, end: 20 })
    expect(getWhiteSpace('this is a paragraph  ', 'tail')).toStrictEqual({ count: 2, start: 19, end: 21 })
  })
})
