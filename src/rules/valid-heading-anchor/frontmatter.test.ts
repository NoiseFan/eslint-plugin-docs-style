import type { RootContent } from 'mdast'
import { describe, expect, it } from 'vitest'
import { hasFrontmatter } from '@/rules/valid-heading-anchor/frontmatter'

describe('hasFrontmatter', () => {
  it('returns true for yaml frontmatter at the document start', () => {
    const inputs = [
      `---\ntitle: Why Vitest | Guide\n---\n\n# Why Vitest`,
    ]

    for (const input of inputs) {
      expect(hasFrontmatter(input)).toBeTruthy()
    }
  })

  it('returns false when yaml-like content is not frontmatter', () => {
    const inputs = [
      '# Why Vitest\n\nSome content.',
      '---\n\n# Why Vitest',
      '# Why Vitest\n\n---\ntitle: Not frontmatter\n---',
      'title: Why Vitest\n---\n\n# Why Vitest',
      '# Introduction',
    ]

    for (const input of inputs) {
      expect(hasFrontmatter(input), input).toBeFalsy()
    }
  })

  it('returns true when a truncated frontmatter body follows a thematic break', () => {
    const input = 'title: 测试运行生命周期 | 指南\noutline: deep\n---'
    const prevNode = { type: 'thematicBreak' } as RootContent

    expect(hasFrontmatter(input, prevNode)).toBeTruthy()
  })
})
