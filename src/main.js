import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入全局样式表
import '../src/assets/css/global.css'
import {
  Form,
  FormItem,
  Input,
  Button,
  Notification,
  Container,
  Header,
  Aside,
  Main,
  Menu,
  Submenu,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  TableColumn,
  Switch,
  Tooltip,
  Pagination,
  Dialog
} from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';

import axios from 'axios'
// 将axios挂载到vue原型对象上
Vue.prototype.$http = axios
// 设置axios默认根路径
axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
// 请求拦截器
axios.interceptors.request.use(config => {
  // console.log(config)
  // 为请求头的 Authorization 加上token 登陆期间 token值为null 登陆成功 token才会有值
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config)
  // 在最后必须return config
  return config
})

Vue.config.productionTip = false

Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Button)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.prototype.$Notification = Notification

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')