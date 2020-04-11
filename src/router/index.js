import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  // 重定向首页
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})


// 挂在路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转
  // next 是一个函数 表示放行 next() 放行 next('/login') 强制跳转指定路由
  // 如果访问的是登录页 则不需要做权限控制 直接放行
  if (to.path === '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果token不存在 返回登录页
  if (!tokenStr) return next('/login')
  // 如果登录存在 则放行
  setTimeout(function () {
    next()
  }, 1000)
 
})
export default router