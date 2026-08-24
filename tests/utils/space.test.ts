import type { SpaceContext } from '@/types/space'
import { isInlineCodeNode } from '@/utils/ast'
import { getSpaceContext, getWhiteSpace } from '@/utils/space'
import { getParsedLinkContext, getParsedNodeContext } from '../helpers/markdown'

describe('getSpaceCount', () => {
  it('counts leading whitespace', () => {
    expect(getWhiteSpace(' this is a paragraph')).toStrictEqual({ count: 1, start: 0, end: 1 })
    expect(getWhiteSpace('  this is a paragraph ', 'head')).toStrictEqual({ count: 2, start: 0, end: 2 })
  })

  it('counts trailing whitespace', () => {
    expect(getWhiteSpace('this is a paragraph ', 'tail')).toStrictEqual({ count: 1, start: 19, end: 20 })
    expect(getWhiteSpace('this is a paragraph  ', 'tail')).toStrictEqual({ count: 2, start: 19, end: 21 })
  })
})

describe('getSpaceContext', () => {
  // Reuse the same assertion flow for link nodes to keep cases focused on expected metadata.
  function assertSpaceContext(input: string, output: SpaceContext) {
    expect(getSpaceContext(getParsedLinkContext(input))).toStrictEqual(output)
  }

  // Inline code uses a different parser entry point but should produce the same space context shape.
  function assertInlineCodeSpaceContext(input: string, output: SpaceContext) {
    expect(getSpaceContext(getParsedNodeContext(input, isInlineCodeNode))).toStrictEqual(output)
  }

  it('returns text metadata when text exists on both sides', () => {
    assertSpaceContext('See [guide](/guide/) today.', {
      prev: { value: 'See ', whiteSpace: { count: 1, start: 3, end: 4 }, hasPunctuation: false, punctuationType: 'half' },
      next: { value: ' today.', whiteSpace: { count: 1, start: 0, end: 1 }, hasPunctuation: false, punctuationType: 'half' },
    })
  })

  it('returns empty metadata when there are no adjacent text nodes', () => {
    assertSpaceContext('[guide](/guide/)', {
      prev: { value: undefined, whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: false, punctuationType: 'half' },
      next: { value: undefined, whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: false, punctuationType: 'half' },
    })
  })

  it('detects trailing punctuation on the previous text node', () => {
    assertSpaceContext('等等。  [guide](/guide/) now.', {
      prev: { value: '等等。  ', whiteSpace: { count: 2, start: 3, end: 5 }, hasPunctuation: true, punctuationType: 'full' },
      next: { value: ' now.', whiteSpace: { count: 1, start: 0, end: 1 }, hasPunctuation: false, punctuationType: 'half' },
    })
  })

  it('detects leading punctuation on the next text node', () => {
    assertSpaceContext('See[guide](/guide/)  ， now', {
      prev: { value: 'See', whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: false, punctuationType: 'half' },
      next: { value: '  ， now', whiteSpace: { count: 2, start: 0, end: 2 }, hasPunctuation: true, punctuationType: 'full' },
    })
  })

  it('handles a link with only a previous text node', () => {
    assertSpaceContext('Read [guide](/guide/)', {
      prev: { value: 'Read ', whiteSpace: { count: 1, start: 4, end: 5 }, hasPunctuation: false, punctuationType: 'half' },
      next: { value: undefined, whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: false, punctuationType: 'half' },
    })
  })

  it('handles a link with only a next text node', () => {
    assertSpaceContext('[guide](/guide/) now', {
      prev: { value: undefined, whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: false, punctuationType: 'half' },
      next: { value: ' now', whiteSpace: { count: 1, start: 0, end: 1 }, hasPunctuation: false, punctuationType: 'half' },
    })
  })

  it('detects punctuation touching the link on both sides', () => {
    assertSpaceContext('read，[guide](/guide/)。 now', {
      prev: { value: 'read，', whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: true, punctuationType: 'full' },
      next: { value: '。 now', whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: true, punctuationType: 'full' },
    })
  })

  it('detects halfwidth punctuation touching the link', () => {
    assertSpaceContext('read,[guide](/guide/). now', {
      prev: { value: 'read,', whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: true, punctuationType: 'half' },
      next: { value: '. now', whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: true, punctuationType: 'half' },
    })
  })

  it('counts whitespace-only adjacent text nodes', () => {
    assertSpaceContext('read  [guide](/guide/)  now', {
      prev: { value: 'read  ', whiteSpace: { count: 2, start: 4, end: 6 }, hasPunctuation: false, punctuationType: 'half' },
      next: { value: '  now', whiteSpace: { count: 2, start: 0, end: 2 }, hasPunctuation: false, punctuationType: 'half' },
    })
  })

  it('handles the last inline element in a table cell without trailing text', () => {
    assertInlineCodeSpaceContext('| Setting | Value|\n| --- | --- |\n| Working directory | `/path` `/to/your-project-root`|', {
      prev: { value: undefined, whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: false, punctuationType: 'half' },
      next: { value: ' ', whiteSpace: { count: 1, start: 0, end: 1 }, hasPunctuation: false, punctuationType: 'half' },
    })
  })

  it('handles a standalone inline element in a table cell without adjacent text', () => {
    assertInlineCodeSpaceContext('| Setting | Value|\n| --- | --- |\n| Working directory | `/path/to/your-project-root`|', {
      prev: { value: undefined, whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: false, punctuationType: 'half' },
      next: { value: undefined, whiteSpace: { count: 0, start: 0, end: 0 }, hasPunctuation: false, punctuationType: 'half' },
    })
  })
})
