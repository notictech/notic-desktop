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
      path: '/set-master-password',
      name: 'set-master-password-page',
      component: require('@/components/SetMasterPasswordPage').default
    },
    {
      path: '/change-master-password',
      name: 'change-master-password-page',
      component: require('@/components/ChangeMasterPasswordPage').default
    },
    {
      path: '/enter-master-password',
      name: 'enter-master-password-page',
      component: require('@/components/EnterMasterPasswordPage').default
    },
    {
      path: '/settings',
      name: 'settings-page',
      component: require('@/components/SettingsPage').default
    },
    {
      path: '/about',
      name: 'about-page',
      component: require('@/components/AboutPage').default
    },
    {
      path: '/import',
      name: 'import-page',
      component: require('@/components/ImportPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
