import type { MessageIds } from '.'
import type { ChildrenNode, CustomContainerAST, CustomContainerBlockNode, OffsetRange } from '@/types/custom-container'
import { isBlankNode, isCloseNode, isCustomContainerNode, isOpenNode } from '@/parser/custom-container'
import { MESSAGE_IDS } from '.'

interface Issue extends OffsetRange {
  replacement: string
  messageId: MessageIds
}

export type Issues = Array<Issue>

interface AnalyzeContext {
  offset: number
  issues: Issues
}

interface ContainerBoundary {
  openIndex: number
  closeIndex: number
}

/**
 * Analyzes custom containers and returns de-duplicated padding issues.
 */
export function getNodesIssues(
  nodes: CustomContainerBlockNode[],
  offset: number,
  ignoreRanges: OffsetRange[] = [],
): Issues {
  const issues: Issues = []
  analyzeLevel(nodes, { offset, issues })
  return dedupeIssues(issues).filter(issue => !ignoreRanges.some(range => issue.start < range.end && issue.end > range.start))
}

/**
 * Recursively analyzes every custom-container level in a parsed document.
 */
export function analyzeLevel(nodes: ChildrenNode[], opts: AnalyzeContext): void {
  for (let index = 0; index < nodes.length; index++) {
    const container = nodes[index]
    if (!isCustomContainerNode(container))
      continue

    const boundary = getContainerBoundary(container)
    if (!boundary)
      continue

    analyzeInnerBoundary(container.children, boundary, opts)
    analyzeOuterBoundary(nodes, index, opts)
    analyzeLevel(container.children, opts)
  }
}

/**
 * Checks the blank lines immediately inside a container's opening and closing tags.
 */
export function analyzeInnerBoundary(
  children: ChildrenNode[],
  containerBoundary: ContainerBoundary,
  opts: AnalyzeContext,
): void {
  const { openIndex, closeIndex } = containerBoundary
  const first = children[openIndex + 1]
  if (isBlankNode(first))
    addInnerIssues(first, opts)

  const last = children[closeIndex - 1]
  if (isBlankNode(last) && last !== first)
    addInnerIssues(last, opts)
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
  opts: AnalyzeContext,
): void {
  const replacement = getLineBreak(blank.value)
  if (blank.value === replacement)
    return
  const { offset, issues } = opts

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
  opts: AnalyzeContext,
): void {
  checkOuterSide(children, { direction: -1, boundaryIndex, ...opts })
  checkOuterSide(children, { direction: 1, boundaryIndex, ...opts })
}

/**
 * Checks one side of a container and records insertion or normalization issues.
 */
export function checkOuterSide(
  children: ChildrenNode[],
  opts: {
    boundaryIndex: number
    offset: number
    issues: Issues
    direction: -1 | 1
  },
): void {
  const { boundaryIndex, direction, offset, issues } = opts

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
