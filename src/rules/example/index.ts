import { createRule, } from '../../utils'

export const RULE_NAME = 'example'
const MESSAGE_IDS = {
  exampleMsgId: 'exampleMsgId',
} as const

type MessageIds = typeof MESSAGE_IDS[keyof typeof MESSAGE_IDS]
type Options = []

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: '',
    },
    messages: {
      exampleMsgId: 'exampleMsgId',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return{}
    }
  }
)
