import { describe, expect, it } from 'vitest'
import { getLikeAnchor } from './utils'

describe('getLikeAnchor', () => {
  it('should extract the trailing like-anchor content', () => {
    expect(getLikeAnchor('你的第一个测试 #Your First Test')).toBe('Your First Test')
    expect(getLikeAnchor('你的第一个测试 #   Your First Test')).toBe('Your First Test')
    expect(getLikeAnchor('使用 `describe` 编组测试 #Grouping Tests with `describe`')).toBe('Grouping Tests with `describe`')
    expect(getLikeAnchor('兼容 #built-in slug')).toBe('built-in slug')
  })

  it('should return null for non-like-anchor endings', () => {
    const data = [
      '纯中文标题',
      'Your First Test 你的第一个测试',
      '你的第一个测试 Your First Test',
      '中文标题 Hello World!',
      '使用 `describe` 编组测试',
    ]
    for (const ele of data) {
      expect(getLikeAnchor(ele)).toBeNull()
    }
  })
})
