export function hasChinese(str: string): boolean {
  return /[\u4E00-\u9FA5]/.test(str)
}

/**
 * Check if the string has an anchor.
 * @example: {#chinese-anchor}
 */
export function hasAnchor(str: string): boolean {
  return /\s\{#[a-z0-9]+(?:-[a-z0-9]+)*\}/.test(str)
}

export function getLikeAnchor(str: string): string | null {
  const match = str.match(/ #\s*[A-Z0-9`'-]+(?: [A-Z0-9`'-]+)*$/i)?.[0]
  return match ? match.slice(2).trimStart() : null
}
