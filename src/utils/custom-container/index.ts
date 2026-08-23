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

export const CUSTOM_CONTAINER_OPEN_MARKER_RE = /^:{3,}([\s\w]+)/
export const CUSTOM_CONTAINER_CLOSE_MARKER_RE = /^\n:{3,}$/

/**
 * Checks whether adjacent text is a custom container marker on the next line.
 *
 * @see https://vitepress.dev/guide/markdown#custom-containers
 * @example `\n:::` -> true
 * @example `\n::::` -> true
 * @example `:::` -> false
 */
export function isCustomContainerMarker(str: string | undefined): boolean {
  if (!str)
    return false
  return CUSTOM_CONTAINER_CLOSE_MARKER_RE.test(str) || CUSTOM_CONTAINER_OPEN_MARKER_RE.test(str)
}
