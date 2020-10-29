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
        path: '/EntityClassGeneration',
        component: () => import('@/views/EntityClassGeneration')
      },
      {
        path: '/CustomBuild',
        component: () => import('@/views/CustomBuild')
      },
      {
        path: '/JavaBuild',
        component: () => import('@/views/JavaBuild')
      }
    ]
  },
  {
    path: '/Note',
    component: () => import('@/views/permission/Note')
  },
  {
    path: '/DocumentText',
    component: () => import('@/views/DocumentText')
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
