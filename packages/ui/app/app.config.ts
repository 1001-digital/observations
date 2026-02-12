export default defineAppConfig({
  exampleArtifacts: [] as string[],
  artifact: {
    defaultView: 'animation' as 'animation' | 'image',
    details: {
      showCollection: true,
      showSymbol: true,
      showArtist: true,
      showOwner: true,
    },
  },
})
