/**
 * Match the trailing anchor-like fragment from a heading or adjacent text.
 * @example `中文标题 {#Chinese-Title}` -> `{#Chinese-Title}`
 * @example `使用 describe #Grouping Tests` -> `#Grouping Tests`
 */
export function getLikeAnchorMatch(str: string): string | null {
  const match = str.match(/(\{?#[\w\s.!`-]+\}?$)/)
  return match ? match[0] : null
}

/**
 * Parse the trailing anchor-like fragment from a heading string.
 * `isLike` is true when the fragment looks like a loose anchor such as
 * `# Your First Test`; false when it already looks like a compact anchor.
 * `rawLikeAnchor` is the cleaned anchor text without `{`, `}` or leading `#`.
 * @example `# Your First Test` -> { isLike: true, rawLikeAnchor: 'Your First Test' }
 * @example `{#built-in-slug}` -> { isLike: false, rawLikeAnchor: 'built-in-slug' }
 */
export function getLikeAnchor(str: string | undefined): { isLikeAnchor: boolean, rawLikeAnchor: string } | null {
  if (str === undefined)
    return null

  const match = getLikeAnchorMatch(str)
  if (!match)
    return null

  // clear `{`, `}`, `#`
  const rawLikeAnchor = match.replace(/[{}]/g, '').replace(/^#/, '').trimStart()
  return { isLikeAnchor: rawLikeAnchor.includes(' '), rawLikeAnchor }
}
