<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <div style="margin-top: 15px;">
        <el-row :gutter="20">
          <el-col :span="10">
            <!-- 搜索框 -->
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <!-- 添加用户按钮 -->
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index" width="50px" align="center"></el-table-column>
        <el-table-column label="姓名" prop="username" align="center"></el-table-column>
        <el-table-column label="邮箱" prop="email" align="center"></el-table-column>
        <el-table-column label="电话" prop="mobile" align="center"></el-table-column>
        <el-table-column label="角色" prop="role_name" align="center"></el-table-column>
        <el-table-column label="状态" align="center">
          <template v-slot="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300px" align="center">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip effect="dark" content="编辑" placement="top-start" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeUserById(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[10, 15, 20, 50]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>

      <!-- 添加用户对话框 -->
      <el-dialog title="提示" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户对话框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <!-- 内容主体区域 -->
        <el-form label-width="70px" :model="editForm" :rules="editFormRules" ref="editFormRef">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则
      const regEmail = /[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }

      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机的规则
    var checkMobile = (rule, value, cb) => {
      // 验证邮箱的正则
      const regMobile = /^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/
      if (regMobile.test(value)) {
        // 合法的邮箱
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        // 字符串 信息
        query: '',
        // 当前页码
        pagenum: 1,
        // 当前每页显示数据条数
        pagesize: 10
      },
      // 用户列表
      userList: [],
      // 用户总条数
      total: 0,
      // 添加用户对话框
      addDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单校验
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在3-10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度在6-15个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改用户对话框是否可见
      editDialogVisible: false,
      // 保存修改用户信息
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 修改用户表单校验
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }

    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    // 获取用户列表
    async getUserList () {
      const { data: res } =
        await this.$http.get('users', {
          params: this.queryInfo
        })
      // 如果获取用户信息失败 即返回status不是200
      if (res.meta.status !== 200) return this.$Notification({
        title: 'error',
        message: '获取用户列表失败!',
        type: 'error',
        duration: 1000
      })
      this.userList = res.data.users
      this.total = res.data.total
      // console.log(this.userList)
    },
    // 监听 page-sizes 改变的事件
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 用户状态变化回调函数
    async userStateChanged (userInfo) {
      // console.log(userInfo)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        // 处理失败 将状态取反
        userInfo.mg_state = !userInfo.mg_state
        return this.$Notification({
          title: 'error',
          message: '更新用户状态失败！',
          type: 'error',
          duration: 1000
        })
      }
      this.$Notification({
        title: 'success',
        message: '更新用户状态成功！',
        type: 'success',
        duration: 1000
      })
    },
    // 关闭添加用户对话框 重置表单
    addDialogClosed () {
      // console.log("1")
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮 添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        // 校验失败 直接返回
        if (!valid) return
        // 可以发起添加用户的请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$Notification({
            title: 'error',
            message: '添加用户失败',
            type: 'error',
            duration: 1000
          })
        }
        this.$Notification({
          title: 'success',
          message: '添加用户成功',
          type: 'success',
          duration: 1000
        })
        // 关闭添加输入框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getUserList()
      })
    },
    // 修改按钮触发事件 展示编辑用户的对话框
    async showEditDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$Notification({
          title: 'error',
          message: '查询用户信息失败',
          type: 'error',
          duration: 1000
        })
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed () {
      // 重置表单数据
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        // 校验失败 直接返回
        if (!valid) return
        // 可以发起修改用户的请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (res.meta.status !== 200) {
          return this.$Notification({
            title: 'error',
            message: '更新用户失败',
            type: 'error',
            duration: 1000
          })
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 重新获取用户列表数据
        this.getUserList()
        // 提示修改成功
        this.$Notification({
          title: 'success',
          message: '更新用户成功',
          type: 'success',
          duration: 1000
        })
      })
    },
    // 根据id删除用户信息
    async removeUserById (id) {
      // 询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning'
      }).catch(err => {
        return err
      })
      // 如果用户确认删除 则返回值为confirm 如果取消删除 则返回值为cancel
      // console.log(confirmResult)
      // console.log(id)
      if (confirmResult !== 'confirm') {
        return this.$Notification({
          title: 'error',
          message: '取消删除',
          type: 'error',
          duration: 1000
        })
      }
      // 请求接口 删除用户
      const { data: res } = await this.$http.delete('users/' + id)
      // 删除失败
      if (res.meta.status !== 200) {
        return this.$Notification({
          title: 'error',
          message: '删除用户失败',
          type: 'error',
          duration: 1000
        })
      }
      this.$Notification({
        title: 'success',
        message: '删除成功',
        type: 'success',
        duration: 1000
      })
      // 删除成功 刷新用户列表
      this.getUserList()
    }
  }

}
</script>
<style lang="less" scoped>
</style>