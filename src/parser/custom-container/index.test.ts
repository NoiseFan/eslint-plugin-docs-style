import { describe, expect, it } from 'vitest'
import { CUSTOM_CONTAINER_TYPES, isCustomContainerMarker, isCustomContainerType } from '.'

describe('isCustomContainerType', () => {
  it.each(CUSTOM_CONTAINER_TYPES)('accepts %s', (type) => {
    expect(isCustomContainerType(type)).toBeTruthy()
  })

  it.each(['note', 'INFO', '', 'warning!'])('rejects %s', (type) => {
    expect(isCustomContainerType(type)).toBeFalsy()
  })
})

describe('isCustomContainerMarker', () => {
  it('should return true for custom container markers on the next line', () => {
    const inputs = ['::: info', '::: tip', ':::: warning']
    for (const input of inputs)
      expect(isCustomContainerMarker(input)).toBeTruthy()
  })

  it('should return false for inline punctuation and non-marker values', () => {
    const inputs = [undefined, '', ':::', ' ::: ', '\n::', '\n: text', '\n::: text', 'text\n:::']
    for (const input of inputs)
      expect(isCustomContainerMarker(input)).toBeFalsy()
  })
})
