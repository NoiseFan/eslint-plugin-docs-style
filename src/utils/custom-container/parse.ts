import type { ChildrenNode, CustomContainerAST, TagNode } from '@/types/custom-container'

const OPEN_TAG_RE = /^:{3,}([\s\w]+)/gm

export function parseCustomContainers(value: string, remainSplits?: Array<string>, depth = 1): CustomContainerAST {
  const splits = remainSplits ?? value.split('\n')
  const children: ChildrenNode[] = []
  let hasOpenTag = false

  while (splits.length) {
    const item = splits.shift()
    if (item === undefined)
      break

    if (!item.length) {
      parseBlankNode(children)
      continue
    }

    if (parseOpenNode(item, value, splits, depth, children, hasOpenTag)) {
      hasOpenTag = true
      continue
    }

    const closeTag = parseCloseTag(item)
    if (closeTag) {
      children.push(closeTag)
      if (hasOpenTag)
        break
      continue
    }

    children.push({ type: 'text', value: item })
  }
  return { type: 'cumstom-container', depth, children }
}

function parseBlankNode(children: Array<ChildrenNode>): void {
  const previous = children.at(-1)
  if (previous?.type === 'blank')
    previous.value += '\n'
  else
    children.push({ type: 'blank', value: '\n' })
}

function parseOpenNode(item: string, value: string, splits: Array<string>, depth: number, children: Array<ChildrenNode>, hasOpenTag: boolean): boolean {
  const openTag = parseOpenTag(item)
  if (!openTag)
    return false

  if (!hasOpenTag) {
    children.push(openTag)
  }
  else {
    splits.unshift(item)
    children.push(parseCustomContainers(value, splits, depth + 1))
  }

  return true
}

function parseOpenTag(content: string): TagNode | null {
  const matched = content.match(OPEN_TAG_RE)
  if (!matched)
    return null

  const values = content.split(/\s/)
  const value = values[1]
  const title = value[2]
  return {
    type: 'open',
    raw: content,
    value,
    title,
  }
}

function parseCloseTag(value: string): TagNode | null {
  if (value !== ':::')
    return null

  return {
    type: 'close',
    raw: value,
    value,
  }
}
