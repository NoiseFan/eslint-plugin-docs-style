import { describe, expect, it } from 'vitest'
import { parseFixtureRuleOverride } from './fixture-rule-overrides'

describe('parseFixtureRuleOverride', () => {
  it('parses a rule and its options from frontmatter', () => {
    const input = [
      '---',
      'rule: "demo-rule-name"',
      'options: [\'param1\']',
      '---',
      '',
      '::: info',
      'content',
      ':::',
    ].join('\n')

    expect(parseFixtureRuleOverride(input)).toEqual({
      rule: 'demo-rule-name',
      options: ['param1'],
    })
  })

  it('parses multiple options and double-quoted rule names', () => {
    const input = [
      '---',
      'rule: "example-rule"',
      'options: ["param1", "param2"]',
      '---',
    ].join('\n')

    expect(parseFixtureRuleOverride(input)).toEqual({
      rule: 'example-rule',
      options: ['param1', 'param2'],
    })
  })

  it('preserves YAML option types and values containing commas', () => {
    const input = [
      '---',
      'rule: demo-rule',
      'options: ["a,b", 2, true, null]',
      '---',
    ].join('\n')

    expect(parseFixtureRuleOverride(input)).toEqual({
      rule: 'demo-rule',
      options: ['a,b', 2, true, null],
    })
  })

  it('uses the fixture parent directory as the default rule', () => {
    const input = [
      '---',
      'options: ["param1"]',
      '---',
      '',
      '::: info',
      'content',
      ':::',
    ].join('\n')

    expect(parseFixtureRuleOverride(input, 'demo-rule-name')).toStrictEqual({
      rule: 'demo-rule-name',
      options: ['param1'],
    })
  })

  it('ignores documents without a valid rule declaration', () => {
    expect(parseFixtureRuleOverride('# No frontmatter')).toBeUndefined()

    const input = [
      '---',
      'title: Example',
      '---',
      'content',
    ].join('\n')
    expect(parseFixtureRuleOverride(input)).toBeUndefined()
  })
})
