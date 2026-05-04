const FRONTMATTER_KEY_VALUE_LINE_RE = /^[\w-]+\s*:\s*(?:\S.*)?$/
const FRONTMATTER_DELIMITER_RE = /^\s{0,3}---\s*$/

/**
 * Check whether a line follows a simple YAML frontmatter key-value shape.
 * @example key: value
 */
export function isKeyValueLine(line: string): boolean {
  return FRONTMATTER_KEY_VALUE_LINE_RE.test(line)
}

/**
 * Check whether a raw text block is actually YAML frontmatter content
 * that was misparsed as a heading node.
 */
export function isFrontmatter(rawText: string): boolean {
  const lines = normalizeHeading(rawText)

  const lastLine = lines.at(-1) ?? ''
  if (FRONTMATTER_DELIMITER_RE.test(lastLine))
    return lines.slice(0, -1).every(isKeyValueLine)

  return lines.every(isKeyValueLine)
}

/**
 * Normalize a heading-like raw text block into lines using LF line breaks.
 */
function normalizeHeading(rawText: string): Array<string> {
  return rawText.replace(/\r\n?/g, '\n').split('\n')
}
