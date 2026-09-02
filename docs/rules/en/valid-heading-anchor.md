# Valid Heading Anchor

Require explicit, stable anchors for Markdown headings that contain non-English letters.

## Rule Details

This rule checks Markdown heading nodes whose source contains at least one Unicode `Han` character (the non-English letters currently recognized by the implementation). Such headings must include a strict anchor separated from the heading text by whitespace, in the form `{#lowercase-anchor}`.

A strict anchor may contain lowercase ASCII letters and digits. Words must be separated by a single hyphen; uppercase letters, underscores, repeated hyphens, leading or trailing hyphens, and non-ASCII characters are not valid.

Headings without Unicode `Han` characters do not require an explicit anchor.

## Options

This rule has no options.

## Valid

The heading contains only English letters, so an explicit anchor is not required:

```md
# Introduction
```

The anchor uses lowercase ASCII letters and is separated from the heading text by a space:

```md
# 简介 {#intro}
```

The anchor consists of lowercase ASCII letters and follows the `{#lowercase-anchor}` format:

```md
# 中文标题 {#chinese-title}
```

The anchor may contain digits and uses a single hyphen between words:

```md
# 标题 {#section-2}
```

## Invalid

The heading contains non-English letters but has no trailing anchor:

```md
# 中文标题
# 你的第一个测试 Your First Test
```

The anchor contains uppercase letters, which must be lowercase:

```md
# 中文标题 {#Chinese-Title}
```

The anchor contains repeated hyphens; words must be separated by exactly one hyphen:

```md
# 中文标题 {#chinese--title}
```

The anchor contains non-ASCII characters; anchor content must use lowercase ASCII letters and digits:

```md
# 中文标题 {#中文标题}
```

## Autofix

This rule is autofixable only when the end of a heading contains an anchor-like fragment that can be normalized. The fixer lowercases ASCII letters, converts whitespace and periods to hyphens, removes other unsupported characters, trims leading and trailing hyphens, and rewrites the fragment as a braced anchor.

Loose trailing anchor text is converted to a standard braced anchor:

Before:

```md
# Vitest 3.2 发布了！ # Vitest 3.2 is out!
```

After:

```md
# Vitest 3.2 发布了！ {#vitest-3-2-is-out}
```

When the trailing text contains inline code, the fixer removes the code markers while normalizing the anchor text:

Before:

```md
## 使用 `describe` 编组测试 #Grouping Tests with `describe`
```

After:

```md
## 使用 `describe` 编组测试 {#grouping-tests-with-describe}
```

An existing anchor with uppercase letters is converted to lowercase:

Before:

```md
# 中文标题 {#Chinese-Title}
```

After:

```md
# 中文标题 {#chinese-title}
```

A heading with no trailing anchor-like fragment is reported but not fixed because the rule does not generate an anchor from the heading text itself.

The fixer currently preserves underscores even though strict validation rejects them. An anchor-like fragment containing an underscore may therefore still be reported after autofix.

## Ignored Contexts

The rule skips YAML frontmatter and headings that contain no Unicode `Han` characters. It only visits Markdown heading nodes, so heading-like text outside a heading is not checked.

## When Not To Use It

Disable this rule when the documentation system generates anchors automatically, does not require explicit anchors for headings containing non-English letters, or accepts an anchor syntax that differs from this rule's strict format.
