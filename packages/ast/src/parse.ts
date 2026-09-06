import type { Root } from 'mdast'
import type { Options as FromMarkdownOptions } from 'mdast-util-from-markdown'
import type { CustomContainerOptions } from './custom-container/'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { gfm } from 'micromark-extension-gfm'
import { customContainer, customContainerFromMarkdown } from './custom-container/'

export interface ParseMarkdownOptions {
  gfm?: boolean
  customContainer?: boolean | CustomContainerOptions
  extensions?: NonNullable<FromMarkdownOptions['extensions']>
  mdastExtensions?: NonNullable<FromMarkdownOptions['mdastExtensions']>
}

/**
 * Parse Markdown with the package's syntax extensions enabled by default.
 */
export function parseMarkdown(source: string | Uint8Array, options: ParseMarkdownOptions = {}): Root {
  const syntaxExtensions: NonNullable<FromMarkdownOptions['extensions']> = []
  const mdastExtensions: NonNullable<FromMarkdownOptions['mdastExtensions']> = []

  if (options.gfm !== false) {
    syntaxExtensions.push(gfm())
    mdastExtensions.push(gfmFromMarkdown())
  }

  if (options.customContainer !== false) {
    const containerOptions = options.customContainer === true || options.customContainer === undefined
      ? undefined
      : options.customContainer
    syntaxExtensions.push(customContainer(containerOptions))
    mdastExtensions.push(customContainerFromMarkdown(containerOptions))
  }
  // console.log('[]', { f: JSON.stringify(fromMarkdown(source), null, 2) })
  return fromMarkdown(source, {
    extensions: [...syntaxExtensions, ...options.extensions ?? []],
    mdastExtensions: [...mdastExtensions, ...options.mdastExtensions ?? []],
  })
}
