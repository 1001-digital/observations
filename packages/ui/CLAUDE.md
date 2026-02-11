# Observations UI

This is a Nuxt 4 layer that provides UI components, composables, and styles for the Observations app. It extends two shared layers:

- `@1001-digital/layers.base` — base components, composables, and styles
- `@1001-digital/layers.evm` — EVM/wallet components and composables

This package is not a runnable app — it is extended by `@1001-digital/observations-web`.

## Key rule

All components and styles used in this layer should come from `layers.base` and `layers.evm`. Prefer reusing what the layers provide over adding local alternatives.
