<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2 class="title">课堂考勤与请假审批系统</h2>
        <p class="subtitle">欢迎登录</p>
      </div>

      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <!-- 账号 -->
        <el-form-item prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入账号" 
            size="large"
            prefix-icon="User"
          />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <!-- 角色选择 -->
        <el-form-item prop="role">
          <el-radio-group v-model="form.role" size="large" style="width: 100%">
            <el-radio-button value="student" style="width: 33.33%">
              学生
            </el-radio-button>
            <el-radio-button value="teacher" style="width: 33.33%">
              教师
            </el-radio-button>
            <el-radio-button value="counselor" style="width: 33.33%">
              辅导员
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            style="width: 100%" 
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>测试账号：任意账号密码，选择角色即可登录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
// import { login } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  role: 'student'
})

const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    // TODO: 后面换成真实接口
    // const res = await login(form)
    // userStore.setToken(res.data.token)
    // userStore.setUserInfo(res.data.userInfo)
    
    // 模拟登录成功
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 模拟用户信息
    const mockUserInfo = {
      id: 1,
      username: form.username,
      name: form.username,
      role: form.role,
      avatar: ''
    }
    
    userStore.setToken('mock-token-' + Date.now())
    userStore.setUserInfo(mockUserInfo)
    
    ElMessage.success('登录成功')
    
    // 根据角色跳转到不同页面
    if (form.role === 'student') {
      router.push('/student/home')
    } else if (form.role === 'teacher') {
      router.push('/teacher/home')
    } else if (form.role === 'counselor') {
      router.push('/counselor/home')
    } else {
      router.push('/student/home')
    }
  } catch (e) {
    ElMessage.error(e.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box {
  width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 40px 35px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}
.title {
  margin: 0 0 10px 0;
  font-size: 22px;
  color: #303133;
}
.subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.login-form {
  margin-top: 20px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #909399;
}
</style>