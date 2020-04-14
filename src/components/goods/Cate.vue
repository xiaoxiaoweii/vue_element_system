<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button @click="showAddCateDialog" type="primary" size="small">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 角色权限表格 -->
      <el-row>
        <tree-table
          :data="cateList"
          :columns="columns"
          :selection-type="false"
          :expand-type="false"
          show-index
          index-text="#"
          border
          :show-row-hover="false"
          class="el-table"
        >
          <!-- 是否有效 -->
          <template slot="isok" slot-scope="scope">
            <i
              class="el-icon-success"
              v-if="scope.row.cat_deleted === false"
              style="color: #90EE90;"
            ></i>
            <i class="el-icon-error" v-else style="color: #FF4500;"></i>
          </template>
          <!-- 排序 -->
          <template slot="order" slot-scope="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" size="mini" v-else>三级</el-tag>
          </template>
          <!-- 操作 -->
          <template slot="opt" slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeCate(scope.row)"
            >删除</el-button>
          </template>
        </tree-table>
      </el-row>
      <el-row>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[3, 5, 10, 15]"
          :page-size="5"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </el-row>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options指定数据源 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            expandTrigger="hover"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <!-- 表单区域 -->
      <el-form label-width="70px" :model="editForm" :rules="editFormRules" ref="editFormRef">
        <el-form-item label="用户名" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 查询条件保存
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表 默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      // tree-table指定列定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'opt'
        },
      ],
      // 监听添加分类对话框是否可见
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类等级 默认添加一级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ],
        // cat_pid: [
        //   { required: true, message: '请输入角色描述', trigger: 'blur' },
        // ],
        cat_level: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 用来指定配置级联选择器配置对象
      cascaderProps: {
        // 选中之后的值
        value: 'cat_id',
        // 显示的名称
        label: 'cat_name',
        // 通过children实现嵌套
        children: 'children',
        checkStrictly: true
      },
      // 选中的父级分类id数组
      selectedKeys: [],
      // 编辑分类对话框
      editCateDialogVisible: false,
      // 编辑分类表单
      editForm: {
        cat_name: ''
      },
      // 编辑分类表单校验规则
      editFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateLIst()
  },
  methods: {
    // 获取商品分类数据
    async getCateLIst () {
      const { data: res } = await this.$http.get('categories/', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$Notification({
          title: 'error',
          message: '获取商品分类失败',
          type: 'error',
          duration: 1000
        })
      }
      // 获取成功保存数据
      // console.log(res.data.result)
      // 数据列表
      this.cateList = res.data.result
      // 总数据条数
      this.total = res.data.total
    },
    // 监听pagesize改变的事件
    handleSizeChange (newSize) {
      // 将最新的pagesize传递给queryInfo
      this.queryInfo.pagesize = newSize
      // 发起新的表格数据请求
      this.getCateLIst()

    },
    // 监听pagenum的改变 拿到最新页码值
    handleCurrentChange (newPage) {
      // 将最新的pagesize传递给queryInfo
      this.queryInfo.pagenum = newPage
      // 发起新的表格数据请求
      this.getCateLIst()
    },
    // 点击添加分类按钮 显示添加分类对话框
    showAddCateDialog () {
      // 请求父级分类数据
      this.getParentCate()
      // 显示添加分类对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCate () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$Notification({
          title: 'error',
          message: '获取父级分类数据失败',
          type: 'error',
          duration: 1000
        })
      }
      // 获取成功保存数据
      console.log(res.data)
      // 数据列表
      this.parentCateList = res.data
      console.log(this.parentCateList)
    },
    // 选择项发生变化触发函数
    parentCateChanged () {
      console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的length大于0 证明选中的父级分类 反之 没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮 添加新的分类
    addCate () {
      console.log(this.addCateForm)
      // 对表单进行预校验
      this.$refs.addCateFormRef.validate(async valid => {
        // 校验失败
        if (!valid) {
          return
        }
        // console.log(valid)
        // 请求数据
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        // 判断是否请求成功
        if (res.meta.status !== 201) {
          return this.$Notification({
            title: 'error',
            message: '添加商品分类失败',
            type: 'error',
            duration: 1000
          })
        }
        // 请求成功
        this.$Notification({
          title: 'success',
          message: '添加商品分类成功',
          type: 'success',
          duration: 1000
        })
        // 刷新数据列表
        this.getCateLIst()
        // 隐藏添加对话框
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件 重置表单数据
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cate_level = 0
      this.addCateForm.cate_pid = 0
    },
    showEditDialog (row) {
      // console.log(id)
      console.log(row)
      // this.editForm = res.data
      this.editForm = row
      console.log(this.editForm)
      this.editCateDialogVisible = true
    },
    // 关闭编辑分类对话框
    editCateDialogClosed () {
      // console.log('编辑分类对话框关闭了')
      this.$refs.editFormRef.resetFields()
      // console.log(this.editForm)
    },
    // 修改分类
    editCate () {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        // 校验失败 直接返回
        if (!valid) return
        // 可以发起编辑分类的请求
        const { data: res } = await this.$http.put(
          'categories/' + this.editForm.cat_id,
          {
            cat_name: this.editForm.cat_name
          }
        )
        if (res.meta.status !== 200) {
          return this.$Notification({
            title: 'error',
            message: '编辑分类失败',
            type: 'error',
            duration: 1000
          })
        }
        // 关闭对话框
        this.editCateDialogVisible = false
        // 重新获取用户列表数据
        this.getCateLIst()
        // 提示修改成功
        this.$Notification({
          title: 'success',
          message: '更新用户成功',
          type: 'success',
          duration: 1000
        })
      })
    },
    // 点击删除按钮
    async removeCate (row) {
      console.log(row)
      // 询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
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
          type: 'info',
          duration: 1000
        })
      }
      // 请求接口 删除用户
      const { data: res } = await this.$http.delete('categories/' + row.cat_id)
      // 删除失败
      if (res.meta.status !== 200) {
        return this.$Notification({
          title: 'error',
          message: '删除分类失败',
          type: 'error',
          duration: 1000
        })
      }
      // 删除成功
      this.$Notification({
        title: 'success',
        message: '删除成功',
        type: 'success',
        duration: 1000
      })
      // 删除成功 刷新用户列表
      this.getCateLIst()
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>