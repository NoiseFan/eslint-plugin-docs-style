import type { Parent, RootContent } from 'mdast'
import type { Position } from 'unist'

/**
 * Reserved configuration surface shared by both container extensions.
 */
export type CustomContainerOptions = Record<never, never>

export interface CustomContainer extends Parent {
  type: 'customContainer'
  children: RootContent[]
  tag: {
    open: CustomContainerOpenTag
    close?: CustomContainerCloseTag
  }
  position?: Position
}

type CUSTOM_CONTAINER_TYPES = 'info' | 'tip' | 'warning' | 'danger' | 'details' | 'raw' | 'code-group' | 'v-pre' | 'tabs' | string

export interface CustomContainerOpenTag {
  type: {
    value: CUSTOM_CONTAINER_TYPES
    position?: Position
  }
  label?: CustomContainerAttr
  attr?: CustomContainerAttr
  markerLength: number
  position?: Position
}

export interface CustomContainerCloseTag {
  markerLength: number
  position?: Position
}

export interface CustomContainerAttr {
  value: string
  position: Position
}

declare module 'mdast' {
  interface BlockContentMap {
    customContainer: CustomContainer
  }

  interface RootContentMap {
    customContainer: CustomContainer
  }
}
