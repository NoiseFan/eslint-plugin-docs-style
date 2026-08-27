# Padding around custom container

Require consistent blank-line padding outside VitePress custom containers and remove blank lines directly inside their boundaries.

## Rule Details

For every closed custom container, this rule enforces the following boundaries:

- When same-level content appears before or after a container, exactly one blank line must separate that content from the container marker.
- No blank line is allowed immediately after an opening marker or immediately before its matching closing marker. The line break required by the Markdown syntax is retained.
- A container at the beginning or end of a file does not require outer padding at that file boundary.

Nested containers are checked recursively. An inner container is separated from surrounding content in its parent by one blank line. When an inner marker is directly adjacent to its parent's opening or closing marker, no blank line is inserted because that position is also an inner boundary of the parent container.

## Options

This rule has no options.

## Valid

A container may occupy the whole file, including an empty container:

```md
::: info
content
:::
```

```md
::: info
:::
```

Sibling content and containers have exactly one blank line between them:

```md
Before

::: info
content
:::

After
```

Nested containers follow the same boundary rules:

```md
::: info
Outer

::: tip
Inner
:::

After
:::
```

## Invalid

Missing outer padding:

```md
Before
::: info
content
:::
After
```

Extra inner and outer blank lines:

```md
Before


::: info

content

:::


After
```

Extra blank lines at nested boundaries:

```md
::: info
Outer


::: tip

Inner

:::


Outer
:::
```

## Autofix

This rule is autofixable. The fixer inserts a missing blank line outside a container, compresses extra outer blank lines to one, and removes blank lines immediately inside opening and closing markers. It preserves the document's LF or CRLF line endings.

For example, the second invalid example is fixed to:

```md
Before

::: info
content
:::

After
```

The nested invalid example is fixed to:

```md
::: info
Outer

::: tip
Inner
:::

Outer
:::
```

## Ignored Contexts

Custom-container-looking text inside code blocks is not checked or modified:

````md
```md
::: info

content

:::
```
````

An opening marker without a matching closing marker is also ignored:

```md
Before
::: info
content
```

## When Not To Use It

Disable this rule if the project does not use VitePress custom containers, intentionally uses different padding, or delegates container formatting to another tool.

## Related Rules

- [`space-around-custom-container`](./space-around-custom-container.md) enforces spacing around container opening and closing markers.
- [`valid-custom-container-type`](./valid-custom-container-type.md) validates the type used by an opening marker.
