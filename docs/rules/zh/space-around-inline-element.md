# Space Around Inline Elements

统一正文中指定 Markdown 行内元素两侧边界的空格。

## 规则详情

规则检查以下 Markdown 节点类型：`link`、`image`、`inlineCode`、`emphasis` 和 `strong`。当行内元素与普通文本或另一个受检查的行内元素相邻时，两侧边界通常必须且只能有一个空格。

标点会改变边界要求：

- 行内元素前是全角标点、成对标点的开头（`(`、`[`、`{`、`<`、`（`、`【`、`《`、`“`、`‘`）或 `/` 时，不应有空格。
- 行内元素前是半角标点（如 `,` 或 `.`）时，必须有且只有一个空格。
- 行内元素后是成对标点的结尾（如 `)`、`]`、`}`、`>`、`）`、`】`、`》`、`”` 或 `’`）或其他标点时，不应有空格；但破折号类标点除外。
- 行内元素后是破折号、连字符类标点（`-`、`–`、`—`、`−`）不应有空格。

在段落、标题、表格单元格或容器的开头和结尾，不存在需要报告的缺失边界。

## 选项

这条规则没有选项。

## 正确示例

```md
在 [入门指南](/guide/) 中，
执行 `pnpm test` 验证
这是 **strong** 文本
请看 ![示例图片](/img/example.png) 说明
在。[入门指南](/guide/) 中，
在 [入门指南](/guide/)。
执行 `-t`（或 `--testNamePattern`）参数进行过滤。
在（`配置项` 说明）中查看详情。
`toMatchSnapshot()`/`toMatchInlineSnapshot()`/`toMatchFileSnapshot()`
| 项目 | 内容 |
| --- | --- |
| 工作目录 | `/path` `/to/project` |
```

## 错误示例

行内元素与普通文本之间必须用一个空格分隔：

```md
在[入门指南](/guide/)中，
执行`pnpm test`验证
这是**strong**文本
请看![示例图片](/img/example.png)说明
执行`-t`（或 `--testNamePattern`）参数进行过滤。
```

行内元素在句首位置，且在元素之前有全角标点；句号后无需衔接空格：

```md
在。  [入门指南](/guide/) 中，
```

行内元素在句尾位置，且在元素之后有全角标点；逗号前无需衔接空格：

```md
在 [入门指南](/guide/) ，中
```

反斜线与行内元素之间直接相接；`/` 两侧无需空格：

```md
`toMatchSnapshot()` / `toMatchInlineSnapshot()` / `toMatchFileSnapshot()`
```

相邻的多个行内元素会依次检查是否包含空格：

```md
_emphasis_[link](/link)`code`**strong**![alt](/img.png)
```

上诉例子会被修复为：

```md
_emphasis_ [link](/link) `code` **strong** ![alt](/img.png)
```

## 自动修复

这条规则支持自动修复。它只修改报告的行内元素紧邻的空白：将缺失或多余的必需空白改为一个空格，并移除不应存在的空格。元素本身、标点和文本内容不会改变。嵌套的受检查行内元素不会分别报告；对应边界由外层元素负责。

## 不适用场景

如果项目有意采用不同的链接、图片、代码、强调或加粗文本间距约定，或者完全由其他格式化工具负责这些空白，可以关闭 `space-around-inline-element`。

## 相关规则

- [`space-around-number`](./space-around-number.md) 约束中日韩字符与数字之间的空格。
- [`space-around-word`](./space-around-word.md) 约束中日韩字符与英文单词之间的空格。
