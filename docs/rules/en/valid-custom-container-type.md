# Valid custom container type

Validate the types of VitePress custom containers to avoid containers that do not receive the expected styles or behavior.

## Rule Details

The opening marker of a custom container must use one of the following types: `info`, `tip`, `warning`, `danger`, `details`, `raw`, `code-group`, `v-pre`, or `tabs`. The `tabs` type is provided by [`vitepress-plugin-tabs`](https://github.com/sapphi-red/vitepress-plugins/tree/main/packages/vitepress-plugin-tabs).

Types are case-sensitive. When a type differs only in letter case, the rule reports a case error separately and automatically converts it to lowercase. Other unknown types are reported as type errors but are not automatically modified.

## Valid

```md
::: info
This is an informational message.
:::

::: warning Note
This is a warning.
:::

::: details Click to view details
Detailed content.
:::

::: tabs
== Tab A
Content for Tab A.

== Tab B
Content for Tab B.
:::
```

## Invalid

```md
::: note
VitePress does not treat this unknown type as a built-in container.
:::

::: WARNING
The type must be lowercase.
:::
```

Examples inside fenced code blocks are not checked.

## When Not To Use It

Disable this rule if your project registers other custom container types through a Markdown plugin, or if you are not using VitePress's built-in custom containers.

## Related Rules

- [`space-around-custom-container`](./space-around-custom-container.md) enforces spacing around container opening and closing markers.
- [`padding-around-custom-container`](./padding-around-custom-container.md) enforces blank lines around container blocks.
