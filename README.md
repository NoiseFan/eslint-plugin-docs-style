# eslint-plugin-md-style

[![npm version](https://img.shields.io/npm/v/eslint-plugin-md-style)](https://www.npmjs.com/package/eslint-plugin-md-style)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-md-style)](https://www.npmjs.com/package/eslint-plugin-md-style)
[![codecov](https://codecov.io/gh/NoiseFan/eslint-plugin-md-style/graph/badge.svg?branch=main)](https://codecov.io/gh/NoiseFan/eslint-plugin-md-style?branch=main)

ESLint plugin for enforcing style rules in Markdown-based documentation.

## Overview

`eslint-plugin-md-style` provides Markdown-specific style rules and ready-to-use flat configs for `**/*.md` files.

It currently ships:

- A `recommended` config for typical documentation linting
- An `all` config that enables every rule in this plugin
- Markdown language registration built on top of `@eslint/markdown`

## Quick Start

### Version Requirements

- `eslint`: `^9.30.0` or `^10.0.0`
- `@antfu/eslint-config`: `^7.5.0` when used

This plugin is designed for ESLint flat config. If you use `@antfu/eslint-config`, make sure its version satisfies the requirement above.

Install the required packages:

```bash
pnpm add -D eslint @eslint/markdown eslint-plugin-md-style
```

Then enable the recommended config in your ESLint flat config:

```ts
import mdStyle from 'eslint-plugin-md-style'

export default [
  mdStyle.configs.recommended,
]
```

If you want full enforcement, replace `mdStyle.configs.recommended` with `mdStyle.configs.all`.

## Usage

### Manual Flat Config Usage

Use the built-in preset directly:

```ts
import mdStyle from 'eslint-plugin-md-style'

export default [
  mdStyle.configs.recommended,
]
```

You can also enable the plugin manually and choose rules one by one:

```ts
import mdStyle from 'eslint-plugin-md-style'

export default [
  {
    files: ['**/*.md'],
    plugins: {
      'md-style': mdStyle,
    },
    language: 'md-style/gfm',
    rules: {
      'md-style/space-around-inline-element': 'error',
      'md-style/valid-heading-anchor': 'error',
    },
  },
]
```

<details>
<summary>Usage with <code>@antfu/eslint-config</code></summary>

```ts
import antfu from '@antfu/eslint-config'
import mdStyle from 'eslint-plugin-md-style'

export default antfu(
  {
    formatters: true,
    markdown: true,
  },
  mdStyle.configs.recommended,
)
```

For partial adoption, start from `recommended` and override individual rules:

```ts
import antfu from '@antfu/eslint-config'
import mdStyle from 'eslint-plugin-md-style'

export default antfu(
  {
    formatters: true,
    markdown: true,
  },
  mdStyle.configs.recommended,
  {
    files: ['**/*.md'],
    rules: {
      'md-style/valid-heading-anchor': 'off',
    },
  },
)
```

</details>

## Rules

| Rule | Included in `recommended` | Autofix |
| --- | --- | --- |
| `md-style/padding-around-custom-container` |  | 🔧 |
| `md-style/space-around-custom-container` |  | 🔧 |
| `md-style/space-around-inline-element` | ✅ | 🔧 |
| `md-style/space-around-number` |  | 🔧 |
| `md-style/space-around-word` |  | 🔧 |
| `md-style/valid-custom-container-type` |  | 🔧 |
| `md-style/valid-heading-anchor` | ✅ | 🔧 |

## Why `@eslint/markdown` Is Required

This plugin builds on top of `@eslint/markdown` rather than replacing it.

`@eslint/markdown` provides the Markdown processor and language support. This plugin re-exports those capabilities through its own plugin entry and adds documentation style rules on top, including the `md-style/gfm` language used by the bundled configs.

## References

- [W3C Manual of Style](https://www.w3.org/guide/manual-of-style/)
- [中文排版要求](https://w3c.github.io/clreq/)

## License

[MIT](./LICENSE) License © 2025-PRESENT [Noise Fan](https://github.com/noisefan)
