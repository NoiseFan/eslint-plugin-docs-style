# Space Around Inline Elements

Keep spacing around selected Markdown inline elements in prose consistent.

## Rule Details

This rule checks the following Markdown node types: `link`, `image`, `inlineCode`, `emphasis`, and `strong`. When an inline element is adjacent to ordinary text or another selected inline element, the boundary normally must contain exactly one space.

Punctuation changes the boundary requirements:

- Before an inline element, fullwidth punctuation, an opening paired mark (`(`, `[`, `{`, `<`, `（`, `【`, `《`, `“`, `‘`), or `/` must not have a space.
- Before an inline element, halfwidth punctuation (such as `,` or `.`) must have exactly one space.
- After an inline element, a closing paired mark (such as `)`, `]`, `}`, or `）`) or other punctuation must not have a space, except for dash-like punctuation.
- After an inline element, dash-like punctuation (`-`, `–`, `—`, `−`) or a halfwidth opening parenthesis must have exactly one space.

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

After a halfwidth punctuation mark, the inline element still needs exactly one space:

```md
See.  [Getting Started](/guide/) guide.
```

An inline element must touch a closing punctuation mark; the extra space before `.` is invalid:

```md
See [Getting Started](/guide/) . guide
```

Slash punctuation must touch adjacent inline elements; spaces around `/` are invalid:

```md
`toMatchSnapshot()` / `toMatchInlineSnapshot()` / `toMatchFileSnapshot()`
```

Adjacent selected inline elements are checked as one sequence:

```md
_emphasis_[link](/link)`code`**strong**![alt](/img.png)
```

This is fixed to:

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
