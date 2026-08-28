# Space Around Number

Require exactly one space at a boundary between CJK text and a number.

## Rule Details

The `space-around-number` rule checks Markdown text nodes. When a number is directly next to a CJK character, the boundary must contain one ordinary space. Existing runs of two or more spaces at that boundary are also normalized to one space.

The rule recognizes Unicode number characters. A decimal point (`.`) or percent sign (`%`) immediately following a number remains part of the number for this check, so values such as `4.0%` are handled as one number.

The rule does not require spaces when a number touches Latin text, punctuation, symbols, or a dash. For example, `Vite8`, `2.0，`, and `4–6` are outside this rule's CJK-number boundary.

## Options

This rule has no options.

## Valid

```md
支持 123 个规则
提升 4.0% 效率
版本：2.0，现已发布。
计数从 1 开始。
第 4–6 阶段针对每个测试文件各执行一次，
_2025 年 10 月 22 日_
```

Numbers next to Latin text or punctuation are valid without an added space:

```md
Vite8Support
Since4.1.0,
Phases 4–6run once for each test file,
0.2+ 0.1 is 0.30000
```

## Invalid

Missing space before a number:

```md
支持123 个规则
```

Missing space after a number:

```md
支持 123个规则
```

Missing spaces on both sides, including a decimal percent value:

```md
支持123个规则
提升4.0%效率
```

More than one space at a CJK-number boundary:

```md
支持  123 个规则
支持 123  个规则
支持  123  个规则
```

## Autofix

This rule is autofixable. The fixer inserts a missing boundary space and collapses any repeated boundary spaces to exactly one space. It only rewrites whitespace in the affected text node; it does not add spaces around numbers next to Latin text or punctuation.

## Ignored Contexts

Only Markdown `text` nodes are checked. Number-like text in the following nodes is left unchanged:

````md
```text
支持123个规则
```

`支持123个规则`

<!-- 支持123个规则 -->
````

Fenced code blocks, inline code, HTML (including comments), and YAML frontmatter are therefore ignored. Text inside regular Markdown constructs such as paragraphs, headings, emphasis, and links is checked when it is represented as a text node.

## When Not To Use It

Disable this rule when your project intentionally keeps CJK characters and numbers adjacent, uses a different spacing convention, or delegates this formatting to another tool.

## Related Rules

- [`space-around-word`](./space-around-word.md) enforces the analogous boundary spacing between CJK text and Latin words.
