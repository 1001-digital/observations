import type { RouterConfig } from '@nuxt/schema'

export default {
  routes: (_routes) => {
    const { contract, token } = useArtifactScope()

    if (contract && token) {
      return _routes.map(route => ({
        ...route,
        path: route.path === '/:contract()/:token()'
          ? '/'
          : route.path.replace('/:contract()/:token()/', '/'),
      }))
    }

    return _routes
  },
} satisfies RouterConfig
