<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/avatar.png" alt="头像" />
      </div>
      <!-- 登录表单区域 -->
      <el-form :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form" ref="loginFormRef">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 用户密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 登录表单验证规则
      loginFormRules: {
        username: [
          // 验证用户名是否合法
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮 重置登录表单
    resetLoginForm() {
      // console.log(this);
      // 重置表单数据
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      // console.log(this);
      // 登录预校验结果查看
      this.$refs.loginFormRef.validate(async valid=> {
        // console.log(valid)
        // 如果验证未通过
        if(!valid) return;
        // 如果有预校验通过 接受登录结果
        const { data: res } = await this.$http.post('login', this.loginForm);
        // console.log(res.meta.status)
        // 判断返回状态是否为请求成功
        if(res.meta.status !== 200) {
          return this.$Notification({
            title: 'error',
            message: '登录失败',
            type: 'error',
            duration: 1000
          })
        } else {
          this.$Notification({
            title: 'success',
            message: '登录成功',
            type: 'success',
            duration: 1000
            
          })
        }
        // 将登录成功之后的token保存到客户端的sessionStorage中
        // 登陆中除了登录之外的其他API接口 必须在登录之后才能访问
        // token只再当前网页打开期间生效 
        console.log(res.data.token)
        // 将token保存到sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 通过编程式导航跳转到后台主页 
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 60px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: space-around;
}
</style>