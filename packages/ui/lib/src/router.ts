import { createRouter, createWebHistory } from 'vue-router'
import ExperienceIndex from './experiences/ExperienceIndex.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: ExperienceIndex },
    {
      path: '/artifact',
      component: () => import('./experiences/ArtifactExperience.vue'),
      children: [
        {
          path: '',
          component: () => import('./experiences/artifact/ArtifactObservations.vue'),
        },
        {
          path: ':id',
          component: () => import('./experiences/artifact/ArtifactObservationDetail.vue'),
        },
      ],
    },
    {
      path: '/collection',
      component: () => import('./experiences/CollectionExperience.vue'),
    },
    {
      path: '/artist',
      component: () => import('./experiences/ArtistExperience.vue'),
    },
  ],
})
