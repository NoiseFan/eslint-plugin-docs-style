import type { ChildrenNode, CustomContainerBlockNode, OffsetRange, TagNode } from '@/types/custom-container'
import { isCloseNode, isCustomContainerNode, isOpenNode, parseCustomContainers } from '@/parser/custom-container'

export const CUSTOM_CONTAINER_MARKER_MESSAGE_IDS = {
  unexpectedIndentation: 'unexpectedIndentation',
  missingSeparator: 'missingSeparator',
  unexpectedSeparator: 'unexpectedSeparator',
  unexpectedTrailingSpace: 'unexpectedTrailingSpace',
} as const

export type CustomContainerMarkerMessageId = typeof CUSTOM_CONTAINER_MARKER_MESSAGE_IDS[keyof typeof CUSTOM_CONTAINER_MARKER_MESSAGE_IDS]

export interface CustomContainerMarkerIssue extends OffsetRange {
  replacement: string
  messageId: CustomContainerMarkerMessageId
}

/**
 * Finds custom-container marker lines and normalizes their surrounding spaces.
 *
 * Opening markers use exactly one space between the fence and the type, while
 * closing markers contain only the fence. Leading indentation is removed.
 * Ranges in `ignoredRanges` (for example fenced code blocks) are skipped.
 */
export function getCustomContainerMarkerIssues(
  source: string,
  ignoredRanges: readonly OffsetRange[] = [],
): CustomContainerMarkerIssue[] {
  const issues: CustomContainerMarkerIssue[] = []
  collectMarkerIssues(parseCustomContainers(source), ignoredRanges, issues)
  return issues
}

/**
 * Recursively collects spacing issues from parsed custom-container tags.
 */
export function collectMarkerIssues(
  nodes: CustomContainerBlockNode[] | ChildrenNode[],
  ignoredRanges: readonly OffsetRange[],
  issues: CustomContainerMarkerIssue[],
): void {
  for (const node of nodes) {
    if (!isCustomContainerNode(node))
      continue

    for (const child of node.children) {
      if (isOpenNode(child) || isCloseNode(child))
        addMarkerIssue(child, ignoredRanges, issues)
      else if (isCustomContainerNode(child))
        collectMarkerIssues([child], ignoredRanges, issues)
    }
  }
}

/**
 * Adds a spacing issue for one parsed opening or closing marker.
 */
export function addMarkerIssue(
  tag: TagNode,
  ignoredRanges: readonly OffsetRange[],
  issues: CustomContainerMarkerIssue[],
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
export function getMarkerMessageId(tag: TagNode): CustomContainerMarkerMessageId {
  if (tag.raw.length !== tag.raw.trimStart().length)
    return CUSTOM_CONTAINER_MARKER_MESSAGE_IDS.unexpectedIndentation
  const closing: boolean = isCloseNode(tag)
  if (closing)
    return CUSTOM_CONTAINER_MARKER_MESSAGE_IDS.unexpectedTrailingSpace

  const separator = tag.raw.slice(tag.markerLength, tag.value.start - tag.position.start)
  if (separator.length === 0)
    return CUSTOM_CONTAINER_MARKER_MESSAGE_IDS.missingSeparator
  return CUSTOM_CONTAINER_MARKER_MESSAGE_IDS.unexpectedSeparator
}
