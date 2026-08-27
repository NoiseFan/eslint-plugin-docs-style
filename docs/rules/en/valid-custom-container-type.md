# Valid custom container type

Require VitePress custom containers to use a supported, lowercase type.

## Rule Details

This rule checks the type in each parsed custom-container opening marker. A marker must start on its own line (optionally indented by up to three spaces), use at least three colons, and contain a type after whitespace. The supported types are:

- `info`
- `tip`
- `warning`
- `danger`
- `details`
- `raw`
- `code-group`
- `v-pre`
- `tabs`

The `tabs` type is provided by [`vitepress-plugin-tabs`](https://github.com/sapphi-red/vitepress-plugins/tree/main/packages/vitepress-plugin-tabs). Titles and attributes, such as `::: details Click me {open}`, do not change the type being checked. Nested custom containers are checked recursively.

An exactly supported lowercase type is valid. A supported type written with different casing is reported as a case error and can be normalized to lowercase. A type that is not in the list is reported as an unsupported type and is left unchanged.

## Options

This rule has no options.

## Valid

```md
::: info
Information.
:::

::: warning Be careful
Warning content.
:::

::: details Click me {open}
Content.
:::

::: tabs
== Tab A
Content for Tab A.

== Tab B
Content for Tab B.
:::

:::: info Outer container
::: tip
Inner content.
:::
::::
```

All nine supported values are valid, including `raw`, `code-group`, `v-pre`, and `tabs`.

## Invalid

Unsupported type:

```md
::: note
Unsupported container.
:::
```

Supported type with invalid casing:

```md
::: WARNING Be careful
Warning content.
:::
```

The same check applies to nested containers:

```md
:::: info
::: TIP
Nested content.
:::
::::
```

## Autofix

This rule is autofixable only when the reported type becomes a supported type after converting it to lowercase. For example, `WARNING` is replaced with `warning`, while an unknown type such as `note` is reported without a fix. The fixer changes only the type text; markers, titles, attributes, and container content are preserved.

## Ignored Contexts

Only parsed custom-container opening markers are checked. Container-looking text in fenced code blocks, inline code, HTML, frontmatter, comments, or ordinary paragraph text is not an opening marker for this rule and is ignored. A line such as `top content :::info` is therefore left untouched. Closing markers are not type-bearing and are never reported.

## When Not To Use It

Disable this rule when a Markdown plugin intentionally registers custom container types outside this list, or when the project does not use VitePress custom containers.


## Related Rules

- [`space-around-custom-container`](./space-around-custom-container.md) enforces spacing around container opening and closing markers.
- [`padding-around-custom-container`](./padding-around-custom-container.md) enforces blank lines around container blocks.
