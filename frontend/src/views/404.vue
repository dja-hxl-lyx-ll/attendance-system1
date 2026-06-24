<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <div class="error-message">抱歉，您访问的页面不存在</div>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const goHome = () => {
  const role = userStore.userInfo?.role
  if (role === 'student') {
    router.push('/student/home')
  } else if (role === 'teacher') {
    router.push('/teacher/home')
  } else if (role === 'counselor') {
    router.push('/counselor/home')
  } else {
    router.push('/login')
  }
}
</script>

<style scoped>
.not-found {
  width: 100%;
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.not-found-content {
  text-align: center;
}
.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #409eff;
  line-height: 1;
  margin-bottom: 20px;
}
.error-message {
  font-size: 18px;
  color: #606266;
  margin-bottom: 30px;
}
</style>