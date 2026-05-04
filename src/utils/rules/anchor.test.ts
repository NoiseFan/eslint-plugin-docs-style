import { describe, expect, it } from 'vitest'
import { calcAnchorPositionCompensate, getLikeAnchor, isStrictAnchor, normalizeAnchor } from './anchor'

describe('isStrictAnchor', () => {
  it('should return true for lowercase anchors', () => {
    const data = [
      '中文标题 {#chinese-title}',
      '简介 {#intro}',
      '标题 {#section-2}',
      '标题 {#a1-b2-c3}',
    ]

    for (const ele of data)
      expect(isStrictAnchor(ele)).toBeTruthy()
  })

  it('should return false for missing or malformed anchors', () => {
    const data = [
      '中文标题',
      '中文标题{#chinese-title}',
      '中文标题 {#Chinese-Title}',
      '中文标题 {#chinese_title}',
      '中文标题 {#chinese--title}',
      '中文标题 {#-chinese-title}',
      '中文标题 {#chinese-title-}',
      '中文标题 {#中文标题}',
      '中文标题 { #chinese-title }',
    ]

    for (const ele of data)
      expect(isStrictAnchor(ele)).toBeFalsy()
  })
})

describe('getLikeAnchor', () => {
  it('should extract the trailing like-anchor content', () => {
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
})

describe('normalizeAnchor', () => {
  it('should convert uppercase letters to lowercase', () => {
    expect(normalizeAnchor('3.2!')).toBe('3-2')
    expect(normalizeAnchor('Chinese-Title')).toBe('chinese-title')
    expect(normalizeAnchor('API-Reference')).toBe('api-reference')
  })

  it('should remove unsupported characters', () => {
    expect(normalizeAnchor('Foo_Bar `123`')).toBe('foo_bar-123')
    expect(normalizeAnchor('Hello World!')).toBe('hello-world')
    expect(normalizeAnchor('中文-title')).toBe('title')
  })

  it('should preserve digits and hyphens', () => {
    expect(normalizeAnchor('intro-2')).toBe('intro-2')
    expect(normalizeAnchor('API-Reference_v2')).toBe('api-reference_v2')
    expect(normalizeAnchor('a1-b2-c3')).toBe('a1-b2-c3')
  })
})

describe('calcAnchorPositionCompensate', () => {
  it('should count the wrapper characters of a trailing strict anchor', () => {
    expect(calcAnchorPositionCompensate('中文标题 {#Chinese-Title}')).toBe(3)
    expect(calcAnchorPositionCompensate('# 中文标题 {#Chinese-Title}')).toBe(3)
  })

  it('should count the wrapper characters of a trailing loose anchor', () => {
    expect(calcAnchorPositionCompensate('## 使用 `describe` 编组测试 #Grouping Tests with `describe`')).toBe(1)
    expect(calcAnchorPositionCompensate('使用 `describe` 编组测试 #  Grouping Tests with `describe`')).toBe(3)
  })

  it('should return 0 when there is no trailing like-anchor', () => {
    expect(calcAnchorPositionCompensate('中文标题')).toBe(0)
  })
})
