# Space around custom container

规范 VitePress 自定义容器起始/结束标记周围的空格。

## 规则详情

- 起始标记的围栏与容器类型之间必须使用一个空格，例如 `::: tip`。
- 起始和结束标记不能有行首缩进。
- 结束标记不能有尾随空格。
- 标题和属性会保留，但其前缀空格会统一为一个。

```md
::: tip 提示
内容
:::
```

以下写法会被自动修复：

```md
  :::  tip 提示
内容
  :::
```

修复为：

```md
::: tip 提示
内容
:::
```

代码块中的类似文本不会被修改。

## 选项

此规则没有选项。

## 相关规则

- [`padding-around-custom-container`](./padding-around-custom-container.md) 用于规范容器块周围的空行。
- [`valid-custom-container-type`](./valid-custom-container-type.md) 用于校验容器类型。
