import type { Text } from 'mdast'
import { describe, expect, it } from 'vitest'
import { buildTextNodeAst, getTextType, tokenizeText } from '@/parser/text'

describe('getTextType', () => {
  it('classifies core character groups', () => {
    expect(getTextType('中')).toBe('cjk')
    expect(getTextType('あ')).toBe('cjk')
    expect(getTextType('A')).toBe('latin')
    expect(getTextType('4')).toBe('number')
    expect(getTextType(' ')).toBe('space')
    expect(getTextType('\n')).toBe('newline')
    expect(getTextType('，')).toBe('fullwidth-punctuation')
    expect(getTextType(',')).toBe('halfwidth-punctuation')
    expect(getTextType('—')).toBe('dash')
    expect(getTextType('+')).toBe('symbol')
    expect(getTextType('🙂')).toBe('emoji')
    expect(getTextType('Ж')).toBe('other')
    expect(getTextType('\u200B')).toBe('invisible')
  })
})

describe('tokenizeText', () => {
  it('groups same-type chars', async () => {
    await expect(JSON.stringify(tokenizeText('中文 Vitest 4.1，OK'), null, 2)).toMatchFileSnapshot('__snapshots__/groups-same-type-chars.json')
  })

  it('keeps decimal and percent suffixes in the same number token', async () => {
    await expect(JSON.stringify(tokenizeText('中文 4.0% 增长'), null, 2)).toMatchFileSnapshot('__snapshots__/groups-number-fragments.json')
  })

  it('keeps code unit offsets', async () => {
    await expect(JSON.stringify(tokenizeText('a🙂中'), null, 2)).toMatchFileSnapshot('__snapshots__/keeps-code-unit-offsets.json')
  })

  it('tracks positions across lines', async () => {
    await expect(JSON.stringify(tokenizeText('A\n中'), null, 2)).toMatchFileSnapshot('__snapshots__/tracks-positions-across-lines.json')
  })
})

describe('buildTextNodeAst', () => {
  it('uses mdast offsets for token ranges', async () => {
    const node = {
      type: 'text',
      value: '中 A',
      position: {
        start: { line: 1, column: 6, offset: 5 },
        end: { line: 1, column: 9, offset: 8 },
      },
    } as Text

    await expect(JSON.stringify(buildTextNodeAst(node), null, 2)).toMatchFileSnapshot('__snapshots__/uses-mdast-offsets.json')
  })
})
