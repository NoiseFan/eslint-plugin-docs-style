# Space Around Word

Require exactly one space at a boundary between CJK text and a Latin word.

## Rule Details

The `space-around-word` rule checks Markdown text nodes. When a Latin word is directly next to a CJK character, the boundary must contain one ordinary space.

The rule checks Han, Hiragana, Katakana, and Hangul characters as CJK text. A Latin word is made up of Unicode Latin-script letters; numbers, punctuation, symbols, emoji, and letters from other scripts are not treated as Latin words.

In addition, the rule changes any run of two or more spaces in a checked text node to one ordinary space, even when the spaces are not between CJK text and a Latin word.

## Options

This rule has no options.

## Valid

One space separates adjacent CJK and Latin text:

```md
在 watch 模式下，编辑 setup 文件会触发所有测试重新运行。
[setup 文件](/config/setupfiles)
## Shell 自动补全 {#shell-autocompletions}
<Box>使用 Babel 进行预插桩</Box>
```

Punctuation at the start or end of a sentence does not create a CJK-Latin boundary, so the rule does not require an additional space there:

```md
（Vitest）已发布。
Vitest：一个快速的测试工具
```

An existing single space next to punctuation is not preserved:

```md
目前，Vitest 还不支持范围：
```

Text containing no CJK-Latin boundary is also valid:

```md
A mock that always returns `undefined` isn't very useful on its own.
```

## Invalid

Missing space before a Latin word:

```md
在watch 模式下
```

Missing space after a Latin word:

```md
在 watch模式下
```

Missing spaces on both sides of a Latin word:

```md
在watch模式下
```

More than one space in a checked text node:

```md
在  watch 模式下
在 watch  模式下
在  watch   模式下
```

The same boundary requirement applies to link labels, headings, and text between HTML tags:

```md
[setup文件](/config/setupfiles)
## Shell自动补全 {#shell-autocompletions}
<Box>使用Babel进行预插桩</Box>
```

## Autofix

This rule is autofixable. The fixer inserts a missing CJK-Latin boundary space and replaces a run of multiple space characters in the affected text node with one ordinary space. It changes only the text node's whitespace and leaves surrounding Markdown syntax unchanged.

For example, this input:

```md
在watch模式下
```

is fixed to:

```md
在 watch 模式下
```

The same applies to link labels. The link destination is preserved:

```md
[setup文件](/config/setupfiles)
```

is fixed to:

```md
[setup 文件](/config/setupfiles)
```

## Ignored Contexts

The rule registers a visitor only for Markdown `text` nodes. The parent construct does not matter: paragraph text, heading text, link labels, and text between HTML tags are checked when represented as `text` nodes.

Fenced code blocks (`code`) are ignored:

````md
```text
在watch模式下
```
````

Inline code (`inlineCode`) is ignored:

```md
`在watch模式下`
```

HTML comments and tags (`html`) are ignored:

```md
<!-- 在watch模式下 -->
```

YAML frontmatter (`yaml`) is ignored:

```md
---
title: 在watch模式下
---
```

In an HTML element, only content separated into a `text` node is checked; the tags and their attributes remain outside the rule's scope.

## When Not To Use It

Disable this rule when your project intentionally keeps CJK characters and Latin words adjacent, preserves repeated spaces in prose, uses a different spacing convention, or delegates this formatting to another tool.

## Related Rules

- [`space-around-inline-element`](./space-around-inline-element.md) enforces spacing around Markdown inline elements.
- [`space-around-number`](./space-around-number.md) enforces the analogous boundary spacing between CJK text and numbers.
