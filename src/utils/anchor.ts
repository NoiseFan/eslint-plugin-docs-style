/**
 * Match the trailing anchor-like fragment from a heading or adjacent text.
 */
function getLikeAnchorMatch(str: string): string | null {
  const match = str.match(/(\{?#[\w\s.!`-]+\}?$)/)
  return match ? match[0] : null
}

/**
 * Parse a trailing anchor-like fragment without applying heading-specific normalization.
 */
export function getLikeAnchor(str: string | undefined): { isLikeAnchor: boolean, rawLikeAnchor: string } | null {
  if (str === undefined)
    return null

  const match = getLikeAnchorMatch(str)
  if (!match)
    return null

  const rawLikeAnchor = match.replace(/[{}]/g, '').replace(/^#/, '').trimStart()
  return { isLikeAnchor: rawLikeAnchor.includes(' '), rawLikeAnchor }
}
