/**
 * Extracts the union of value types from an object type.
 */
export type ValueOf<T> = T[keyof T]
