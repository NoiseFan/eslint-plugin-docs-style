import { describe, expect, it } from 'vitest'
import { isFrontmatter, isKeyValueLine } from './heading'

describe('isKeyValueLine', () => {
  it('returns true for frontmatter-style key-value lines', () => {
    expect(isKeyValueLine('title: restoreMocks | 配置')).toBeTruthy()
    expect(isKeyValueLine('outline: deep')).toBeTruthy()
    expect(isKeyValueLine('sidebar-title: Foo')).toBeTruthy()
  })

  it('returns false for non key-value lines', () => {
    expect(isKeyValueLine('# Title')).toBeFalsy()
    expect(isKeyValueLine('plain text')).toBeFalsy()
  })
})

describe('isFrontmatter', () => {
  it('returns true for yaml frontmatter content misparsed as heading', () => {
    // The AST heading node does not include the opening `---` from the frontmatter block.
    const inputs = [
      `navbar: false\n---`,
      `pageClass: custom-page-class\n---`,
      `title: restoreMocks | 配置\noutline: deep\n---`,
    ]

    for (const input of inputs) {
      expect(isFrontmatter(input), input).toBeTruthy()
    }
  })

  it('returns false for actual markdown headings', () => {
    expect(isFrontmatter('# Title')).toBeFalsy()
    expect(isFrontmatter('Title\n---')).toBeFalsy()
  })
})
