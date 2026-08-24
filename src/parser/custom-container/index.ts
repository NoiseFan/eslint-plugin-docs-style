export * from './parse'

export const CUSTOM_CONTAINER_TYPES = [
  'info',
  'tip',
  'warning',
  'danger',
  'details',
  'raw',
  'code-group',
  'v-pre',
  'tabs', // support `vitepress-plugin-tabs`
] as const

export type CustomContainerType = typeof CUSTOM_CONTAINER_TYPES[number]

const CUSTOM_CONTAINER_TYPE_SET = new Set<string>(CUSTOM_CONTAINER_TYPES)

/**
 * Checks whether a value is one of the custom-container types supported by VitePress.
 */
export function isCustomContainerType(value: string): value is CustomContainerType {
  return CUSTOM_CONTAINER_TYPE_SET.has(value)
}

const CUSTOM_CONTAINER_MARKER_PATTERN = String.raw`(^ {0,3}:{3,}[ \t]+)`
const CUSTOM_CONTAINER_TYPE_PATTERN = String.raw`([\w-]+)(?=$|[ \t]|\r?\n)`
const CUSTOM_CONTAINER_TITLE_AND_ATTRS_PATTERN = String.raw`([ \t][^\r\n]*)?`

export const CUSTOM_CONTAINER_OPEN_MARKER_RE = new RegExp(
  `${CUSTOM_CONTAINER_MARKER_PATTERN}${CUSTOM_CONTAINER_TYPE_PATTERN}${CUSTOM_CONTAINER_TITLE_AND_ATTRS_PATTERN}`,
)
export const CUSTOM_CONTAINER_ATTRS_RE = /(\{[^{}]+\})\s*$/
export const CUSTOM_CONTAINER_CLOSE_MARKER_RE = /^\r?\n {0,3}:{3,}[ \t]*$/

/**
 * Checks whether adjacent text is a custom container marker on the next line.
 *
 * @see https://vitepress.dev/guide/markdown#custom-containers
 * @example `::: info` -> true
 * @example `:::: tip` -> true
 * @example `:::` -> false
 */
export function isCustomContainerMarker(str: string | undefined): boolean {
  if (!str)
    return false
  return CUSTOM_CONTAINER_CLOSE_MARKER_RE.test(str) || CUSTOM_CONTAINER_OPEN_MARKER_RE.test(str)
}
