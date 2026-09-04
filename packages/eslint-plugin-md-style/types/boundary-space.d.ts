/**
 * Aggregated result for rebuilding a text node and reporting which CJK-target
 * boundaries were missing or contained redundant spaces.
 */
export interface BoundarySpaceResult {
  fixed: string
  missingBefore: boolean
  missingAfter: boolean
  unexpectedBefore: boolean
  unexpectedAfter: boolean
}
