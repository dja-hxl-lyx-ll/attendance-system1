<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="title">课堂考勤系统</h2>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="form.role">
            <el-radio value="student">学生</el-radio>
            <el-radio value="teacher">教师</el-radio>
            <el-radio value="counselor">辅导员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

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
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    // TODO: 后面换成真实的登录接口
    // 现在先模拟登录成功
    const mockToken = 'mock-token-' + Date.now()
    const mockUserInfo = {
      id: 1,
      username: form.username,
      name: '测试学生',
      role: form.role
    }

    userStore.setToken(mockToken)
    userStore.setUserInfo(mockUserInfo)

    ElMessage.success('登录成功')

    // 根据角色跳转到不同页面
    if (form.role === 'student') {
      router.push('/student/home')
    } else {
      // 教师和辅导员端后面再加，先跳学生端
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
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  width: 400px;
  padding: 20px;
}
.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>