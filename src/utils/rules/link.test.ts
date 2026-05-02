import type { SpaceContext } from '../../types/link'
import { describe, expect, it } from 'vitest'
import { getParsedLinkContext } from '../markdown'
import { getSpaceContext, getWhiteSpace, isCustomContainerMarker, isDashPunctuation, isFullwidthPunctuation, isHalfwidthPunctuation, isPunctuation } from './link'

describe('isFullwidthPunctuation', () => {
  it('should return true for fullwidth punctuation', () => {
    const inputs = '（）【】「」《》“”，。！？，：；、'
    for (const input of Array.from(inputs)) {
      expect(isFullwidthPunctuation(input), input).toBeTruthy()
    }
  })

  it('should return false for halfwidth punctuation', () => {
    const inputs = '()[]{}<>"",.!?:;'
    for (const input of Array.from(inputs)) {
      expect(isFullwidthPunctuation(input), input).toBeFalsy()
    }
  })
})

describe('isHalfwidthPunctuation', () => {
  it('should return true for halfwidth punctuation', () => {
    const inputs = '!"#%&\'()*,-./:;?@[]_{}'
    for (const input of Array.from(inputs)) {
      expect(isHalfwidthPunctuation(input), input).toBeTruthy()
    }
  })

  it('should return false for fullwidth punctuation', () => {
    const inputs = '（）【】「」《》“”，。！？，：；、'
    for (const input of Array.from(inputs)) {
      expect(isHalfwidthPunctuation(input), input).toBeFalsy()
    }
  })

  it('should return false for non-punctuation values', () => {
    const inputs = ['a', '1', ' ', '', 'ab', '+', '$', '￥', '×', '<', '>']
    for (const input of inputs) {
      expect(isHalfwidthPunctuation(input), input).toBeFalsy()
    }
  })
})

describe('isPunctuation', () => {
  it('should return true for halfwidth punctuation', () => {
    const inputs = '!"#%&\'()*,-./:;?@[]_{}'
    for (const input of Array.from(inputs)) {
      expect(isPunctuation(input), input).toBeTruthy()
    }
  })

  it('should return true for fullwidth punctuation', () => {
    const inputs = '（）【】「」《》“”，。！？，：；、'
    for (const input of Array.from(inputs)) {
      expect(isPunctuation(input), input).toBeTruthy()
    }
  })

  it('should return false for non-punctuation values', () => {
    const inputs = ['a', '1', ' ', '', 'ab', '+', '$', '￥', '×', '<', '>']
    for (const input of inputs) {
      expect(isPunctuation(input), input).toBeFalsy()
    }
  })
})

describe('isDashPunctuation', () => {
  it('should return true for dash-like punctuation', () => {
    const inputs = ['-', '–', '—', '−']
    for (const input of inputs) {
      expect(isDashPunctuation(input), input).toBeTruthy()
    }
  })

  it('should return false for non-dash punctuation', () => {
    const inputs = [',', '.', '，', '。', '', '--']
    for (const input of inputs) {
      expect(isDashPunctuation(input), input).toBeFalsy()
    }
  })
})

describe('isCustomContainerMarker', () => {
  it('should return true for custom container markers on the next line', () => {
    const inputs = ['\n:::', '\n  :::', ' \n:::  ']
    for (const input of inputs) {
      expect(isCustomContainerMarker(input), `-${input}`).toBeTruthy()
    }
  })

  it('should return false for inline punctuation and non-marker values', () => {
    const inputs = [undefined, '', ':::', ' ::: ', '\n::', '\n: text', '\n::: text', 'text\n:::']
    for (const input of inputs) {
      expect(isCustomContainerMarker(input), input ?? 'undefined').toBeFalsy()
    }
  })
})

describe('getSpaceCount', () => {
  it('counts leading whitespace', () => {
    expect(getWhiteSpace(' this is a paragraph')).toStrictEqual({ count: 1, start: 0, end: 1 })
    expect(getWhiteSpace('  this is a paragraph ', 'head')).toStrictEqual({ count: 2, start: 0, end: 2 })
  })

  it('counts trailing whitespace', () => {
    expect(getWhiteSpace('this is a paragraph ', 'tail')).toStrictEqual({ count: 1, start: 19, end: 20 })
    expect(getWhiteSpace('this is a paragraph  ', 'tail')).toStrictEqual({ count: 2, start: 19, end: 21 })
  })
})

describe('getSpaceContext', () => {
  function assertSpaceContext(input: string, output: SpaceContext) {
    expect(getSpaceContext(getParsedLinkContext(input))).toStrictEqual(output)
  }

  it('returns text metadata when text exists on both sides', () => {
    assertSpaceContext('See [guide](/guide/) today.', {
      prev: { value: 'See ', whiteSpace: { count: 1, start: 3, end: 4 }, hasPunctuation: false, punctuationType: 'half' },
      next: { value: ' today.', whiteSpace: { count: 1, start: 0, end: 1 }, hasPunctuation: false, punctuationType: 'half' },
    })
  })

  it('returns empty metadata when there are no adjacent text nodes', () => {
    assertSpaceContext('[guide](/guide/)', {
      prev: { value: undefined, whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: false, punctuationType: 'half' },
      next: { value: undefined, whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: false, punctuationType: 'half' },
    })
  })

  it('detects trailing punctuation on the previous text node', () => {
    assertSpaceContext('等等。  [guide](/guide/) now.', {
      prev: { value: '等等。  ', whiteSpace: { count: 2, start: 3, end: 5 }, hasPunctuation: true, punctuationType: 'full' },
      next: { value: ' now.', whiteSpace: { count: 1, start: 0, end: 1 }, hasPunctuation: false, punctuationType: 'half' },
    })
  })

  it('detects leading punctuation on the next text node', () => {
    assertSpaceContext('See[guide](/guide/)  ， now', {
      prev: { value: 'See', whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: false, punctuationType: 'half' },
      next: { value: '  ， now', whiteSpace: { count: 2, start: 0, end: 2 }, hasPunctuation: true, punctuationType: 'full' },
    })
  })

  it('handles a link with only a previous text node', () => {
    assertSpaceContext('Read [guide](/guide/)', {
      prev: { value: 'Read ', whiteSpace: { count: 1, start: 4, end: 5 }, hasPunctuation: false, punctuationType: 'half' },
      next: { value: undefined, whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: false, punctuationType: 'half' },
    })
  })

  it('handles a link with only a next text node', () => {
    assertSpaceContext('[guide](/guide/) now', {
      prev: { value: undefined, whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: false, punctuationType: 'half' },
      next: { value: ' now', whiteSpace: { count: 1, start: 0, end: 1 }, hasPunctuation: false, punctuationType: 'half' },
    })
  })

  it('detects punctuation touching the link on both sides', () => {
    assertSpaceContext('read，[guide](/guide/)。 now', {
      prev: { value: 'read，', whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: true, punctuationType: 'full' },
      next: { value: '。 now', whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: true, punctuationType: 'full' },
    })
  })

  it('detects halfwidth punctuation touching the link', () => {
    assertSpaceContext('read,[guide](/guide/). now', {
      prev: { value: 'read,', whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: true, punctuationType: 'half' },
      next: { value: '. now', whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: true, punctuationType: 'half' },
    })
  })

  it('counts whitespace-only adjacent text nodes', () => {
    assertSpaceContext('read  [guide](/guide/)  now', {
      prev: { value: 'read  ', whiteSpace: { count: 2, start: 4, end: 6 }, hasPunctuation: false, punctuationType: 'half' },
      next: { value: '  now', whiteSpace: { count: 2, start: 0, end: 2 }, hasPunctuation: false, punctuationType: 'half' },
    })
  })
})
