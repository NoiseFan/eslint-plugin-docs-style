const FRONTMATTER_KEY_VALUE_LINE_RE = /^[\w-]+\s*:\s*(?:\S.*)?$/
const FRONTMATTER_DELIMITER_RE = /^\s{0,3}---\s*$/

// @see https://webcoder.info/markdown-headers.html
const ATX_HEADING_RE = /^\s{0,3}#{1,6}.?/
const SETEXT_HEADING_UNDERLINE_RE = /[-=]{3}$/

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

  if (lines.length < 2)
    return false

  const lastLine = lines.at(-1) ?? ''
  if (!FRONTMATTER_DELIMITER_RE.test(lastLine))
    return false

  return lines.slice(0, -1).every(isKeyValueLine)
}

/**
 * Check whether a raw text block uses valid Markdown heading syntax.
 */
export function isHeading(rawText: string): boolean {
  const lines = normalizeHeading(rawText)
  if (lines.length === 0)
    return false

  if (ATX_HEADING_RE.test(lines[0]))
    return true
  if (lines.length < 2)
    return false

  return lines[0].trim().length > 0 && SETEXT_HEADING_UNDERLINE_RE.test(lines[lines.length - 1])
}

/**
 * Normalize a heading-like raw text block into lines using LF line breaks.
 */
function normalizeHeading(rawText: string): Array<string> {
  return rawText.replace(/\r\n?/g, '\n').split('\n')
}
