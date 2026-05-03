# eslint-plugin-docs-style

ESLint plugin for enforcing style rules in Markdown-based documentation.

## Install

```bash
pnpm add -D eslint @eslint/markdown eslint-plugin-docs-style
```

`@eslint/markdown` is required because this plugin registers Markdown processors and languages on top of it.

## Usage

Use the built-in flat configs to lint Markdown files directly.

### With `@antfu/eslint-config`

```ts
import antfu from '@antfu/eslint-config'
import docsStyle from 'eslint-plugin-docs-style'

export default antfu(
  {
    formatters: true,
    markdown: true,
  },
  docsStyle.configs.recommended,
)
```

If you want full enforcement instead of the default recommended preset, replace `plugin.configs.recommended` with `plugin.configs.all`.

For partial adoption, you can start from `recommended` and override individual rules:

```ts
import antfu from '@antfu/eslint-config'
import docsStyle from 'eslint-plugin-docs-style'

export default antfu(
  {
    formatters: true,
    markdown: true,
  },
  docsStyle.configs.recommended,
  {
    files: ['**/*.md'],
    rules: {
      'docs-style/valid-heading-anchor': 'off',
    },
  },
)
```

If you only want to enable part of the plugin, register the plugin and select rules manually:

```ts
import antfu from '@antfu/eslint-config'
import plugin from 'eslint-plugin-docs-style'

export default antfu(
  {
    formatters: true,
    markdown: true,
  },
  {
    files: ['**/*.md'],
    plugins: {
      'docs-style': plugin,
    },
    language: 'docs-style/commonmark',
    rules: {
      'docs-style/space-between-link': 'error',
      'docs-style/valid-heading-anchor': 'error',
    },
  },
)
```

### `recommended`

```ts
import plugin from 'eslint-plugin-docs-style'

export default [
  plugin.configs.recommended,
]
```

`recommended` is the default entry for production use. It targets `**/*.md`, uses the plugin's `commonmark` language, and enables the stable rules currently recommended by this package.

### `all`

```ts
import plugin from 'eslint-plugin-docs-style'

export default [
  plugin.configs.all,
]
```

`all` enables every rule exported by this plugin. It is useful when you want full enforcement or when checking rule behavior during development.

## Rules

| Rule | Included in `recommended` | Autofix |
| --- | --- | --- |
| `docs-style/space-between-link` | Yes | Yes |
| `docs-style/valid-heading-anchor` | Yes | Yes |

## License

[MIT](./LICENSE) License © 2025-PRESENT [Noise Fan](https://github.com/noisefan)
