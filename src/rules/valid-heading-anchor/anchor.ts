import { getLikeAnchor, getLikeAnchorMatch } from '@/utils/anchor'
/**
 * Extract anchor content from `#anchor` or `{#anchor}`.
 */
export function getAnchor(str: string): string | null {
  const match = str.match(/\{?#([^}]+)\}?/)
  return match ? match[1] : null
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
  return /\p{Script=Han}/u.test(str)
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
  const completeHyphen = lowerCaseAnchor.replace(/[\s.]+/g, '-')
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
