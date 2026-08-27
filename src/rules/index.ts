import paddingAroundCustomContainer from './padding-around-custom-container'
import spaceAroundCustomContainer from './space-around-custom-container'
import spaceAroundInlineElement from './space-around-inline-element/index'
import spaceAroundNumber from './space-around-number'
import spaceAroundWord from './space-around-word'
import validCustomContainerType from './valid-custom-container-type'
import validHeadingAnchor from './valid-heading-anchor/index'

export const rules = {
  'padding-around-custom-container': paddingAroundCustomContainer,
  'space-around-inline-element': spaceAroundInlineElement,
  'space-around-number': spaceAroundNumber,
  'space-around-word': spaceAroundWord,
  'space-around-custom-container': spaceAroundCustomContainer,
  'valid-custom-container-type': validCustomContainerType,
  'valid-heading-anchor': validHeadingAnchor,
}
