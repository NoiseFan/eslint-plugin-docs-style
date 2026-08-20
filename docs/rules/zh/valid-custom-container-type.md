# Valid custom container type

校验 VitePress 自定义容器的类型，避免使用无法获得预期样式或行为的容器。

## 规则详情

自定义容器的起始标记必须使用以下类型之一：`info`、`tip`、`warning`、`danger`、`details`、`raw`、`code-group`、`v-pre`、`tabs`。其中，`tabs` 类型由 [`vitepress-plugin-tabs`](https://github.com/sapphi-red/vitepress-plugins/tree/main/packages/vitepress-plugin-tabs) 提供。

类型严格区分大小写。对于仅大小写不正确的类型，规则会单独报告大小写错误并自动转换为小写；其他未知类型会报告类型错误，但不会自动修改。

该规则的 **正确** 示例：

```md
::: info
这是一条信息。
:::

::: warning 注意
这是一条警告。
:::

::: details 点击查看详情
详细内容。
:::

::: tabs
== 标签页 A
标签页 A 的内容。

== 标签页 B
标签页 B 的内容。
:::
```

该规则的 **错误** 示例：

```md
::: note
未知类型不会被 VitePress 作为内置容器处理。
:::

::: WARNING
类型必须使用小写。
:::
```

围栏代码块中的示例不会被检查。

## 不适用场景

如果项目通过 Markdown 插件注册了其他自定义容器类型，或者没有使用 VitePress 的内置自定义容器，可以关闭这条规则。
