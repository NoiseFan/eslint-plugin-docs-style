import antfu from '@antfu/eslint-config'
import { createSimplePlugin } from 'eslint-factory'

export default antfu(
  {
    type: 'lib',
    pnpm: true,
    typescript: true,
    test: {
      overrides: {
        'test/padding-around-after-all-blocks': 'error',
        'test/padding-around-after-each-blocks': 'error',
        'test/padding-around-before-all-blocks': 'error',
        'test/padding-around-before-each-blocks': 'error',
        'test/padding-around-describe-blocks': 'error',
        'test/padding-around-test-blocks': 'error',
        'test/prefer-to-be-truthy': 'error',
        'test/prefer-to-be-falsy': 'error',
      },
    },
    ignores: [
      'docs/rules',
      '**/tests/fixtures',
    ],
  },
  createSimplePlugin({
    name: 'no-src-import-path',
    include: ['*.ts', '**/*.ts'],
    create(context) {
      return {
        ImportDeclaration(node) {
          const source = node.source?.value
          const index = source.indexOf('src/')
          if (typeof source !== 'string' || index === -1 || !source.includes('src/'))
            return

          const nextPath = `'@/${source.slice(index + 'src/'.length)}'`
          context.report({
            node,
            message: 'Use @/ aliases instead of src/ import paths.',
            fix: fixer => fixer.replaceText(node.source, nextPath),
          })
        },
      }
    },
  }),
  createSimplePlugin({
    name: 'no-import-index',
    include: ['*.ts', '**/*.ts'],
    create(context) {
      return {
        ImportDeclaration(node) {
          const source = node.source.value
          if (typeof source !== 'string' || !source.endsWith('/index'))
            return
          const nextPath = source.slice(0, -1 * 'index'.length)
          context.report({
            node,
            message: 'Don\'t import like **/index path',
            fix: fixer => fixer.replaceText(node.source, `'${nextPath}'`),
          })
        },
      }
    },
  }),
  createSimplePlugin({
    name: 'no-import-rules',
    include: ['**/rules/**/*.ts'],
    create(context) {
      return {
        ImportDeclaration(node) {
          const source = node.source?.value
          if (typeof source !== 'string' || !source.startsWith('@/rules') || source.startsWith('@/rules/shared'))
            return
          context.report({
            node,
            message: 'Avoid direct imports from `@/rules`; use `@/rules/shared` for shared utils.',
          })
        },
      }
    },
  }),
)
