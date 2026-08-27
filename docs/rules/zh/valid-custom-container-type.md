# Valid custom container type

要求 VitePress 自定义容器使用受支持的小写类型。

## 规则详情

此规则检查每个已解析的自定义容器起始标记中的类型。标记必须独占一行（前面最多允许三个空格），使用至少三个冒号，并在空白符后包含类型。支持的类型如下：

- `info`
- `tip`
- `warning`
- `danger`
- `details`
- `raw`
- `code-group`
- `v-pre`
- `tabs`

其中，`tabs` 类型由 [`vitepress-plugin-tabs`](https://github.com/sapphi-red/vitepress-plugins/tree/main/packages/vitepress-plugin-tabs) 提供。标题和属性（例如 `::: details Click me {open}`）不会改变被检查的类型。嵌套的自定义容器也会递归检查。

完全匹配且为小写的受支持类型才是有效类型。仅大小写不同的受支持类型会报告大小写错误，并可自动转换为小写。不在列表中的类型会报告不受支持的类型，并保持原样。

## 选项

此规则没有选项。

## 正确示例

```md
::: info
这是一条信息。
:::

::: warning 请注意
这是警告内容。
:::

::: details 点击查看 {open}
详细内容。
:::

::: tabs
== 标签页 A
标签页 A 的内容。

== 标签页 B
标签页 B 的内容。
:::

:::: info 外层容器
::: tip
嵌套内容。
:::
::::
```

九个受支持的值都有效，包括 `raw`、`code-group`、`v-pre` 和 `tabs`。

## 错误示例

不受支持的类型：

```md
::: note
不受支持的容器。
:::
```

受支持但大小写错误的类型：

```md
::: WARNING 请注意
这是警告内容。
:::
```

嵌套容器同样会检查：

```md
:::: info
::: TIP
嵌套内容。
:::
::::
```

## 自动修复

只有将报告的类型转换为小写后会变成受支持类型时，此规则才会自动修复。例如，`WARNING` 会替换为 `warning`；未知类型 `note` 只报告错误，不提供修复。修复器只修改类型文本，标记、标题、属性和容器内容都会保留。

## 忽略的上下文

规则只检查已解析的自定义容器起始标记。代码块、行内代码、HTML、frontmatter、注释或普通段落中的容器样式文本不会被识别为起始标记，因此会被忽略。例如，`top content :::info` 会保持不变。结束标记不包含类型，永远不会被报告。

## 不适用场景

如果 Markdown 插件有意注册了列表之外的自定义容器类型，或者项目不使用 VitePress 自定义容器，请禁用此规则。

## 相关规则

- [`space-around-custom-container`](./space-around-custom-container.md) 用于规范容器起始和结束标记周围的空格。
- [`padding-around-custom-container`](./padding-around-custom-container.md) 用于规范容器块周围的空行。
