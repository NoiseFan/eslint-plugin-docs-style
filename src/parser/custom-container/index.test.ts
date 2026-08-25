import { describe, expect, it } from 'vitest'
import { CUSTOM_CONTAINER_TYPES, isClosingTag, isCustomContainerMarker, isCustomContainerType, isOpeningTag } from '.'

describe('isCustomContainerType', () => {
  it.each(CUSTOM_CONTAINER_TYPES)('accepts %s', (type) => {
    expect(isCustomContainerType(type)).toBeTruthy()
  })

  it.each(['note', 'INFO', '', 'warning!'])('rejects %s', (type) => {
    expect(isCustomContainerType(type)).toBeFalsy()
  })
})

describe('isOpeningTag', () => {
  it('should return true for opening tags', () => {
    // maybe include :::info ?
    const inputs = ['::: info', '::: info\ncontent', ':::: warning Optional title', ' ::: details {open}', '   ::: code-group', ':::\ttip']
    for (const input of inputs)
      expect(isOpeningTag(input), input).toBeTruthy()
  })

  it('should return false for non-opening tags', () => {
    const inputs = [':::', '    ::: info', 'text ::: info']
    for (const input of inputs)
      expect(isOpeningTag(input), input).toBeFalsy()
  })
})

describe('isClosingTag', () => {
  it('should return true for closing tags', () => {
    const inputs = [':::', '::::', ' :::', '   :::', ':::\t', 'text:::', '::: text', '\n:::', ':::\n']
    for (const input of inputs)
      expect(isClosingTag(input), input).toBeTruthy()
  })

  it('should return false for non-closing tags', () => {
    const inputs = [':', '::']
    for (const input of inputs)
      expect(isClosingTag(input), input).toBeFalsy()
  })
})

describe('isCustomContainerMarker', () => {
  it('should return true for custom container markers on the next line', () => {
    const inputs = ['::: info', '::: tip', ':::: warning']
    for (const input of inputs)
      expect(isCustomContainerMarker(input), input).toBeTruthy()
  })

  it('should return false for inline punctuation and non-marker values', () => {
    const inputs = [undefined, '', ':::', ' ::: ', '\n::', '\n: text', '\n::: text', 'text\n:::']
    for (const input of inputs)
      expect(isCustomContainerMarker(input), input).toBeFalsy()
  })
})
