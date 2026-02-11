# Observations UI

This is a Nuxt 4 application that extends two shared layers:

- `@1001-digital/layers.base` — base components, composables, and styles
- `@1001-digital/layers.evm` — EVM/wallet components and composables

## Key rule

All components and styles used in this app should come from `layers.base` and `layers.evm`. Prefer reusing what the layers provide over adding local alternatives.
