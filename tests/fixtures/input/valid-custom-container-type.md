# Custom containers

::: info
Information.
:::

::: WARNING Be careful
Warning content.
:::

::: DANGER
danger content.
:::

::: tip
[Getting Started](/guide/)
:::

::: details Click me {open}
Content
:::

<!-- nested containers -->

:::: info Outer container
This box contains another container.

::: details Inner container
```js
console.log('Hello, VitePress!')
```
:::
::::

::: info
Information.

::: DANGER
danger content.
:::

:::

::: info
Information.

::: DANGER
danger content.
:::
Information.
:::

<!-- additional attributes -->

::: details Click me to toggle the code {open}
```js
console.log('Hello, VitePress!')
```
:::

<!-- unsupport type -->

::: note
Unsupported container.
:::

::: NOTE
This is an example, not a container.
:::

<!-- boundary situation -->

::: info
content:::

top content :::info
content
:::
bottom content
