import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import axios from 'axios'
import VueHotkey from 'v-hotkey'
import Toast from 'vue2-toast'

import App from './App'
import router from './router'
import store from './store'

import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'

import 'vue2-toast/lib/toast.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './assets/custom.css'
import './assets/custom-dark.css'

Vue.use(BootstrapVue)
Vue.use(VueHotkey)
Vue.use(Toast, {
  defaultType: 'bottom',
  duration: 1000,
  wordWrap: true,
  width: '150px'
})
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('icon', Icon)
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
