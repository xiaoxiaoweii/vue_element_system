import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入全局样式表
import '../src/assets/css/global.css'
import { Form, FormItem, Input, Button, Notification } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';

import axios from 'axios'
// 将axios挂载到vue原型对象上
Vue.prototype.$http = axios
// 设置axios默认根路径
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'

Vue.config.productionTip = false

Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Button)
Vue.prototype.$Notification = Notification

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
