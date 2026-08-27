import type { MessageIds } from '.'
import type { ChildrenNode, CustomContainerBlockNode, OffsetRange, TagNode } from '@/types/custom-container'
import { isCloseNode, isCustomContainerNode, isOpenNode, parseCustomContainers } from '@/parser/custom-container'
import { MESSAGE_IDS } from '.'

export interface Issue extends OffsetRange {
  replacement: string
  messageId: MessageIds
}
/**
 * Finds custom-container marker lines and normalizes their surrounding spaces.
 *
 * Opening markers use exactly one space between the fence and the type,
 * while closing markers contain only the fence. Leading indentation is removed.
 * Ranges in `ignoredRanges` (for example fenced code blocks) are skipped.
 */
export function getCustomContainerMarkerIssues(
  source: string,
  ignoredRanges: readonly OffsetRange[] = [],
): Issue[] {
  const issues: Issue[] = []
  // Recursively visits parsed containers, including nested containers
  function visit(nodes: CustomContainerBlockNode[] | ChildrenNode[]): void {
    for (const node of nodes) {
      if (!isCustomContainerNode(node))
        continue

      for (const child of node.children) {
        if (isOpenNode(child) || isCloseNode(child))
          addMarkerIssue(child, ignoredRanges, issues)
        else if (isCustomContainerNode(child))
          visit([child])
      }
    }
  }

  visit(parseCustomContainers(source))
  return issues
}

/**
 * Adds a spacing issue for one parsed opening or closing marker.
 */
export function addMarkerIssue(
  tag: TagNode,
  ignoredRanges: readonly OffsetRange[],
  issues: Issue[],
): void {
  if (ignoredRanges.some(range => tag.position.start < range.end && tag.position.end > range.start))
    return

  const replacement = getNormalizedMarker(tag)
  if (tag.raw === replacement)
    return

  issues.push({
    ...tag.position,
    replacement,
    messageId: getMarkerMessageId(tag),
  })
}

/**
 * Returns the normalized source text for a parsed container marker.
 */
export function getNormalizedMarker(tag: TagNode): string {
  const fence = ':'.repeat(tag.markerLength)
  const closing: boolean = isCloseNode(tag)
  if (closing)
    return fence

  const valueStart = tag.value.start - tag.position.start
  return `${fence} ${tag.raw.slice(valueStart).trim()}`
}

/**
 * Classifies the spacing problem represented by a parsed marker.
 */
export function getMarkerMessageId(tag: TagNode): MessageIds {
  if (tag.raw.length !== tag.raw.trimStart().length)
    return MESSAGE_IDS.unexpectedIndentation
  const closing: boolean = isCloseNode(tag)
  if (closing)
    return MESSAGE_IDS.unexpectedTrailingSpace

  const separator = tag.raw.slice(tag.markerLength, tag.value.start - tag.position.start)
  if (separator.length === 0)
    return MESSAGE_IDS.missingSeparator
  return MESSAGE_IDS.unexpectedSeparator
}
