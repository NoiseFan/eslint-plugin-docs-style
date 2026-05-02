# Space between link

## Rule Details

Keep Markdown links surrounded by clean spacing:

- use one space between text and a link
- do not add spaces between punctuation and a link
- keep punctuation tight to the link when punctuation follows it

## Valid

```md
In the [Getting Started](/guide/) guide,
在。[入门指南](/guide/) 中，
```

## Invalid

```md
In the[Getting Started](/guide/) guide,
在。 [入门指南](/guide/) 中，
```

This rule is autofixable.

## When Not To Use It

Disable this rule if your documentation style intentionally uses different spacing around links, or if another formatter already owns this behavior.
