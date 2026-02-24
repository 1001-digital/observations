import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'

const contract = import.meta.env.VITE_CONTRACT
const token = import.meta.env.VITE_TOKEN
const isScoped = !!(contract && token)

const tokenRoutes = [
  {
    path: isScoped ? '/' : '/:contract/:token',
    component: () => import('./pages/TokenLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('./pages/TokenObservations.vue'),
      },
      {
        path: isScoped ? ':id' : ':id',
        component: () => import('./pages/TokenDetail.vue'),
      },
    ],
  },
]

const routes = [
  ...(isScoped
    ? []
    : [
        { path: '/', component: Home },
        {
          path: '/:contract',
          component: () => import('./pages/Collection.vue'),
        },
      ]),
  ...tokenRoutes,
  ...(isScoped
    ? []
    : [
        {
          path: '/observer/:id',
          component: () => import('./pages/Observer.vue'),
        },
      ]),
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
