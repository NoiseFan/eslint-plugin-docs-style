# Padding around custom container

规范 VitePress 自定义容器外侧的空行，并删除紧邻容器内侧边界的空行。

## 规则详情

对于每个已闭合的自定义容器，本规则要求：

- 当容器前后存在同一层级的内容时，内容与容器标记之间必须且只能有一个空行。
- 起始标记之后以及对应的结束标记之前不能有空行，但会保留 Markdown 语法所需的换行符。
- 容器位于文件开头或结尾时，不要求在相应的文件边界添加外侧空行。

嵌套容器会被递归检查。内层容器与父容器中的前后内容之间保留一个空行。当内层容器标记直接与父容器的起始或结束标记相邻时，不会插入空行，因为该位置同时也是父容器的内侧边界。

## 选项

此规则没有选项。

## 正确示例

容器可以占据整个文件，空容器也同样有效：

```md
::: info
content
:::
```

```md
::: info
:::
```

同一层级的内容与容器之间恰好保留一个空行：

```md
Before

::: info
content
:::

After
```

嵌套容器遵循相同的边界规则：

```md
::: info
Outer

::: tip
Inner
:::

After
:::
```

## 错误示例

缺少容器外侧空行：

```md
Before
::: info
content
:::
After
```

容器内侧和外侧存在多余空行：

```md
Before


::: info

content

:::


After
```

嵌套容器边界存在多余空行：

```md
::: info
Outer


::: tip

Inner

:::


Outer
:::
```

## 自动修复

此规则支持自动修复。修复器会在容器外侧补充缺少的空行，将多余的外侧空行压缩为一个，并删除紧邻起始和结束标记内侧的空行。修复时会保留文档原有的 LF 或 CRLF 换行格式。

例如，第二个错误示例会被修复为：

```md
Before

::: info
content
:::

After
```

嵌套容器的错误示例会被修复为：

```md
::: info
Outer

::: tip
Inner
:::

Outer
:::
```

## 忽略的上下文

代码块中类似自定义容器的文本不会被检查或修改：

````md
```md
::: info

content

:::
```
````

没有对应结束标记的起始标记也会被忽略：

```md
Before
::: info
content
```

## 不适用场景

如果项目不使用 VitePress 自定义容器、有意采用不同的空行格式，或已由其他工具统一格式化容器，可以关闭此规则。

## 相关规则

- [`space-around-custom-container`](./space-around-custom-container.md) 用于规范容器起始和结束标记周围的空格。
- [`valid-custom-container-type`](./valid-custom-container-type.md) 用于校验起始标记中的容器类型。
