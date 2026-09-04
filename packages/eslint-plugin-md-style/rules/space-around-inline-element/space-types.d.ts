import type { AdjacentTextContext } from './types'

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
