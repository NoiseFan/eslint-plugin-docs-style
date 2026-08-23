import spaceAroundInlineElement from './space-around-inline-element/index'
import spaceAroundNumber from './space-around-number'
import spaceAroundWord from './space-around-word'
import validCustomContainerType from './valid-custom-container-type'
import validHeadingAnchor from './valid-heading-anchor/index'

export const rules = {
  'space-around-inline-element': spaceAroundInlineElement,
  'space-around-number': spaceAroundNumber,
  'space-around-word': spaceAroundWord,
  'valid-custom-container-type': validCustomContainerType,
  'valid-heading-anchor': validHeadingAnchor,
}
