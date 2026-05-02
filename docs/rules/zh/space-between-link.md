# Space between link

## 规则详情

保持 Markdown 链接周围的空格风格一致：

- 文本和链接之间保留一个空格
- 标点和链接之间不要额外加空格
- 链接后接标点时，链接和标点保持紧贴

## 正确示例

```md
In the [Getting Started](/guide/) guide,
在。[入门指南](/guide/) 中，
```

## 错误示例

```md
In the[Getting Started](/guide/) guide,
在。 [入门指南](/guide/) 中，
```

该规则支持自动修复。

## 不适用场景

如果你的文档规范对链接前后空格有不同约定，或者这部分格式已经完全交给其他格式化工具处理，可以关闭这条规则。
