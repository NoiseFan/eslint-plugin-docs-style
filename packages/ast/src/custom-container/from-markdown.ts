import type { CompileContext, Extension } from 'mdast-util-from-markdown'
import type { Token } from 'micromark-util-types'
import type { Point, Position } from 'unist'
import type { CustomContainer, CustomContainerOptions } from './types'

interface ContainerToken extends Token {
  _customContainerClosing?: boolean
  _customContainerIndent?: number
}

/**
 * Create the mdast compiler extension matching `customContainer`.
 */
export function customContainerFromMarkdown(_options: CustomContainerOptions = {}): Extension {
  return {
    enter: { customContainer: enterContainer },
    exit: {
      customContainer: exitContainer,
      customContainerFence: exitFence,
      customContainerType: exitType,
      customContainerLabel: exitLabel,
      customContainerAttr: exitAttr,
    },
  }
}

function enterContainer(this: CompileContext, token: Token): void {
  this.enter({
    type: 'customContainer',
    tag: { open: { type: { value: '' }, markerLength: 0 } },
    children: [],
  }, token)
}

function exitContainer(this: CompileContext, token: ContainerToken): void {
  const node = currentContainer(this)
  this.exit(token)
  node.position = { start: syntaxStart(token), end: publicPoint(token.end) }
}

function exitFence(this: CompileContext, token: ContainerToken): void {
  const node = currentContainer(this)
  const markerLength = this.sliceSerialize(token).match(/:{3,}/)?.[0].length ?? 0
  const position: Position = { start: syntaxStart(token), end: publicPoint(token.end) }

  if (token._customContainerClosing)
    node.tag.close = { markerLength, position }
  else
    Object.assign(node.tag.open, { markerLength, position })
}

function exitType(this: CompileContext, token: Token): void {
  const openTag = currentContainer(this).tag.open
  openTag.type.value = this.sliceSerialize(token)
  openTag.type.position = tokenPosition(token)
}

function exitLabel(this: CompileContext, token: Token): void {
  const raw = this.sliceSerialize(token)
  const value = raw.trimEnd()
  if (!value)
    return

  const openTag = currentContainer(this).tag.open
  openTag.label = {
    value,
    position: {
      start: publicPoint(token.start),
      end: shiftPoint(token.start, value.length),
    },
  }
}

function exitAttr(this: CompileContext, token: Token): void {
  const raw = this.sliceSerialize(token)
  currentContainer(this).tag.open.attr = {
    value: raw.slice(1, -1),
    position: tokenPosition(token),
  }
}

function currentContainer(context: CompileContext): CustomContainer {
  const node = context.stack[context.stack.length - 1]
  if (node.type !== 'customContainer')
    throw new Error('Expected an active custom container')
  return node
}

function tokenPosition(token: Token): Position {
  return { start: publicPoint(token.start), end: publicPoint(token.end) }
}

function syntaxStart(token: ContainerToken): Point {
  const indent = token._customContainerIndent ?? 0
  return {
    line: token.start.line,
    column: token.start.column - indent,
    offset: token.start.offset - indent,
  }
}

function publicPoint(point: Token['start']): Point {
  return { line: point.line, column: point.column, offset: point.offset }
}

function shiftPoint(point: Token['start'], delta: number): Point {
  return { line: point.line, column: point.column + delta, offset: point.offset + delta }
}
