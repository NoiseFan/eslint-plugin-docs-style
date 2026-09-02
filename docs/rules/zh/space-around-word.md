# Space Around Word

要求 CJK 文本与拉丁单词相邻时，边界处恰好保留一个空格。

## 规则详情

`space-around-word` 检查 Markdown 的文本节点。当拉丁单词直接与 CJK 字符相邻时，两者之间必须有一个普通空格。

规则会检查汉字、平假名、片假名和谚文等 CJK 字符，以及由 Unicode 拉丁字母组成的单词。数字、标点、符号、emoji 和其他文字的字母不属于本规则中的拉丁单词。

此外，只要被检查的文本节点中出现两个或更多连续空格，规则都会将其压缩为一个普通空格，不论这些空格是否位于 CJK 与拉丁单词之间。

## 选项

此规则没有选项。

## 正确示例

CJK 文本与拉丁文本相邻时使用一个空格：

```md
在 watch 模式下，编辑 setup 文件会触发所有测试重新运行。
[setup 文件](/config/setupfiles)
## Shell 自动补全 {#shell-autocompletions}
<Box>使用 Babel 进行预插桩</Box>
```

句首或句末的标点不会形成 CJK-拉丁边界，因此本规则不会要求在那里额外添加空格。已有的一个空格会保留；连续多个空格仍会按上文所述压缩为一个：

```md
（Vitest）已发布。
Vitest：一个快速的测试工具
目前，Vitest 还不支持范围：
我们感谢 Jest 团队和社区创建了一个令人愉悦的测试 API，并引入了许多已成为 Web 生态系统标准的测试模式。
```

不包含 CJK-拉丁边界的文本也属于正确写法：

```md
A mock that always returns `undefined` isn't very useful on its own.
```

## 错误示例

拉丁单词前缺少空格：

```md
在watch 模式下
```

拉丁单词后缺少空格：

```md
在 watch模式下
```

拉丁单词两侧都缺少空格：

```md
在watch模式下
```

被检查文本节点中包含多个连续空格：

```md
在  watch 模式下
在 watch  模式下
在  watch   模式下
```

链接标签、标题和 HTML 标签之间的文本同样需要遵守这一边界要求：

```md
[setup文件](/config/setupfiles)
## Shell自动补全 {#shell-autocompletions}
<Box>使用Babel进行预插桩</Box>
```

## 自动修复

此规则支持自动修复。修复器会在缺失的 CJK-拉丁边界插入空格，并将受影响文本节点中的连续多个空格替换为一个普通空格。它只改变文本节点中的空白，不会修改周围的 Markdown 语法。

例如，下面的输入：

```md
在watch模式下
```

会被修复为：

```md
在 watch 模式下
```

链接标签也会进行同样的修复，但链接目标会保留不变：

```md
[setup文件](/config/setupfiles)
```

会被修复为：

```md
[setup 文件](/config/setupfiles)
```

## 忽略的上下文

规则只为 Markdown 的 `text` 节点注册访问器，与父级结构无关：段落文本、标题文本、链接标签和 HTML 标签之间的文本只要被解析为 `text` 节点，就会被检查。

围栏代码块（`code`）会被忽略：

````md
```text
在watch模式下
```
````

行内代码（`inlineCode`）会被忽略：

```md
`在watch模式下`
```

HTML 注释和标签（`html`）会被忽略：

```md
<!-- 在watch模式下 -->
```

YAML frontmatter（`yaml`）会被忽略：

```md
---
title: 在watch模式下
---
```

在 HTML 元素中，只有解析器单独分出的 `text` 节点内容会被检查，标签及其属性不在本规则的检查范围内。

## 不适用场景

如果项目有意让 CJK 字符与拉丁单词直接相连、需要保留正文中的连续空格、采用其他空格约定，或已经交由其他工具统一格式化，可以关闭此规则。

## 相关规则

- [`space-around-inline-element`](./space-around-inline-element.md) 用于规范 Markdown 行内元素周围的空格。
- [`space-around-number`](./space-around-number.md) 用于规范 CJK 文本与数字之间的类似边界空格。
