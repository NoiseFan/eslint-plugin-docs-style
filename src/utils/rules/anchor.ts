export function getHeadingNodeText(node: any): string {
  if (typeof node?.value === 'string')
    return node.value

  if (Array.isArray(node?.children))
    return node.children.map(getHeadingNodeText).join('')

  return ''
}
export function getAnchor(str: string): string | null {
  const match = str.match(/\{#([^}]+)\}$/)
  return match ? match[1] : null
}

/**
 * get the anchor from a string
 * get possible anchor points based on the last `#`
 * @example #Your First Test -> Your First Test
 */
export function getLikeAnchor(str: string): string | null {
  const match = str.match(/(\{?#[\w\s`-]+\}?$)/g)

  if (!match)
    return null
  // clear `{`, `}`, `#`
  return match[0].replace(/(\{|\})/g, '').replace(/^#/, '').trimStart()
}

/**
 * Check if the string has an anchor.
 * @example: {#chinese-anchor}
 */
export function hasAnchor(str: string): boolean {
  return /\s\{#[a-z0-9]+(?:-[a-z0-9]+)*\}/.test(str)
}

export function hasExplicitAnchor(str: string): boolean {
  return /\s\{#[^}]+\}$/.test(str)
}

export function hasChinese(str: string): boolean {
  return /[\u4E00-\u9FA5]/.test(str)
}

export function normalizeAnchor(anchor: string): string {
  const lowerCaseAnchor = anchor.toLowerCase()
  const completeHyphen = lowerCaseAnchor.replace(/\s/g, '-')
  const keepLegalCharacters = completeHyphen.replace(/[^a-z0-9_-]/g, '')
  return keepLegalCharacters.replace(/^-+|-+$/g, '')
}
