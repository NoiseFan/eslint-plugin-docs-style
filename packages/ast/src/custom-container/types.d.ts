import type { Parent, RootContent } from 'mdast'
import type { Position } from 'unist'

/**
 * Reserved configuration surface shared by both container extensions.
 */
export type CustomContainerOptions = Record<never, never>

export interface CustomContainer extends Parent {
  type: 'customContainer'
  openTag: CustomContainerOpenTag
  closeTag?: CustomContainerCloseTag
  children: RootContent[]
  position?: Position
}

export interface CustomContainerOpenTag {
  type: string
  typePosition?: Position
  label?: string
  labelPosition?: Position
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
  position?: Position
}

declare module 'mdast' {
  interface BlockContentMap {
    customContainer: CustomContainer
  }

  interface RootContentMap {
    customContainer: CustomContainer
  }
}
