# Space around custom container

Enforce spacing around VitePress custom-container opening and closing markers.

## Rule Details

- Use exactly one space between an opening fence and its container type, such as `::: tip`.
- Do not indent opening or closing markers.
- Do not leave trailing spaces on closing markers.
- Titles and attributes are preserved, while their separator is normalized to one space.

Fenced code blocks are ignored.

## Options

This rule has no options.

## Related Rules

- [`padding-around-custom-container`](./padding-around-custom-container.md) enforces blank lines around container blocks.
- [`valid-custom-container-type`](./valid-custom-container-type.md) validates container types.
