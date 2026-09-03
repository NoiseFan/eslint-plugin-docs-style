import { describe, expect, it } from 'vitest'
import { isDashPunctuation, isFullwidthPunctuation, isHalfwidthPunctuation, isPunctuation, isSlashPunctuation } from '@/utils/punctuation'

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
    const inputs = ['a', '1', ' ', '', 'ab', '+', '$', '￥', '×', '<', '>', '—', undefined]
    for (const input of inputs) {
      expect(isHalfwidthPunctuation(input), String(input)).toBeFalsy()
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
    const inputs = [',', '.', '，', '。', '', '--', undefined]
    for (const input of inputs) {
      expect(isDashPunctuation(input), String(input)).toBeFalsy()
    }
  })
})

describe('isSlashPunctuation', () => {
  it('should return true for slash', () => {
    const inputs = ['/']
    for (const input of inputs) {
      expect(isSlashPunctuation(input), input).toBeTruthy()
    }
  })

  it('should return false for non-slash values', () => {
    const inputs = ['(', ')', '-', '.', 'a', '', undefined]
    for (const input of inputs) {
      expect(isSlashPunctuation(input), String(input)).toBeFalsy()
    }
  })
})
