import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'

Vue.use(VueRouter)

const routes = [
  // 重定向首页
  {
    path: '/',
    redirect: '/login'
  },
  // login
  {
    path: '/login',
    component: Login
  },
  // home
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      // 欢迎页
      {
        path: '/welcome',
        component: Welcome,
      },
      // 用户管理
      {
        path: '/users',
        component: Users
      },
      // 权限列表
      {
        path: '/rights',
        component: Rights
      },
      // 角色列表
      {
        path: '/roles',
        component: Roles
      },
      // 商品分类
      {
        path: '/categories',
        component: Cate
      }
    ]
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