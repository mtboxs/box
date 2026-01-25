import { createRouter, createWebHistory } from 'vue-router'
import Pay from '@/pages/pay/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_PUBLIC_PATH),
  routes: [
    { path: '/', name: 'Pay', component: Pay },
    { path: '/pay', redirect: '/' },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
