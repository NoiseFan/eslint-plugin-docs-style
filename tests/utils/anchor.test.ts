import { getLikeAnchor } from '@/utils/anchor'

describe('getLikeAnchor', () => {
  it('should extract the trailing like-anchor content', () => {
    expect(getLikeAnchor(undefined)).toBeNull()
    expect(getLikeAnchor('你的第一个测试 #Your First Test')).toStrictEqual({ isLikeAnchor: true, rawLikeAnchor: 'Your First Test' })
    expect(getLikeAnchor('你的第一个测试 # Your First Test')).toStrictEqual({ isLikeAnchor: true, rawLikeAnchor: 'Your First Test' })
    expect(getLikeAnchor('使用 `describe` 编组测试 #  Grouping Tests with `describe`')).toStrictEqual({ isLikeAnchor: true, rawLikeAnchor: 'Grouping Tests with `describe`' })
    expect(getLikeAnchor('兼容 #built-in slug')).toStrictEqual({ isLikeAnchor: true, rawLikeAnchor: 'built-in slug' })
    expect(getLikeAnchor('兼容 #built_in slug')).toStrictEqual({ isLikeAnchor: true, rawLikeAnchor: 'built_in slug' })
    expect(getLikeAnchor('兼容 {#built_in slug}')).toStrictEqual({ isLikeAnchor: true, rawLikeAnchor: 'built_in slug' })
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

  it('should return null for undefined input', () => {
    expect(getLikeAnchor(undefined)).toBeNull()
  })
})
