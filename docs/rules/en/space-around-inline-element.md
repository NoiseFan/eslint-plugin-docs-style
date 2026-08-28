# Space Around Inline Elements

Keep spacing around the boundaries of selected Markdown inline elements in prose consistent.

## Rule Details

This rule checks the following Markdown node types: `link`, `image`, `inlineCode`, `emphasis`, and `strong`. When an inline element is adjacent to ordinary text or another selected inline element, both boundaries normally must contain exactly one space.

Punctuation changes the boundary requirements:

- Before an inline element, fullwidth punctuation, an opening paired mark (`(`, `[`, `{`, `<`, `（`, `【`, `《`, `“`, `‘`), or `/` must not have a space.
- Before an inline element, halfwidth punctuation (such as `,` or `.`) must have exactly one space.
- After an inline element, a closing paired mark (such as `)`, `]`, `}`, `>`, `）`, `】`, `》`, `”`, or `’`) or other punctuation must not have a space, except for dash- or hyphen-like punctuation.
- After an inline element, dash- or hyphen-like punctuation (`-`, `–`, `—`, `−`) must not have a space.

At the beginning or end of a paragraph, heading, table cell, or container, there is no missing boundary to report.

## Options

This rule has no options.

## Valid

```md
See the [Getting Started](/guide/) guide.
Run `pnpm test` to verify.
This is **strong** text.
See ![Example image](/img/example.png) for details.
See, [Getting Started](/guide/) guide.
See [Getting Started](/guide/).
Use `-t` (or `--testNamePattern`) to filter.
See details in (`option` notes).
`toMatchSnapshot()`/`toMatchInlineSnapshot()`/`toMatchFileSnapshot()`
| Item | Value |
| --- | --- |
| Working directory | `/path` `/to/project` |
```

## Invalid

An inline element must be separated from surrounding text by one space:

```md
See[Getting Started](/guide/)guide.
Run`pnpm test`to verify.
This is**strong**text
See![Example image](/img/example.png)for details.
Use`-t` (or `--testNamePattern`) to filter.
```

When an inline element is at the beginning of a sentence and preceded by punctuation, no extra space should follow the period:

```md
See.  [Getting Started](/guide/) guide.
```

When an inline element is at the end of a sentence and followed by punctuation, no space should precede the comma:

```md
See [Getting Started](/guide/) , guide
```

Slash punctuation must touch adjacent inline elements; spaces around `/` are invalid:

```md
`toMatchSnapshot()` / `toMatchInlineSnapshot()` / `toMatchFileSnapshot()`
```

Adjacent inline elements are checked in sequence for spacing:

```md
_emphasis_[link](/link)`code`**strong**![alt](/img.png)
```

The above example is fixed to:

```md
_emphasis_ [link](/link) `code` **strong** ![alt](/img.png)
```

## Autofix

This rule is autofixable. It changes only the whitespace immediately before or after the reported inline element: missing or extra required whitespace becomes one space, and unexpected whitespace is removed. The element itself, punctuation, and text content are not changed. Nested selected inline elements are not reported separately; the corresponding boundary is handled by the outer element.

## When Not To Use It

If the project intentionally uses a different spacing convention around links, images, code, emphasis, or strong text, or if another formatter completely owns this whitespace, you can turn off `space-around-inline-element`.

## Related Rules

- [`space-around-number`](./space-around-number.md) enforces spacing between CJK characters and numbers.
- [`space-around-word`](./space-around-word.md) enforces spacing between CJK characters and English words.
