# Padding around custom container

Require consistent blank-line padding between VitePress custom containers and surrounding content, as well as at the boundaries between containers and their contents.

## Rule details

### Regular containers

When a custom container has content at the same level before or after it, exactly one blank line is required between the container markers and the surrounding content:

- Keep one blank line before the container's opening marker.
- Keep one blank line after the container's closing marker.
- Compress consecutive extra blank lines to one blank line.
- Containers at the beginning or end of a file do not require padding before or after them.

Blank lines are not allowed directly inside a container boundary. The line after the opening marker and the line before the closing marker must be content or another container marker; any blank lines there are removed.

Examples of **correct** code for this rule:

```md
::: info
Content one
:::

::: tip
Content two
:::
```

Examples of **incorrect** code for this rule:

```md

::: info

Content

:::


Other content
```

In the example above, blank lines inside the container are removed, and extra blank lines outside the container are compressed to one blank line.

### Nested containers

Nested containers are processed independently according to the same rules. No blank line is kept between adjacent outer and inner opening markers, or between adjacent inner and outer closing markers, in order to prioritize the requirement that the inside of a container boundary must not be blank:

- Keep one blank line before an inner container's opening marker.
- Keep one blank line after an inner container's closing marker when there is more outer content.
- The line after an inner container's opening marker and the line before its closing marker must not be blank.
- No blank line is allowed between an outer container's closing marker and its last piece of content.

Examples of **correct** code for this rule:

```md
::: info
This is an info box.

::: tip
This is a tip box.
:::
:::
```

```md
::: info
This is an info box.

::: tip
This is a tip box.
:::

This is an info box.
:::
```

Examples of **incorrect** code for this rule:

```md
::: info
This is an info box.


::: tip

This is a tip box.

:::

:::
```

```md
::: info
This is an info box.


::: tip

This is a tip box.

:::


This is an info box.

:::
```

After fixing, consecutive blank lines before and after the inner container are each compressed to one. Blank lines at the inner container boundaries and before the outer closing marker are removed.

This rule supports autofix.

Custom-container-looking text inside fenced code blocks is not checked or modified.

## When not to use it

Disable this rule if the project does not use VitePress custom containers or does not want to enforce consistent blank lines between containers and surrounding content.
