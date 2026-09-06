import type { Code, Construct, Effects, Extension, State, Token, TokenizeContext } from 'micromark-util-types'
import type { CustomContainerOptions } from './types'
import { factorySpace } from 'micromark-factory-space'
import { markdownLineEnding, markdownSpace } from 'micromark-util-character'

const COLON = 58
const LEFT_BRACE = 123
const RIGHT_BRACE = 125

interface ContainerToken extends Token {
  _customContainerClosing?: boolean
  _customContainerIndent?: number
}

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    customContainer: 'customContainer'
    customContainerAttr: 'customContainerAttr'
    customContainerContent: 'customContainerContent'
    customContainerFence: 'customContainerFence'
    customContainerFenceSequence: 'customContainerFenceSequence'
    customContainerLabel: 'customContainerLabel'
    customContainerType: 'customContainerType'
  }
}

/**
 * Create the micromark syntax extension for VitePress-style containers.
 */
export function customContainer(_options: CustomContainerOptions = {}): Extension {
  return {
    flow: {
      [COLON]: { concrete: true, name: 'customContainer', tokenize: tokenizeCustomContainer },
    },
  }
}

function tokenizeCustomContainer(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  // Micromark tokenizer callbacks expose parser state through `this`.
  // eslint-disable-next-line ts/no-this-alias
  const self = this
  const tail = self.events.at(-1)
  const initialIndent = tail?.[1].type === 'linePrefix'
    ? tail[2].sliceSerialize(tail[1], true).length
    : 0

  let openMarkerLength = 0
  let contentPrevious: Token | undefined
  const closingFence: Construct = { partial: true, tokenize: tokenizeClosingFence }
  const attr: Construct = { partial: true, tokenize: tokenizeAttr }
  const attrSuffix: Construct = { partial: true, tokenize: tokenizeAttrSuffix }
  const nonLazyLine: Construct = { partial: true, tokenize: tokenizeNonLazyLine }

  return start

  function start(code: Code): State | undefined {
    const container = effects.enter('customContainer') as ContainerToken
    const fence = effects.enter('customContainerFence') as ContainerToken

    container._customContainerIndent = initialIndent
    fence._customContainerIndent = initialIndent
    effects.enter('customContainerFenceSequence')
    return openSequence(code)
  }

  function openSequence(code: Code): State | undefined {
    // console.log('[]', { COLON, code })
    if (code === COLON) {
      openMarkerLength++
      effects.consume(code)
      return openSequence
    }
    if (openMarkerLength < 3 || !markdownSpace(code))
      return nok(code)
    effects.exit('customContainerFenceSequence')
    effects.enter('whitespace')
    effects.consume(code)
    return openWhitespace
  }

  function openWhitespace(code: Code): State | undefined {
    if (markdownSpace(code)) {
      effects.consume(code)
      return openWhitespace
    }
    effects.exit('whitespace')
    if (!isTypeCharacter(code))
      return nok(code)
    effects.enter('customContainerType')
    effects.consume(code)
    return type
  }

  function type(code: Code): State | undefined {
    if (isTypeCharacter(code)) {
      effects.consume(code)
      return type
    }
    effects.exit('customContainerType')
    if (markdownSpace(code)) {
      effects.enter('whitespace')
      effects.consume(code)
      return suffixWhitespace
    }
    return finishOpening(code)
  }

  function finishOpening(code: Code): State | undefined {
    if (code !== null && !markdownLineEnding(code))
      return nok(code)
    effects.exit('customContainerFence')
    if (code === null)
      return after(code)
    if (self.interrupt)
      return ok(code)
    return effects.attempt(nonLazyLine, contentStart, after)(code)
  }

  function suffixWhitespace(code: Code): State | undefined {
    if (markdownSpace(code)) {
      effects.consume(code)
      return suffixWhitespace
    }
    effects.exit('whitespace')
    if (code === LEFT_BRACE)
      return effects.attempt(attr, finishOpening, labelStart)(code)
    if (code === null || markdownLineEnding(code))
      return finishOpening(code)
    return labelStart(code)
  }

  function labelStart(code: Code): State | undefined {
    effects.enter('customContainerLabel')
    return label(code)
  }

  function label(code: Code): State | undefined {
    if (code === null || markdownLineEnding(code)) {
      effects.exit('customContainerLabel')
      return finishOpening(code)
    }
    if (markdownSpace(code))
      return effects.check(attrSuffix, labelBeforeAttr, labelData)(code)
    effects.consume(code)
    return label
  }

  function labelData(code: Code): State | undefined {
    effects.consume(code)
    return label
  }

  function labelBeforeAttr(code: Code): State | undefined {
    effects.exit('customContainerLabel')
    return effects.attempt(attrSuffix, finishOpening, nok)(code)
  }

  function contentStart(code: Code): State | undefined {
    if (code === null)
      return after(code)
    if (markdownLineEnding(code))
      return effects.check(nonLazyLine, emptyContentAfter, after)(code)
    effects.enter('customContainerContent')
    return lineStart(code)
  }

  function emptyContentAfter(code: Code): State | undefined {
    effects.enter('customContainerContent')
    return lineStart(code)
  }

  function lineStart(code: Code): State | undefined {
    return effects.attempt(
      closingFence,
      afterContent,
      initialIndent
        ? factorySpace(effects, chunkStart, 'linePrefix', initialIndent + 1)
        : chunkStart,
    )(code)
  }

  function chunkStart(code: Code): State | undefined {
    if (code === null)
      return afterContent(code)
    if (markdownLineEnding(code))
      return effects.check(nonLazyLine, chunkNonLazyStart, afterContent)(code)
    return chunkNonLazyStart(code)
  }

  function chunkNonLazyStart(code: Code): State | undefined {
    const token = effects.enter('chunkDocument', {
      contentType: 'document',
      previous: contentPrevious,
    })
    if (contentPrevious)
      contentPrevious.next = token
    contentPrevious = token
    return contentContinue(code)
  }

  function contentContinue(code: Code): State | undefined {
    if (code === null) {
      const token = effects.exit('chunkDocument')
      self.parser.lazy[token.start.line] = false
      return afterContent(code)
    }
    if (markdownLineEnding(code))
      return effects.check(nonLazyLine, nonLazyLineAfter, lineAfter)(code)
    effects.consume(code)
    return contentContinue
  }

  function nonLazyLineAfter(code: Code): State | undefined {
    effects.consume(code)
    const token = effects.exit('chunkDocument')
    self.parser.lazy[token.start.line] = false
    return lineStart
  }

  function lineAfter(code: Code): State | undefined {
    const token = effects.exit('chunkDocument')
    self.parser.lazy[token.start.line] = false
    return afterContent(code)
  }

  function afterContent(code: Code): State | undefined {
    effects.exit('customContainerContent')
    return after(code)
  }

  function after(code: Code): State | undefined {
    effects.exit('customContainer')
    return ok(code)
  }

  function tokenizeClosingFence(
    this: TokenizeContext,
    closingEffects: Effects,
    closingOk: State,
    closingNok: State,
  ): State {
    let indent = 0
    let size = 0
    return closingStart

    function closingStart(code: Code): State | undefined {
      const token = closingEffects.enter('customContainerFence') as ContainerToken
      token._customContainerClosing = true
      token._customContainerIndent = 0
      return closingIndent(code)
    }

    function closingIndent(code: Code): State | undefined {
      if (code === 32 && indent < 3) {
        indent++
        closingEffects.consume(code)
        return closingIndent
      }
      if (code !== COLON)
        return closingNok(code)
      closingEffects.enter('customContainerFenceSequence')
      return closingSequence(code)
    }

    function closingSequence(code: Code): State | undefined {
      if (code === COLON) {
        size++
        closingEffects.consume(code)
        return closingSequence
      }
      if (size < openMarkerLength)
        return closingNok(code)
      closingEffects.exit('customContainerFenceSequence')
      if (markdownSpace(code)) {
        closingEffects.enter('whitespace')
        closingEffects.consume(code)
        return closingWhitespace
      }
      return closingAfter(code)
    }

    function closingWhitespace(code: Code): State | undefined {
      if (markdownSpace(code)) {
        closingEffects.consume(code)
        return closingWhitespace
      }
      closingEffects.exit('whitespace')
      return closingAfter(code)
    }

    function closingAfter(code: Code): State | undefined {
      if (code !== null && !markdownLineEnding(code))
        return closingNok(code)
      closingEffects.exit('customContainerFence')
      return closingOk(code)
    }
  }

  function tokenizeNonLazyLine(
    this: TokenizeContext,
    lineEffects: Effects,
    lineOk: State,
    lineNok: State,
  ): State {
    // eslint-disable-next-line ts/no-this-alias
    const context = this
    return startLine

    function startLine(code: Code): State | undefined {
      lineEffects.enter('lineEnding')
      lineEffects.consume(code)
      lineEffects.exit('lineEnding')
      return lineStart
    }

    function lineStart(code: Code): State | undefined {
      return context.parser.lazy[context.now().line] ? lineNok(code) : lineOk(code)
    }
  }

  function tokenizeAttr(
    this: TokenizeContext,
    attrEffects: Effects,
    attrOk: State,
    attrNok: State,
  ): State {
    let hasValue = false
    return attrStart

    function attrStart(code: Code): State | undefined {
      if (code !== LEFT_BRACE)
        return attrNok(code)
      attrEffects.enter('customContainerAttr')
      attrEffects.consume(code)
      return attrValue
    }

    function attrValue(code: Code): State | undefined {
      if (code === RIGHT_BRACE && hasValue) {
        attrEffects.consume(code)
        attrEffects.exit('customContainerAttr')
        return attrAfter
      }
      if (code === null || markdownLineEnding(code) || code === LEFT_BRACE || code === RIGHT_BRACE)
        return attrNok(code)
      hasValue = true
      attrEffects.consume(code)
      return attrValue
    }

    function attrAfter(code: Code): State | undefined {
      if (markdownSpace(code)) {
        attrEffects.enter('whitespace')
        attrEffects.consume(code)
        return attrWhitespace
      }
      return code === null || markdownLineEnding(code) ? attrOk(code) : attrNok(code)
    }

    function attrWhitespace(code: Code): State | undefined {
      if (markdownSpace(code)) {
        attrEffects.consume(code)
        return attrWhitespace
      }
      attrEffects.exit('whitespace')
      return code === null || markdownLineEnding(code) ? attrOk(code) : attrNok(code)
    }
  }

  function tokenizeAttrSuffix(
    this: TokenizeContext,
    suffixEffects: Effects,
    suffixOk: State,
    suffixNok: State,
  ): State {
    // eslint-disable-next-line ts/no-this-alias
    const context = this
    return beforeAttr

    function beforeAttr(code: Code): State | undefined {
      if (markdownSpace(code)) {
        suffixEffects.enter('whitespace')
        suffixEffects.consume(code)
        return whitespace
      }
      return suffixNok(code)
    }

    function whitespace(code: Code): State | undefined {
      if (markdownSpace(code)) {
        suffixEffects.consume(code)
        return whitespace
      }
      suffixEffects.exit('whitespace')
      return code === LEFT_BRACE
        ? tokenizeAttr.call(context, suffixEffects, suffixOk, suffixNok)(code)
        : suffixNok(code)
    }
  }
}

function isTypeCharacter(code: Code): boolean {
  return code !== null && (
    (code >= 48 && code <= 57)
    || (code >= 65 && code <= 90)
    || code === 95
    || code === 45
    || (code >= 97 && code <= 122)
  )
}
