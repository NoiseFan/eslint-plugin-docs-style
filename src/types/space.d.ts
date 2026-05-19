import type { AdjacentTextContext } from './inline-element'

/**
 * The spacing context around a link.
 */
export interface SpaceContext {
  /**
   * The previous adjacent text context.
   */
  prev?: AdjacentTextContext
  /**
   * The next adjacent text context.
   */
  next?: AdjacentTextContext
}

export interface WhiteSpaceReturn {
  count: number
  start: number
  end: number
}
