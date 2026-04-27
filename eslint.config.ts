import antfu from '@antfu/eslint-config'
import markdown from '@eslint/markdown'
import plugin from './src/index'

export default antfu(
  {
    type: 'lib',
    typescript: true,
  },
  {
    files: ['**/*.md'],
    plugins: {
      markdown,
      vitepress: plugin,
    },
    rules: {
      'vitepress/valid-heading-anchor': 'error',
    },
  },
)
