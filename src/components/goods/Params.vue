<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告 -->
      <el-alert show-icon :closable="false" title="注意：只允许为第三级分类设置相关的参数！" type="warning"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <span>选择商品分类:</span>
        <!-- 选择商品分类的级联选择框 -->
        <el-cascader
          v-model="selectedCateKeys"
          :options="cateList"
          :props="cateProps"
          expandTrigger="hover"
          @change="handleChanged"
          clearable
        ></el-cascader>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand" label="#" align="center">
              <template slot-scope="scope">
                <!-- 循环渲染rag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#" align="center"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name" align="center"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand" label="#" align="center">
              <template slot-scope="scope">
                <!-- 循环渲染rag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable  @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#" align="center"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name" align="center"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定的数组
      selectedCateKeys: [],
      // 被激活的页签名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 添加分类对话框是否可见
      addDialogVisible: false,
      // 添加参数的表单数据
      addForm: {
        attr_name: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ]
      },
      // 修改分类对话框是否可见
      editDialogVisible: false,
      // 修改参数的表单数据
      editForm: {
        attr_name: ''
      },
      // 修改表单的验证规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ]
      }

    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有的商品分类
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$Notification({
          title: 'error',
          message: '获取商品分类失败',
          type: 'error',
          duration: 1000
        })
      }
      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 级联选择框选中项变化触发函数
    async handleChanged () {
      this.getParamsData()
    },
    // 获取参数的函数
    async getParamsData () {
      // console.log(this.selectedCateKeys)
      // 如果 selectedKeys 数组中的length不为3说明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        // console.log(this.selectedCateKeys)
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 选中的是三级分类
      // console.log(this.selectedCateKeys)
      // 根据所选分类的id 和当前所处的面板 获取对应的数据
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$Notification({
          title: 'error',
          message: '获取参数列表失败',
          type: 'error',
          duration: 1000
        })
      }
      // console.log(res.data)
      res.data.forEach(item => {
        // 对数组进行判端 如果不为空再进行分割
        item.attr_vals = item.attr_vals ? item.attr_vals = item.attr_vals.split(',') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // tab页签点击事件的处理函数
    handleTabClick () {
      // console.log(this.activeName)
      this.getParamsData()
    },
    // 监听添加对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$Notification({
            title: 'error',
            message: '添加参数失败',
            type: 'error',
            duration: 1000
          })
        }
        this.$Notification({
          title: 'success',
          message: '添加参数成功',
          type: 'success',
          duration: 1000
        })
        // 关闭添加输入框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getParamsData()
      })
    },
    // 点击按钮 展示修改的对话框
    async showEditDialog (attr_id) {
      // 查询当前参数的信息
      console.log(attr_id)
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$Notification({
          title: 'error',
          message: '获取参数信息失败',
          type: 'error',
          duration: 1000
        })
      }
      this.editForm = res.data
      // console.log(this.cateList)
      this.editDialogVisible = true
    },
    // 编辑按钮修改参数
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$Notification({
            title: 'error',
            message: '修改参数失败',
            type: 'error',
            duration: 1000
          })
        }
        this.$Notification({
          title: 'success',
          message: '修改参数成功',
          type: 'success',
          duration: 1000
        })
        // 重新获取用户列表数据
        this.getParamsData()
        // 关闭添加输入框
        this.editDialogVisible = false
      })
    },
    // 监听编辑对话框的关闭事件 重置修改的表单
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 根据id删除对应的参数项
    async removeParams (attr_id) {
      // console.log(row)
      // 询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
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
      this.getParamsData()
    },
    // 文本框失去焦点 或 按下Enter
    async handleInputConfirm (row) {
      // 判断输入框中除了空格是否有其他值 如果没有 将输入框重置
      if(row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      // 如果没有return 则需要后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 请求接口 保存操作
      this.saveAttrVals(row)
      // 删除成功 刷新用户列表
      this.getParamsData()
    },
    // 将对attr_vals的操作保存到数据库
    async saveAttrVals(row) {
      // 请求接口 保存操作
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      // 删除失败
      if (res.meta.status !== 200) {
        return this.$Notification({
          title: 'error',
          message: '修改参数失败',
          type: 'error',
          duration: 1000
        })
      }
      // 删除成功
      this.$Notification({
        title: 'success',
        message: '修改参数成功',
        type: 'success',
        duration: 1000
      })
    },
    // 点击按钮 展示文本输入框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点 $nextTick当页面重新渲染 才会执行函数
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
        console.log(_)
      });
    },
    // 删除对应的参数可选项
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)

    }
  },
  computed: {
    // 如果按钮需要被禁用 则返回true 否则返回false
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题的文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }

  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>