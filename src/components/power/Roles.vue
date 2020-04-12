<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" size="small" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色权限表格 -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand" align="center">
          <template slot-scope="scope">
            <el-row
              v-for="(item, i1) in scope.row.children"
              :key="item.id"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightByID(scope.row, item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-arrow-right"></i>
              </el-col>
              <!-- 渲染二级 三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(subItem, i2) in item.children"
                  :key="subItem.id"
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightByID(scope.row, subItem.id)"
                    >{{subItem.authName}}</el-tag>
                    <i class="el-icon-arrow-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="(subSubItem) in subItem.children"
                      :key="subSubItem.id"
                      type="warning"
                      closable
                      @close="removeRightByID(scope.row, subSubItem.id)"
                    >{{subSubItem.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#" align="center"></el-table-column>
        <el-table-column label="角色名称" prop="roleName" align="center"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc" align="center"></el-table-column>
        <el-table-column label="操作" width="300px" align="center">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <!-- 分配角色按钮 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加用户对话框 -->
      <el-dialog title="提示" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
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
          <el-form-item label="名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoles">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配权限对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="setRightDialogClosed"
      >
        <!-- 树形控件 -->
        <el-tree
          :data="rightsList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
          ref="treeRef"
        ></el-tree>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 所有角色列表
      roleList: [],
      // 添加用户对话框
      addDialogVisible: false,
      // 添加用户表单数据
      addForm: {},
      // 添加用户表单校验
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ]
      },
      // 控制修改用户对话框是否可见
      editDialogVisible: false,
      // 保存修改用户信息
      editForm: {},
      // 修改用户表单校验
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ]
      },
      // 分配权限对话框
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的树节点
      defKeys: [],
      // 当前即将分配角色的id
      roleId: ''
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    // 获取所有角色的列表
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$Notification({
          title: 'error',
          message: '获取角色列表失败！',
          type: 'error',
          duration: 1000
        })
      }
      this.roleList = res.data
      // console.log(this.roleList)
    },
    // 修改按钮触发事件 展示编辑用户的对话框
    async showEditDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$Notification({
          title: 'error',
          message: '查询用户信息失败',
          type: 'error',
          duration: 1000
        })
      }
      this.editForm = res.data
      // console.log(this.editForm)
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed () {
      // 重置表单数据
      this.$refs.editFormRef.resetFields()
    },
    // 修改角色信息并提交
    editRoles () {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        // 校验失败 直接返回
        if (!valid) return
        // 可以发起修改用户的请求
        // console.log(this.editForm)
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$Notification({
            title: 'error',
            message: '更新角色信息失败',
            type: 'error',
            duration: 1000
          })
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 重新获取用户列表数据
        this.getRoleList()
        // 提示修改成功
        this.$Notification({
          title: 'success',
          message: '更新用户成功',
          type: 'success',
          duration: 1000
        })
      })
    },
    // 根据roleId删除用户信息
    async removeRoleById (id) {
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
      const { data: res } = await this.$http.delete('roles/' + id)
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
      this.getRoleList()
    },
    // 关闭添加用户对话框 重置表单
    addDialogClosed () {
      // console.log("1")
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮 添加新角色
    addRoles () {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        // 校验失败 直接返回
        if (!valid) return
        // // 可以发起添加用户的请求
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$Notification({
            title: 'error',
            message: '添加角色失败',
            type: 'error',
            duration: 1000
          })
        }
        this.$Notification({
          title: 'success',
          message: '添加角色成功',
          type: 'success',
          duration: 1000
        })
        // 关闭添加输入框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getRoleList()
      })
    },
    // 根据id删除对应权限
    async removeRightByID (role, rightId) {
      console.log(role, rightId)
      // 弹框提示用户是否删除
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
          title: '',
          message: '取消删除',
          type: 'error',
          duration: 1000
        })
      }
      // console.log('删除')
      // 请求接口 删除用户
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      // // 删除失败
      // console.log(res)
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
      // 删除成功 刷新列表
      // this.getRoleList()
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // console.log("11")
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$Notification({
          title: 'error',
          message: '获取权限数据失败',
          type: 'error',
          duration: 1000
        })
      }
      // console.log(res)
      this.rightsList = res.data
      // console.log(this.rightsList)
      // 递归获取三级节点
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式 获取角色所有三级权限的id 并保存到degKeys数组中
    getLeafKeys (node, arr) {
      // 如果当前节点不包含children值 则为三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果不是三级节点 则对children使用递归
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed () {
      // 将tree树形结构数据清空
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [
        // 获取选中的节点id
        ...this.$refs.treeRef.getCheckedKeys(),
        // 获取班选的节点id
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      // 将返回的选中节点id变为以,相隔的字符串
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      // 分配权限失败
      if (res.meta.status !== 200) {
        return this.$Notification({
          title: 'error',
          message: '分配权限失败',
          type: 'error',
          duration: 1000
        })
      }
      // 分配权限成功
      this.$Notification({
        title: 'success',
        message: '分配权限成功',
        type: 'success',
        duration: 1000
      })
      this.getRoleList()
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>