import type { LINK_SPACE_MESSAGE_IDS } from '../utils/rules/link'

export type LinkSpaceIssue = typeof LINK_SPACE_MESSAGE_IDS[keyof typeof LINK_SPACE_MESSAGE_IDS]

export type PositionOptions = 'head' | 'tail'

export interface AdjacentTextContext {
  value: string | undefined
  whiteSpace: whiteSpaceReturn
  hasPunctuation: boolean
  punctuationType: 'full' | 'half'
}

export interface SpaceContext {
  prev?: AdjacentTextContext
  next?: AdjacentTextContext
}
