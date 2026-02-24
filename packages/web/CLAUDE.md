# Observations Web

This is the runnable Nuxt 4 app for Observations. It extends two shared layers (`@1001-digital/layers.base` and `@1001-digital/layers.evm`) and auto-imports components/composables from the `@1001-digital/observations-ui` package.

This package owns pages, routing (`router.options.ts`), `app.vue`, plugins, and app config. UI components and composables live in the `ui` package — do not duplicate them here.
