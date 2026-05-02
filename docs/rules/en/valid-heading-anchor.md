# Valid heading anchor

## Rule Details

Ensure headings with CJK text use a strict lowercase anchor in the form `{#lowercase-anchor}`.

## Valid

```md
# Introduction
# 简介 {#intro}
# 中文标题 {#chinese-title}
```

## Invalid

```md
# 中文标题
# 中文标题 {#Chinese-Title}
```

This rule also normalizes loose trailing anchors like `#Grouping Tests` into a strict anchor.

## When Not To Use It

Disable this rule if your docs system does not require explicit heading anchors for CJK headings, or if anchor generation is handled entirely by another tool.
