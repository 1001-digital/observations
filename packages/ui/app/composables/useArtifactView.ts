export const useArtifactView = (
  animationUrl: Ref<string>,
  pending: Ref<boolean>,
) => {
  const route = useRoute()
  const router = useRouter()
  const { artifact } = useAppConfig()

  const showAnimation = computed({
    get() {
      if (route.query.animation === 'true') return true
      if (route.query.animation === 'false') return false
      return artifact.defaultView === 'animation'
    },
    set(value: boolean) {
      const isDefault = value === (artifact.defaultView === 'animation')
      router.replace({
        query: {
          ...route.query,
          animation: isDefault ? undefined : String(value),
        },
      })
    },
  })

  // Redirect when animation view is requested but no animation exists
  watch(
    pending,
    (isPending) => {
      if (
        !isPending &&
        !animationUrl.value &&
        route.query.animation === 'true'
      ) {
        router.replace({ query: { ...route.query, animation: undefined } })
      }
    },
    { immediate: true },
  )

  const animationQueryValue = (value: boolean) => {
    const isDefault = value === (artifact.defaultView === 'animation')
    return isDefault ? undefined : String(value)
  }

  return { showAnimation, animationQueryValue }
}
