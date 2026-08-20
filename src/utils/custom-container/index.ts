export * from './parse'

export const CUSTOM_CONTAINER_TYPES = [
  'info',
  'tip',
  'warning',
  'danger',
  'details',
  'raw',
] as const

export type CustomContainerType = typeof CUSTOM_CONTAINER_TYPES[number]

const CUSTOM_CONTAINER_TYPE_SET = new Set<string>(CUSTOM_CONTAINER_TYPES)

/**
 * Checks whether a value is one of the custom-container types supported by VitePress.
 */
export function isCustomContainerType(value: string): value is CustomContainerType {
  return CUSTOM_CONTAINER_TYPE_SET.has(value)
}
