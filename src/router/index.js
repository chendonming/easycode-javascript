import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Home,
    children: [
      {
        path: '/BuildCode',
        component: () => import('@/views/BuildCode.vue')
      }
    ]
  },
  {
    path: '/DocumentText',
    component: () => import('@/views/DocumentText')
  }
]

const router = new VueRouter({
  routes
})

export default router
