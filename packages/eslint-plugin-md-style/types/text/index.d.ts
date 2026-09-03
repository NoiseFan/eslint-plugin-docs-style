import type { OffsetRange } from '@/types/ast'

/**
 * Whether to inspect the beginning or end of a text value.
 */
export type PositionOptions = 'head' | 'tail'

/**
 * Count and source range of consecutive whitespace at a text boundary.
 */
export interface WhiteSpaceReturn extends OffsetRange {
  count: number
}
