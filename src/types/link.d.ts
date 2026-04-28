export interface LinkSpaceContext {
  afterChar?: string
  afterIndex: number
  afterSpaceEnd: number
  afterSpaceStart: number
  beforeChar?: string
  beforeIndex: number
  beforeSpaceEnd: number
  beforeSpaceStart: number
  hasSpaceAfter: boolean
  hasSpaceBefore: boolean
}

export type LinkSpaceIssue
  = | 'missingSpaceBeforeLink'
    | 'missingSpaceAfterLink'
    | 'multipleSpacesBeforeLink'
    | 'multipleSpacesAfterLink'
    | 'unexpectedSpaceBeforeLink'
    | 'unexpectedSpaceAfterLink'
