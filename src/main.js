import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import '@/style/element-variables.scss'
import '@/style/reset.css'
import '@/assets/iconfont/iconfont.css'
import '@/style/main.css'

Vue.config.productionTip = false
Vue.use(ElementUI, {
  size: 'small'
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
