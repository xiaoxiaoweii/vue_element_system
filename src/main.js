import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入全局样式表
import '../src/assets/css/global.css'
import { Form, FormItem, Input, Button } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false

Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Button)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
