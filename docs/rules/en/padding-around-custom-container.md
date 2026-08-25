# Padding around custom containers

Require consistent blank-line padding around VitePress custom containers.

## Rule details

When a container has content at the same level before or after it, exactly one blank line is required between that content and the container markers. Extra blank lines are compressed. Containers at the beginning or end of a file do not receive padding automatically.

Blank lines directly inside a container boundary are not allowed. The opening marker must be followed immediately by content or a nested container, and the closing marker must be preceded immediately by content or a nested container.

The rule applies recursively to nested containers and supports autofix. Custom-container-looking text inside fenced code blocks is ignored.

## When not to use it

Disable this rule if the project does not use VitePress custom containers or intentionally uses a different blank-line style.
