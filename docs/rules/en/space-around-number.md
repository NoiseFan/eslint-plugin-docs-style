# Space Around Number

Keep spacing between CJK characters and numbers consistent.

This rule focuses on number-boundary spacing in mixed CJK and technical writing. It prevents CJK characters and numbers from being written directly next to each other, and also removes extra spaces around them.

## Rule Details

By default, this rule requires:

- Exactly one space between a CJK character and an adjacent number
- Multiple consecutive spaces around numbers to be automatically collapsed into one space
- No extra spacing requirement when a number is adjacent to punctuation
- Mixed English-and-number spacing is outside the scope of this rule and must be handled separately

Examples of **correct** code for this rule:

```md
支持 123 个规则
提升 4.0% 效率
版本：2.0，现已发布。
```

Examples of **incorrect** code for this rule:

```md
支持123 个规则
支持 123个规则
支持123个规则
提升4.0%效率
支持  123 个规则
支持 123  个规则
支持  123  个规则
```

This rule is autofixable.

## When Not To Use It

If your project does not want to enforce spacing between CJK characters and numbers, or if this is already handled entirely by another formatter, you can turn this rule off.
