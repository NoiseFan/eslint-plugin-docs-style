import { describe, expect, it } from 'vitest'
import { getLikeAnchor, hasAnchor, normalizeAnchor } from './anchor'

describe('hasAnchor', () => {
  it('should return true for lowercase anchors', () => {
    const data = [
      '中文标题 {#chinese-title}',
      '简介 {#intro}',
      '标题 {#section-2}',
      '标题 {#a1-b2-c3}',
    ]

    for (const ele of data)
      expect(hasAnchor(ele)).toBeTruthy()
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
      expect(hasAnchor(ele)).toBeFalsy()
  })
})

describe('getLikeAnchor', () => {
  it('should extract the trailing like-anchor content', () => {
    expect(getLikeAnchor('你的第一个测试 #Your First Test')).toBe('Your First Test')
    expect(getLikeAnchor('你的第一个测试 # Your First Test')).toBe('Your First Test')
    expect(getLikeAnchor('使用 `describe` 编组测试 #  Grouping Tests with `describe`')).toBe('Grouping Tests with `describe`')
    expect(getLikeAnchor('兼容 #built-in slug')).toBe('built-in slug')
    expect(getLikeAnchor('兼容 #built_in slug')).toBe('built_in slug')
    expect(getLikeAnchor('兼容 {#built_in slug}')).toBe('built_in slug')
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
