import type { Event } from 'micromark-util-types'
import { customContainer } from '@/'
import { parse, postprocess, preprocess } from 'micromark'
import { describe, expect, it } from 'vitest'

function tokenEvents(source: string): Event[] {
  const parser = parse({ extensions: [customContainer()] })
  return postprocess(parser.document().write(preprocess()(source, undefined, true)))
}

describe('customContainer', () => {
  it('emits namespaced syntax tokens and subtokenizes body flow', () => {
    const events = tokenEvents('::: warning Label {open}\n\n# Body\n\n:::')
    const types = events.map(event => `${event[0]}:${event[1].type}`)

    expect(types).toContain('enter:customContainer')
    expect(types).toContain('enter:customContainerFence')
    expect(types).toContain('enter:customContainerFenceSequence')
    expect(types).toContain('enter:customContainerType')
    expect(types).toContain('enter:customContainerLabel')
    expect(types).toContain('enter:customContainerAttr')
    expect(types).toContain('enter:atxHeading')
  })

  it('emits two container token pairs for adjacent containers', () => {
    const events = tokenEvents('::: info\na\n:::\n::: tip\nb\n:::')
    expect(events.filter(([kind, token]) => kind === 'enter' && token.type === 'customContainer')).toHaveLength(2)
  })
})
