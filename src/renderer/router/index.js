import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main-page',
      component: require('@/components/MainPage').default
    },
    {
      path: '/editor',
      name: 'editor-page',
      component: require('@/components/EditorPage').default
    },
    {
      path: '/notifications',
      name: 'notifications-page',
      component: require('@/components/NotificationsPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
