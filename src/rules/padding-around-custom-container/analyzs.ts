import type { Nodes, Root } from 'mdast'
import type { ValueOf } from '@/types'
import type { ChildrenNode, CustomContainerAST, OffsetRange, TagNode } from '@/types/custom-container'
import { hasChildren, isCodeNode, isObject } from '@/parser/ast'
import { isBlankNode, isCloseNode, isCoustomContainer, isOpenNode } from '@/parser/custom-container'

export const MESSAGE_IDS = {
  missing: 'missing',
  unexpected: 'unexpected',
} as const
type MessageIds = ValueOf<typeof MESSAGE_IDS>

export interface Edit extends OffsetRange {
  replacement: string
  messageId: MessageIds
}

interface ContainerRange {
  open: TagNode
  close: TagNode
  outer: {
    start: ChildrenNode
    end: ChildrenNode
  }
  children: ChildrenNode[]
}

export function getCodeRanges(node: Root): Array<{ start: number, end: number }> {
  const ranges: Array<{ start: number, end: number }> = []

  function visit(current: Nodes): void {
    if (!isObject(current))
      return
    if (isCodeNode(current)) {
      const position = current.position
      if (!position)
        return

      const start = position.start?.offset
      const end = position.end?.offset
      if (start && end)
        ranges.push({ start, end })
    }
    if (hasChildren(current)) {
      for (const child of current.children)
        visit(child)
    }
  }

  visit(node)
  return ranges
}

export function collectEdits(ast: CustomContainerAST, offset: number): Edit[] {
  const edits: Edit[] = []
  const rootRanges = getTopLevelContainerRanges(ast.children)

  for (const range of rootRanges)
    analyzeContainer(range, ast.children, offset, edits)

  return edits
}

function analyzeContainer(
  range: ContainerRange,
  parentChildren: ChildrenNode[],
  offset: number,
  edits: Edit[],
): void {
  analyzeInnerBoundary(range, offset, edits)
  analyzeOuterBoundary(range, parentChildren, offset, edits)

  for (const child of range.children) {
    if (!isCoustomContainer(child))
      continue
    const nested = getNestedContainerRange(child)
    if (nested)
      analyzeContainer(nested, range.children, offset, edits)
  }
}

function analyzeInnerBoundary(range: ContainerRange, offset: number, edits: Edit[]): void {
  const openIndex = range.children.findIndex(child => child === range.open)
  const closeIndex = range.children.findIndex(child => child === range.close)
  if (openIndex === -1 || closeIndex === -1 || closeIndex <= openIndex)
    return

  const first = range.children[openIndex + 1]
  if (isBlankNode(first)) {
    const next = range.children[openIndex + 2]
    addInnerEdit(first, isCloseNode(next), offset, edits)
  }

  const last = range.children[closeIndex - 1]
  if (isBlankNode(last) && last !== first)
    addInnerEdit(last, false, offset, edits)
}

function addInnerEdit(blank: Extract<ChildrenNode, { type: 'blank' }>, empty: boolean, offset: number, edits: Edit[]): void {
  const replacement = empty ? '' : getLineBreak(blank.value)
  if (blank.value === replacement)
    return

  edits.push({
    start: offset + blank.position.start,
    end: offset + blank.position.end,
    replacement,
    messageId: MESSAGE_IDS.unexpected,
  })
}

function analyzeOuterBoundary(
  range: ContainerRange,
  parentChildren: ChildrenNode[],
  offset: number,
  edits: Edit[],
): void {
  const startIndex = parentChildren.findIndex(child => child === range.outer.start)
  const endIndex = parentChildren.findIndex(child => child === range.outer.end)
  if (startIndex === -1 || endIndex === -1)
    return

  checkOuterSide(parentChildren, startIndex, -1, offset, edits)
  checkOuterSide(parentChildren, endIndex, 1, offset, edits)
}

function checkOuterSide(
  children: ChildrenNode[],
  boundaryIndex: number,
  direction: -1 | 1,
  offset: number,
  edits: Edit[],
): void {
  const blankIndex = boundaryIndex + direction
  const blank = children[blankIndex]
  const contentIndex = isBlankNode(blank) ? blankIndex + direction : blankIndex
  const content = children[contentIndex]

  if (!isExternalContent(content, contentIndex, children.length))
    return

  if (!isBlankNode(blank)) {
    const insertion = direction === -1
      ? children[boundaryIndex].position.start
      : children[boundaryIndex].position.end
    edits.push({
      start: offset + insertion,
      end: offset + insertion,
      replacement: getLineBreakFromChildren(children),
      messageId: MESSAGE_IDS.missing,
    })
    return
  }

  const lineBreak = getLineBreak(blank.value)
  const expected = `${lineBreak}${lineBreak}`
  if (blank.value === expected)
    return

  edits.push({
    start: offset + blank.position.start,
    end: offset + blank.position.end,
    replacement: expected,
    messageId: blank.value.length < expected.length ? MESSAGE_IDS.missing : MESSAGE_IDS.unexpected,
  })
}

function isExternalContent(node: ChildrenNode | undefined, index: number, length: number): boolean {
  if (!node || isBlankNode(node))
    return false
  if (index === 0 && isOpenNode(node))
    return false
  if (index === length - 1 && isCloseNode(node))
    return false
  return true
}

function getTopLevelContainerRanges(children: ChildrenNode[]): ContainerRange[] {
  const ranges: ContainerRange[] = []
  for (let index = 0; index < children.length; index++) {
    const child = children[index]
    if (isCoustomContainer(child)) {
      const nested = getNestedContainerRange(child)
      if (nested)
        ranges.push(nested)
      continue
    }
    if (!isOpenNode(child))
      continue
    const closeIndex = children.findIndex((candidate, candidateIndex) => candidateIndex > index && candidate.type === 'close')
    if (closeIndex === -1)
      continue
    ranges.push({
      open: child,
      close: children[closeIndex] as TagNode,
      outer: {
        start: child,
        end: children[closeIndex],
      },
      children: children.slice(index, closeIndex + 1),
    })
    index = closeIndex
  }
  return ranges
}

function getNestedContainerRange(container: CustomContainerAST): ContainerRange | undefined {
  const open = container.children.find(child => isOpenNode(child))
  const close = [...container.children].reverse().find(child => isCloseNode(child))
  if (!open || !close)
    return undefined
  return {
    open,
    close,
    outer: { start: container, end: container },
    children: container.children,
  }
}

function getLineBreak(value: string): string {
  return value.includes('\r\n') ? '\r\n' : '\n'
}

function getLineBreakFromChildren(children: ChildrenNode[]): string {
  const blank = children.find(child => isBlankNode(child))
  return isBlankNode(blank) ? getLineBreak(blank.value) : '\n'
}
