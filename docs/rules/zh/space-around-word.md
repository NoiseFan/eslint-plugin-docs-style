# Space Around Word

保持 CJK 字符与英文单词之间的空格风格一致。

这条规则主要用于处理中英文混排时的词边界空格问题，避免出现中文英文紧贴在一起的写法，同时会中英文之间多余空格。

## 规则详情

默认情况下，这条规则要求：

- CJK 字符与相邻的英文单词之间保留一个空格
- 如果已有多个连续空格，会自动压缩为一个空格

该规则的 **正确** 示例：

```md
在 watch 模式下
目前 Vitest 还不支持范围：
我们感谢 Jest 团队和社区创建了一个令人愉悦的测试 API
从 Vitest4.1 起
自 Vitest4.1 起
WebStorm、PhpStorm、IntelliJ IDEA Ultimate 和其他 JetBrains IDE 内置了对 Vitest 的支持。
A mock that always returns `undefined` isn't very useful on its own.
```

该规则的 **错误** 示例：

```md
在watch 模式下
在 watch模式下
在watch模式下
在  watch 模式下
在 watch  模式下
从Vitest4.1 起
从Vitest4.1起
自 Vitest4.1  起
```

该规则支持自动修复。

## 不适用场景

如果你的项目不希望统一中英文混排时的词边界空格，或者这类问题已经完全交给其他格式化工具处理，可以关闭这条规则。
