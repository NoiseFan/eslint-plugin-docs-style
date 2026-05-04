---
title: Getting Started | Guide
next:
  text: Writing Tests
  link: /guide/learn/writing-tests
---

---
title: 使用插件 | 指南
---

# Getting Started

## Overview

# 你的第一个测试 # Your first test

# 你的第一个测试 {#Your first test}

# 中文标题

## 使用 `describe` 编组测试 #Grouping Tests with `describe`

## equal

- **类型:** `<T>(actual: T, expected: T, message?: string) => void`

断言 `actual` 和 `expected` 非严格相等 (==)。

```ts
import { assert, test } from 'vitest'

test('assert.equal', () => {
  assert.equal(Math.sqrt(4), '2')
})
```
<!-- use vue-component to render markdown -->

# Custom Pool <Badge type="danger">advanced</Badge> {#custom-pool}
