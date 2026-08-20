import { describe, expect, it } from 'vitest'
import {
  buildChildren,
  calculateDepth,
  createContainer,
  CUSTOM_CONTAINER_TYPES,
  findDirectChildren,
  findNestedContainers,
  getContainerTags,
  getCustomContainerPaddingIssues,
  getMarkdownLines,
  getNextLineStart,
  isCustomContainerType,
  parseCustomContainers,
  parseOpenTag,
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
      value: 'info Optional title',
      type: 'info',
      tagStart: 10,
      startPosition: 14,
    })).toStrictEqual({
      value: 'Optional title',
      start: 19,
      end: 33,
    })
    expect(parseTitle('::: info', {
      value: 'info',
      type: 'info',
      tagStart: 0,
      startPosition: 4,
    })).toBeNull()
  })

  it('parses an opening tag with type and title ranges', () => {
    expect(parseOpenTag('::: info Optional title', {
      value: 'info Optional title',
      marker: ':::',
      startPosition: 0,
      type: 'info',
    })).toStrictEqual({
      raw: '::: info Optional title',
      position: { start: 0, end: 23 },
      type: { value: 'info', start: 4, end: 8 },
      title: { value: 'Optional title', start: 9, end: 23 },
    })
  })

  it('creates pending container state from an opening tag', () => {
    const openingTag = parseOpenTag('::: danger', { value: 'danger', marker: ':::', startPosition: 0, type: 'danger' })

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
  it('finds nested and direct child containers and calculates depth', () => {
    const nodes = parseCustomContainers('::: info\na\n::: tip\nb\n:::\n:::')
    expect(findNestedContainers(nodes[0], nodes)).toHaveLength(1)
    expect(findDirectChildren(nodes[0], nodes)).toHaveLength(1)
    expect(calculateDepth(nodes[0], nodes)).toBe(1)
    expect(calculateDepth(nodes[1], nodes)).toBe(2)
  })

  it('builds merged blank-line children', () => {
    const nodes = parseCustomContainers('::: info\n::: tip\nx\n:::\n:::')
    expect(buildChildren('::: info\n\n\n::: tip\nx\n:::', nodes[0], [nodes[1]])[0]).toMatchObject({
      type: 'blank-line',
      value: '\n',
      length: 1,
    })
  })

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
      type: 'custom-container',
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
    expect(containers.map(container => container.tag.open.type.value)).toStrictEqual(['info', 'tip'])
    expect(containers.map(container => container.content)).toStrictEqual(['one', 'two'])
  })

  it('parses nested containers and matches closing markers by level', async () => {
    const markdown = '::: info Outer\nouter before\n::: tip Inner\ninner content\n:::\nouter after\n:::'
    const containers = parseCustomContainers(markdown)

    expect(containers).toHaveLength(2)
    await expect(JSON.stringify(containers[0], null, 2)).toMatchFileSnapshot('__snapshots__/custom-container/nested-outer.json')
    await expect(JSON.stringify(containers[1], null, 2)).toMatchFileSnapshot('__snapshots__/custom-container/nested-inner.json')
  })

  it('retains an unclosed container with a null closing tag', () => {
    const [container] = parseCustomContainers('::: danger\ncontent')
    expect(container).toMatchObject({ type: 'custom-container', content: 'content', tag: { close: null } })
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

describe('custom container padding', () => {
  it('returns no issues for normalized sibling and nested containers', () => {
    const markdown = `# Custom Containers

::: info
This is an info box.

::: tip
This is a tip box.
:::

This is an info box.
:::

Other content.`

    expect(getCustomContainerPaddingIssues(markdown)).toStrictEqual([])
  })

  it('normalizes external and internal boundary padding', () => {
    const markdown = '# Title\n::: info\n\ncontent\n\n:::\n\n\nother'
    const issues = getCustomContainerPaddingIssues(markdown)

    expect(issues.map(issue => issue.kind)).toStrictEqual([
      'missing',
      'unexpected',
      'unexpected',
      'missing',
    ])
    expect(applyPaddingIssues(markdown, issues)).toBe('# Title\n\n::: info\ncontent\n:::\n\nother')
  })

  it('keeps adjacent nested boundary markers tight', () => {
    const markdown = ':::: info\n\n::: tip\ncontent\n:::\n\n::::'

    expect(applyPaddingIssues(markdown, getCustomContainerPaddingIssues(markdown)))
      .toBe(':::: info\n::: tip\ncontent\n:::\n::::')
  })

  it('preserves CRLF line endings in fixes', () => {
    const markdown = 'before\r\n::: info\r\n\r\ncontent\r\n:::\r\nafter'

    expect(applyPaddingIssues(markdown, getCustomContainerPaddingIssues(markdown)))
      .toBe('before\r\n\r\n::: info\r\ncontent\r\n:::\r\n\r\nafter')
  })

  it('does not require padding at document boundaries', () => {
    expect(getCustomContainerPaddingIssues('::: info\ncontent\n:::')).toStrictEqual([])
  })

  it('ignores container markers inside excluded source ranges', () => {
    const markdown = '```md\n::: info\n\ncontent\n\n:::\n```'

    expect(parseCustomContainers(markdown, [{ start: 0, end: markdown.length }])).toStrictEqual([])
    expect(getCustomContainerPaddingIssues(markdown, [{ start: 0, end: markdown.length }])).toStrictEqual([])
  })

  it('indexes lines and container tags with source ranges', () => {
    const markdown = '::: info\ncontent\n:::'

    expect(getMarkdownLines(markdown)).toStrictEqual([
      { start: 0, end: 8, blank: false },
      { start: 9, end: 16, blank: false },
      { start: 17, end: 20, blank: false },
    ])
    expect([...getContainerTags(markdown)]).toStrictEqual([
      [0, { kind: 'open', range: { start: 0, end: 8 } }],
      [17, { kind: 'close', range: { start: 17, end: 20 } }],
    ])
  })
})

function applyPaddingIssues(markdown: string, issues: ReturnType<typeof getCustomContainerPaddingIssues>): string {
  return issues
    .toReversed()
    .reduce((result, issue) => `${result.slice(0, issue.range.start)}${issue.replacement}${result.slice(issue.range.end)}`, markdown)
}
