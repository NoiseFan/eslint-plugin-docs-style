import { describe, expect, it } from 'vitest'
import {
  createContainer,
  CUSTOM_CONTAINER_TYPES,
  getNextLineStart,
  isCustomContainerType,
  parseCustomContainers,
  parseOpeningTag,
  parseTitle,
  parseType,
} from '@/utils/custom-container'

describe('custom-container parsers', () => {
  it('parses the container type', () => {
    expect(parseType('warning Optional title')).toBe('warning')
    expect(parseType('details\tTitle')).toBe('details')
  })

  it('parses an optional title and its source range', () => {
    expect(parseTitle('::: info Optional title', {
      params: 'info Optional title',
      type: 'info',
      tagStart: 10,
      typeStart: 14,
    })).toStrictEqual({
      value: 'Optional title',
      start: 19,
      end: 33,
    })
    expect(parseTitle('::: info', {
      params: 'info',
      type: 'info',
      tagStart: 0,
      typeStart: 4,
    })).toBeNull()
  })

  it('parses an opening tag with type and title ranges', () => {
    expect(parseOpeningTag('::: info Optional title', {
      params: 'info Optional title',
      marker: ':::',
      tagStart: 0,
      type: 'info',
    })).toStrictEqual({
      raw: '::: info Optional title',
      position: { start: 0, end: 23 },
      type: { value: 'info', start: 4, end: 8 },
      title: { value: 'Optional title', start: 9, end: 23 },
    })
  })

  it('creates pending container state from an opening tag', () => {
    const openingTag = parseOpeningTag('::: danger', { params: 'danger', marker: ':::', tagStart: 0, type: 'danger' })

    expect(createContainer('::: danger\ncontent', {
      tagStart: 0,
      raw: '::: danger',
      marker: ':::',
      type: 'danger',
      openingTag,
    })).toMatchObject({
      type: 'danger',
      content: '',
      markerLength: 3,
      contentStart: 11,
      tag: { open: openingTag, close: null },
    })
  })

  it('gets the content start after the opening tag line ending', () => {
    expect(getNextLineStart('::: info\r\ncontent', 8)).toBe(10)
    expect(getNextLineStart('::: info\ncontent', 8)).toBe(9)
    expect(getNextLineStart('::: info', 8)).toBe(8)
  })
})

describe('parseCustomContainers', () => {
  it('parses types, content, and tags with relative ranges', async () => {
    const markdown = '::: info Optional title\ncontent\n:::'

    await expect(JSON.stringify(parseCustomContainers(markdown), null, 2))
      .toMatchFileSnapshot('__snapshots__/custom-container/parse.json')
  })

  it('parses a container without a title', async () => {
    const markdown = '::: error \ncontent\n:::'

    await expect(JSON.stringify(parseCustomContainers(markdown), null, 2))
      .toMatchFileSnapshot('__snapshots__/custom-container/normal.json')
  })

  it('supports CRLF line endings and up to three spaces of indentation', () => {
    const markdown = '  ::: warning Title\r\ncontent\r\n  :::\r\n'
    const [container] = parseCustomContainers(markdown)

    expect(container).toMatchObject({
      type: 'warning',
      content: 'content',
      tag: {
        open: { type: { value: 'warning', start: 6, end: 13 } },
        close: { start: 30, end: 35 },
      },
    })
  })

  it('parses multiple sibling containers', () => {
    const markdown = '::: info\none\n:::\n\n::: tip\ntwo\n:::'
    const containers = parseCustomContainers(markdown)

    expect(containers).toHaveLength(2)
    expect(containers.map(container => container.type)).toStrictEqual(['info', 'tip'])
    expect(containers.map(container => container.content)).toStrictEqual(['one', 'two'])
  })

  it('retains an unclosed container with a null closing tag', () => {
    const [container] = parseCustomContainers('::: danger\ncontent')
    expect(container).toMatchObject({ type: 'danger', content: 'content', tag: { close: null } })
  })
})

describe('isCustomContainerType', () => {
  it.each(CUSTOM_CONTAINER_TYPES)('accepts %s', (type) => {
    expect(isCustomContainerType(type)).toBeTruthy()
  })

  it.each(['note', 'INFO', '', 'warning!'])('rejects %s', (type) => {
    expect(isCustomContainerType(type)).toBeFalsy()
  })
})
