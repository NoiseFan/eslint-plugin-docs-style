import type { Nodes, Root } from 'mdast'
import type { ValueOf } from '@/types'
import type { ChildrenNode, CustomContainerAST, CustomContainerBlockNode, OffsetRange } from '@/types/custom-container'
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

interface ContainerBoundary {
  openIndex: number
  closeIndex: number
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
      if (start !== undefined && end !== undefined)
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

export function collectEdits(nodes: CustomContainerBlockNode[], offset: number): Edit[] {
  const edits: Edit[] = []
  analyzeLevel(nodes, offset, edits)

  return dedupeEdits(edits)
}

function analyzeLevel(nodes: ChildrenNode[], offset: number, edits: Edit[]): void {
  for (let index = 0; index < nodes.length; index++) {
    const container = nodes[index]
    if (!isCoustomContainer(container))
      continue

    const boundary = getContainerBoundary(container)
    if (!boundary)
      continue

    analyzeInnerBoundary(container.children, boundary, offset, edits)
    analyzeOuterBoundary(nodes, index, offset, edits)
    analyzeLevel(container.children, offset, edits)
  }
}

function analyzeInnerBoundary(
  children: ChildrenNode[],
  { openIndex, closeIndex }: ContainerBoundary,
  offset: number,
  edits: Edit[],
): void {
  const first = children[openIndex + 1]
  if (isBlankNode(first))
    addInnerEdit(first, offset, edits)

  const last = children[closeIndex - 1]
  if (isBlankNode(last) && last !== first)
    addInnerEdit(last, offset, edits)
}

function getContainerBoundary(container: CustomContainerAST): ContainerBoundary | undefined {
  const openIndex = container.children.findIndex(isOpenNode)
  const closeIndex = container.children.findLastIndex(isCloseNode)
  if (openIndex === -1 || closeIndex <= openIndex)
    return
  return { openIndex, closeIndex }
}

function addInnerEdit(blank: Extract<ChildrenNode, { type: 'blank' }>, offset: number, edits: Edit[]): void {
  const replacement = getLineBreak(blank.value)
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
  children: ChildrenNode[],
  boundaryIndex: number,
  offset: number,
  edits: Edit[],
): void {
  checkOuterSide(children, boundaryIndex, -1, offset, edits)
  checkOuterSide(children, boundaryIndex, 1, offset, edits)
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

function dedupeEdits(edits: Edit[]): Edit[] {
  const seen = new Set<string>()
  return edits.filter((edit) => {
    const key = `${edit.start}:${edit.end}:${edit.replacement}`
    if (seen.has(key))
      return false
    seen.add(key)
    return true
  })
}

function getLineBreak(value: string): string {
  return value.includes('\r\n') ? '\r\n' : '\n'
}

function getLineBreakFromChildren(children: ChildrenNode[]): string {
  const blank = children.find(child => isBlankNode(child))
  return isBlankNode(blank) ? getLineBreak(blank.value) : '\n'
}
