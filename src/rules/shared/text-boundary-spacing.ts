import type { Text } from 'mdast'
import type { TokenContext } from '@/parser/ast'
import type { BoundarySpaceResult } from '@/types/text/boundary-space'
import { getNodeContextByParent } from '@/parser/ast'
import { buildTextNodeAst, TEXT_TYPE } from '@/parser/text'

export type BoundarySpaceMessageId
  = 'missingSpaceBefore'
    | 'missingSpaceAfter'
    | 'missingSpacesAround'
    | 'unexpectedSpaceBefore'
    | 'unexpectedSpaceAfter'
    | 'unexpectedSpaceAround'

/**
 * Normalizes an existing space token around the target token type.
 * When multiple spaces are collapsed, the redundant side is recorded so the
 * caller can choose the most specific lint message.
 */
function processSpaceToken(
  ctx: TokenContext,
  result: BoundarySpaceResult,
  isTargetType: (type: string | undefined) => boolean,
): void {
  const { prev, current, next } = ctx
  /* v8 ignore if -- @preserve */
  if (!current)
    return

  const cjkToTarget = prev?.type === TEXT_TYPE.cjk && isTargetType(next?.type)
  const targetToCjk = isTargetType(prev?.type) && next?.type === TEXT_TYPE.cjk
  const targets = isTargetType(prev?.type) && isTargetType(next?.type)
  const hasUnexpectedSpaces = current.value.length !== 1

  if (hasUnexpectedSpaces) {
    if (cjkToTarget || targets)
      result.unexpectedBefore = true

    if (targetToCjk || targets)
      result.unexpectedAfter = true
  }

  if (cjkToTarget || targetToCjk || hasUnexpectedSpaces)
    result.fixed += ' '
  else
    result.fixed += current.value
}

/**
 * Inserts missing spaces before or after the target token when it directly
 * touches adjacent CJK text.
 */
function processTargetToken(
  ctx: TokenContext,
  result: BoundarySpaceResult,
): void {
  const { prev, current, next } = ctx
  /* v8 ignore if -- @preserve */
  if (!current)
    return

  if (prev?.type === TEXT_TYPE.cjk) {
    result.fixed += ' '
    result.missingBefore = true
  }

  result.fixed += current.value

  if (next?.type === TEXT_TYPE.cjk) {
    result.fixed += ' '
    result.missingAfter = true
  }
}

/**
 * Chooses the most specific shared boundary-space message id from the
 * collected missing or redundant space flags.
 */
export function getBoundarySpaceMessageId(boundary: {
  missingBefore: boolean
  missingAfter: boolean
  unexpectedBefore: boolean
  unexpectedAfter: boolean
}): BoundarySpaceMessageId {
  if (boundary.missingBefore && boundary.missingAfter)
    return 'missingSpacesAround'

  if (boundary.unexpectedBefore && boundary.unexpectedAfter)
    return 'unexpectedSpaceAround'

  if (boundary.missingBefore)
    return 'missingSpaceBefore'

  if (boundary.missingAfter)
    return 'missingSpaceAfter'

  if (boundary.unexpectedBefore)
    return 'unexpectedSpaceBefore'

  return 'unexpectedSpaceAfter'
}

/**
 * Rebuilds a text node with normalized spacing between CJK text and a target
 * token class such as Latin words or numbers.
 */
export function fixBoundarySpace(
  node: Text,
  isTargetType: (type: string | undefined) => boolean,
): BoundarySpaceResult {
  const { children } = buildTextNodeAst(node)
  const result: BoundarySpaceResult = {
    fixed: '',
    missingBefore: false,
    missingAfter: false,
    unexpectedBefore: false,
    unexpectedAfter: false,
  }

  for (let i = 0; i < children.length; i += 1) {
    const ctx = getNodeContextByParent(children, i)
    /* v8 ignore if -- @preserve */
    if (!ctx.current)
      continue

    if (ctx.current.type === TEXT_TYPE.space)
      processSpaceToken(ctx, result, isTargetType)
    else if (isTargetType(ctx.current.type))
      processTargetToken(ctx, result)
    else
      result.fixed += ctx.current.value
  }

  return result
}
