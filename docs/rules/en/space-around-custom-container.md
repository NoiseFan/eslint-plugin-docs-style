# Space around custom container

Enforce consistent whitespace around VitePress custom-container opening and closing markers.

## Rule Details

This rule checks VitePress custom-container markers in Markdown:

- Use exactly one space between an opening fence and its container type, such as `::: tip`.
- Do not indent opening or closing markers.
- A closing marker must contain only its fence and must not have trailing spaces.
- Preserve opening-marker titles and attributes while normalizing their leading separator to one space.
- Preserve the fence length; for example, `::::  info` is fixed to `:::: info`.
- Nested containers are checked recursively.

## Options

This rule has no options.

## Valid

Expected opening and closing markers:

```md
::: tip Note
content
:::
```

Similar text inside a code block is not checked:

````md
```md
  ::: tip
  :::
```
````

## Invalid

Opening and closing markers are indented:

```md
  ::: tip Note
content
  :::
```

The separator after the opening fence is missing or contains extra spaces:

```md
:::tip
content
:::
```

```md
:::  tip Note
content
:::
```

The closing marker has trailing spaces:

```md
::: tip
content
:::␠␠
```

Each `␠` in the example represents one space.

Each marker in nested containers is checked independently:

```md
::::  info
 :::  tip
content
 :::
::::
```

## Autofix

This rule is autofixable. The fixer changes only whitespace and indentation in marker lines:

- removes indentation from opening and closing markers;
- normalizes the opening fence/type separator to one space;
- removes trailing spaces from closing markers;
- preserves opening-marker titles, attributes, and fence length.

For example:

```md
  :::  tip Note
content
  :::␠␠
```

Each `␠` in the example represents one space.

is fixed to:

```md
::: tip Note
content
:::
```

When a container is at the beginning or end of a file, this rule still fixes the markers themselves but does not insert outer blank lines because of the file boundary. Use [`padding-around-custom-container`](./padding-around-custom-container.md) for blank lines outside containers.

## Ignored Contexts

Custom-container-looking text inside fenced code blocks is not checked or modified. Other parsed container markers, including nested containers and containers at file boundaries, are checked.

## When Not To Use It

Disable this rule if the project does not use VitePress custom containers or intentionally keeps a different marker-whitespace style. Use [`padding-around-custom-container`](./padding-around-custom-container.md) when the goal is to enforce blank lines outside container blocks.

## Related Rules

- [`padding-around-custom-container`](./padding-around-custom-container.md) enforces blank lines around container blocks.
- [`valid-custom-container-type`](./valid-custom-container-type.md) validates the type used by an opening marker.
