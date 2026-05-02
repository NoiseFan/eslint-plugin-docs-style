# Valid heading anchor

## 规则详情

确保包含 CJK 文本的标题使用严格的小写锚点，格式为 `{#lowercase-anchor}`。

## 正确示例

```md
# Introduction
# 简介 {#intro}
# 中文标题 {#chinese-title}
```

## 错误示例

```md
# 中文标题
# 中文标题 {#Chinese-Title}
```

该规则也会把末尾松散的锚点（例如 `#Grouping Tests`）自动修正为标准锚点。

## 不适用场景

如果你的文档系统并不要求为包含 CJK 的标题显式声明锚点，或者锚点完全由其他工具统一生成，可以关闭这条规则。
