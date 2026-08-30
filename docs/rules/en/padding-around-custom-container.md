# Padding around custom container

Require consistent blank-line padding around VitePress custom containers, using loose mode by default.

## Rule Details

For every closed custom container, this rule enforces the following boundaries:

- When same-level content appears before or after a container, exactly one blank line must separate that content from the container marker.
- Loose mode (the default) requires exactly one blank line immediately after an opening marker and before its matching closing marker.
- A container at the beginning or end of a file does not require outer padding at that file boundary.

Nested containers are checked recursively. In loose mode, an inner container is separated from surrounding content in its parent by one blank line; compact mode removes that inner padding. File-boundary rules still apply when a nested marker is directly adjacent to a parent marker.

## Options

This rule accepts one string option: `"loose"` (the default) requires exactly one blank line inside container boundaries; `"compact"` disallows inner blank lines. Both modes require exactly one blank line between a container marker and same-level surrounding content.

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

Inner blank lines in compact mode (`"compact"`):

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

This rule is autofixable. The fixer normalizes inner blank lines according to the selected mode and inserts or compresses outer padding to one blank line. It preserves the document's LF or CRLF line endings.

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
