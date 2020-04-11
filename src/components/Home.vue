<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logOut">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '60px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">
          <i :class="isCollapse ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
        </div>
        <!-- 侧边栏菜单区 -->
        <el-menu
          background-color="#324157"
          text-color="#fff"
          active-text-color="#20a0ff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition = "false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsList[item.id]" class="icons"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path + ''"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <!-- 二级菜单模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-s-grid"></i>
                <!-- 文本 -->
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧区域 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menuList: '',
      iconsList: {
        '125': 'el-icon-s-custom',
        '103': 'el-icon-s-management',
        '101': 'el-icon-s-cooperation',
        '102': 'el-icon-s-order',
        '145': 'el-icon-s-data'
      },
      // 切换左侧菜单展开和关闭
      isCollapse: false,
      // 激活的链接地址
      activePath: ''
    }
  },
  created () {
    // 获取所有左侧菜单
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logOut () {
      // 清除token
      window.sessionStorage.clear()
      // 路由跳转到登录页
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$Notification({
          title: 'error',
          message: 'res.meta.msg',
          type: 'error',
          duration: 1000
        })
      }
      this.menuList = res.data
      // console.log(res)
    },
    // 点击按钮切换菜单折叠和展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      // console.log(activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #242f42;
  display: flex;
  justify-content: space-between;
  padding-left: 10px;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #324157;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #f0f0f0;
}
.icons {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  line-height: 26px;
  color: #909399;
  text-align: center;
  cursor: pointer;
  i {
    font-size: 24px;
  }
}
</style>