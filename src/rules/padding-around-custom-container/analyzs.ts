import type { Nodes, Root } from 'mdast'
import type { ValueOf } from '@/types'
import type { ChildrenNode, CustomContainerAST, CustomContainerBlockNode, OffsetRange } from '@/types/custom-container'
import { hasChildren, isCodeNode, isObject } from '@/parser/ast'
import { isBlankNode, isCloseNode, isCustomContainerNode, isOpenNode } from '@/parser/custom-container'

export const MESSAGE_IDS = {
  missing: 'missing',
  unexpected: 'unexpected',
} as const

type MessageIds = ValueOf<typeof MESSAGE_IDS>

export interface Issue extends OffsetRange {
  replacement: string
  messageId: MessageIds
}

type Issues = Array<Issue>

interface ContainerBoundary {
  openIndex: number
  closeIndex: number
}

interface RangeOffset { start: number, end: number }

/**
 * Ignore `Custom-containerNode` in `CodeNode` & `InlineCodeNode`.
 * Collects source offsets for fenced code blocks and inline code nodes.
 */
export function getCodeNodeRanges(node: Root): Array<RangeOffset> {
  const ranges: Array<RangeOffset> = []
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

/**
 * Analyzes custom containers and returns de-duplicated padding issues.
 */
export function getNodesIssues(nodes: CustomContainerBlockNode[], offset: number): Issues {
  const issues: Issues = []
  analyzeLevel(nodes, offset, issues)
  return dedupeIssues(issues)
}

/**
 * Recursively analyzes every custom-container level in a parsed document.
 */
export function analyzeLevel(nodes: ChildrenNode[], offset: number, issues: Issues): void {
  for (let index = 0; index < nodes.length; index++) {
    const container = nodes[index]
    if (!isCustomContainerNode(container))
      continue

    const boundary = getContainerBoundary(container)
    if (!boundary)
      continue

    analyzeInnerBoundary(container.children, boundary, offset, issues)
    analyzeOuterBoundary(nodes, index, offset, issues)
    analyzeLevel(container.children, offset, issues)
  }
}

/**
 * Checks the blank lines immediately inside a container's opening and closing tags.
 */
export function analyzeInnerBoundary(
  children: ChildrenNode[],
  { openIndex, closeIndex }: ContainerBoundary,
  offset: number,
  issues: Issues,
): void {
  const first = children[openIndex + 1]
  if (isBlankNode(first))
    addInnerIssues(first, offset, issues)

  const last = children[closeIndex - 1]
  if (isBlankNode(last) && last !== first)
    addInnerIssues(last, offset, issues)
}

/**
 * Finds the first opening tag and last closing tag for a custom container.
 */
export function getContainerBoundary(container: CustomContainerAST): ContainerBoundary | undefined {
  const openIndex = container.children.findIndex(isOpenNode)
  const closeIndex = container.children.findLastIndex(isCloseNode)
  if (openIndex === -1 || closeIndex <= openIndex)
    return
  return { openIndex, closeIndex }
}

/**
 *  Adds an edit that normalizes an inner blank line to one line break.
 */
export function addInnerIssues(
  blank: Extract<ChildrenNode, { type: 'blank' }>,
  offset: number,
  issues: Issues,
): void {
  const replacement = getLineBreak(blank.value)
  if (blank.value === replacement)
    return

  issues.push({
    start: offset + blank.position.start,
    end: offset + blank.position.end,
    replacement,
    messageId: MESSAGE_IDS.unexpected,
  })
}

/**
 *  Checks both sides of a container for the required external blank line.
 */
export function analyzeOuterBoundary(
  children: ChildrenNode[],
  boundaryIndex: number,
  offset: number,
  issues: Issues,
): void {
  checkOuterSide(children, boundaryIndex, -1, offset, issues)
  checkOuterSide(children, boundaryIndex, 1, offset, issues)
}

/**
 * Checks one side of a container and records insertion or normalization issues.
 */
export function checkOuterSide(
  children: ChildrenNode[],
  boundaryIndex: number,
  direction: -1 | 1,
  offset: number,
  issues: Issues,
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
    issues.push({
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

  issues.push({
    start: offset + blank.position.start,
    end: offset + blank.position.end,
    replacement: expected,
    messageId: blank.value.length < expected.length ? MESSAGE_IDS.missing : MESSAGE_IDS.unexpected,
  })
}

/**
 * Returns whether a node is content outside the container's own boundary tags.
 */
export function isExternalContent(
  node: ChildrenNode | undefined,
  index: number,
  length: number,
): boolean {
  if (!node || isBlankNode(node))
    return false
  if (index === 0 && isOpenNode(node))
    return false
  if (index === length - 1 && isCloseNode(node))
    return false
  return true
}

/**
 * Removes issues that target the same range with the same replacement.
 */
export function dedupeIssues(issues: Issues): Issues {
  const seen = new Set<string>()
  return issues.filter((edit) => {
    const key = `${edit.start}:${edit.end}:${edit.replacement}`
    if (seen.has(key))
      return false
    seen.add(key)
    return true
  })
}

/**
 * Returns the line-break sequence used by a string.
 */
export function getLineBreak(value: string): string {
  return value.includes('\r\n') ? '\r\n' : '\n'
}

/**
 * Uses the first blank child to infer a container's line-break sequence.
 */
export function getLineBreakFromChildren(children: ChildrenNode[]): string {
  const blank = children.find(child => isBlankNode(child))
  return isBlankNode(blank) ? getLineBreak(blank.value) : '\n'
}
