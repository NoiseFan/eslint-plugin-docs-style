/**
 * Extract anchor content from `#anchor` or `{#anchor}`.
 */
export function getAnchor(str: string): string | null {
  const match = str.match(/\{?#([^}]+)\}?/)
  return match ? match[1] : null
}

/**
 * Match the trailing anchor-like fragment from a heading string.
 * @example `中文标题 {#Chinese-Title}` -> `{#Chinese-Title}`
 * @example `使用 describe #Grouping Tests` -> `#Grouping Tests`
 */
function getLikeAnchorMatch(str: string): string | null {
  const match = str.match(/(\{?#[\w\s`-]+\}?$)/)
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
  const rawLikeAnchor = match.replace(/(\{|\})/g, '').replace(/^#/, '').trimStart()
  const isLikeAnchor = rawLikeAnchor.includes(' ')
  return { isLikeAnchor, rawLikeAnchor }
}

/**
 * Check if the string has an anchor.
 * @example: {#chinese-anchor}
 */
export function isStrictAnchor(str: string): boolean {
  return /\s\{#[a-z0-9]+(?:-[a-z0-9]+)*\}/.test(str)
}

/**
 * Check whether the string contains CJK Han characters.
 */
export function hasChinese(str: string): boolean {
  return /[\u4E00-\u9FA5]/.test(str)
}

/**
 * Normalize raw anchor text into the strict anchor format content.
 * - lowercase all letters
 * - convert spaces to `-`
 * - remove unsupported characters
 * - trim leading/trailing `-`
 */
export function normalizeAnchor(anchor: string): string {
  const lowerCaseAnchor = anchor.toLowerCase()
  const completeHyphen = lowerCaseAnchor.replace(/\s/g, '-')
  const keepLegalCharacters = completeHyphen.replace(/[^a-z0-9_-]/g, '')
  return keepLegalCharacters.replace(/^-+|-+$/g, '')
}

/**
 * Count wrapper characters contributed by the trailing like-anchor fragment.
 * The value is the length difference between the raw matched fragment and the
 * cleaned anchor text returned by `getLikeAnchor`.
 * @example `# 中文标题 {#Chinese-Title}` -> 3
 * @example `## 使用 \`describe\` 编组测试 #Grouping Tests with \`describe\`` -> 1
 */
export function calcAnchorPositionCompensate(content: string): number {
  const match = getLikeAnchorMatch(content)
  const anchor = getLikeAnchor(content)

  if (!match || !anchor)
    return 0

  return match.length - anchor.rawLikeAnchor.length
}
