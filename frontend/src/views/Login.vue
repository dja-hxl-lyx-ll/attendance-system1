<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="grid-pattern"></div>
    </div>

    <!-- 浮动装饰元素 -->
    <div class="floating-elements">
      <div class="float-item float-1">
        <el-icon :size="24"><Monitor /></el-icon>
      </div>
      <div class="float-item float-2">
        <el-icon :size="20"><Notebook /></el-icon>
      </div>
      <div class="float-item float-3">
        <el-icon :size="22"><Clock /></el-icon>
      </div>
      <div class="float-item float-4">
        <el-icon :size="20"><Medal /></el-icon>
      </div>
      <div class="float-item float-5">
        <el-icon :size="26"><Reading /></el-icon>
      </div>
    </div>

    <div class="login-wrapper">
      <!-- 左侧插画区域 -->
      <div class="login-left">
        <div class="brand">
          <div class="logo-icon">
            <el-icon :size="32"><School /></el-icon>
          </div>
          <span class="brand-name">课堂考勤系统</span>
        </div>
        
        <h1 class="title">
          欢迎回来 👋
        </h1>
        <p class="subtitle">
          智能考勤管理，让学习与教学更高效
        </p>

        <!-- 功能特色卡片 -->
        <div class="feature-cards">
          <div class="feature-card">
            <div class="feature-icon" style="background: rgba(16, 185, 129, 0.2)">
              <el-icon :size="22" style="color: #10b981"><Clock /></el-icon>
            </div>
            <div class="feature-text">
              <div class="feature-title">快速签到</div>
              <div class="feature-desc">一键签到，高效便捷</div>
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background: rgba(99, 102, 241, 0.2)">
              <el-icon :size="22" style="color: #6366f1"><Document /></el-icon>
            </div>
            <div class="feature-text">
              <div class="feature-title">在线请假</div>
              <div class="feature-desc">流程透明，审批及时</div>
            </div>
          </div>
          <div class="feature-card">
            <div class="feature-icon" style="background: rgba(245, 158, 11, 0.2)">
              <el-icon :size="22" style="color: #f59e0b"><DataAnalysis /></el-icon>
            </div>
            <div class="feature-text">
              <div class="feature-title">数据统计</div>
              <div class="feature-desc">可视化报表，一目了然</div>
            </div>
          </div>
        </div>

        <!-- 动态数据展示窗口 -->
        <div class="data-window">
          <div class="window-header">
            <div class="window-dots">
              <span class="dot dot-red"></span>
              <span class="dot dot-yellow"></span>
              <span class="dot dot-green"></span>
            </div>
            <span class="window-title">{{ currentRoleData.title }}</span>
            <span class="window-status">
              <span class="status-dot"></span>
              实时数据
            </span>
          </div>
          
          <div class="window-body">
            <transition name="fade" mode="out-in">
              <div :key="form.role" class="data-content">
                <!-- 主数据展示 -->
                <div class="main-stat">
                  <div class="main-stat-icon" :style="{ background: currentRoleData.mainIconBg }">
                    <el-icon :size="28"><component :is="currentRoleData.mainIcon" /></el-icon>
                  </div>
                  <div class="main-stat-info">
                    <div class="main-stat-value" :style="{ color: currentRoleData.mainColor }">
                      {{ currentRoleData.mainValue }}
                    </div>
                    <div class="main-stat-label">{{ currentRoleData.mainLabel }}</div>
                  </div>
                </div>

                <!-- 数据卡片网格 -->
                <div class="data-grid">
                  <div 
                    v-for="(item, idx) in currentRoleData.stats" 
                    :key="idx" 
                    class="data-item"
                  >
                    <div class="data-item-icon" :style="{ background: item.iconBg, color: item.color }">
                      <el-icon :size="16"><component :is="item.icon" /></el-icon>
                    </div>
                    <div class="data-item-info">
                      <div class="data-item-value" :style="{ color: item.color }">
                        {{ item.value }}
                      </div>
                      <div class="data-item-label">{{ item.label }}</div>
                    </div>
                  </div>
                </div>

                <!-- 底部提示 -->
                <div class="data-footer">
                  <el-icon :size="14"><TrendCharts /></el-icon>
                  <span>{{ currentRoleData.tip }}</span>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-right">
        <div class="login-card">
          <h2 class="card-title">账号登录</h2>
          <p class="card-desc">请选择您的身份并登录系统</p>

          <el-form 
            :model="form" 
            :rules="rules" 
            ref="formRef" 
            class="login-form"
          >
            <!-- 角色选择 -->
            <el-form-item prop="role">
              <div class="role-selector">
                <div 
                  v-for="role in roleList" 
                  :key="role.value"
                  class="role-item"
                  :class="{ active: form.role === role.value }"
                  @click="selectRole(role.value)"
                >
                  <div class="role-icon">
                    <el-icon :size="26"><component :is="role.icon" /></el-icon>
                  </div>
                  <span class="role-name">{{ role.label }}</span>
                  <div class="role-check" v-if="form.role === role.value">
                    <el-icon :size="14"><Check /></el-icon>
                  </div>
                </div>
              </div>
            </el-form-item>

            <!-- 账号 -->
            <el-form-item prop="username">
              <el-input 
                v-model="form.username" 
                placeholder="请输入账号 / 学号 / 工号" 
                size="large"
                class="custom-input"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 密码 -->
            <el-form-item prop="password">
              <el-input 
                v-model="form.password" 
                type="password" 
                placeholder="请输入密码" 
                size="large"
                class="custom-input"
                show-password
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 记住我 & 忘记密码 -->
            <div class="form-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <el-link type="primary" :underline="false">忘记密码？</el-link>
            </div>

            <!-- 登录按钮 -->
            <el-form-item>
              <el-button 
                type="primary" 
                size="large" 
                class="login-btn"
                :loading="loading"
                @click="handleLogin"
              >
                <span v-if="!loading">登 录</span>
                <span v-else>登录中...</span>
              </el-button>
            </el-form-item>
          </el-form>

          <div class="login-footer">
            <div class="divider">
              <span class="divider-text">其他登录方式</span>
            </div>
            <div class="other-login">
              <div class="other-item" title="微信登录">
                <el-icon :size="22"><ChatDotRound /></el-icon>
              </div>
              <div class="other-item" title="手机登录">
                <el-icon :size="22"><Phone /></el-icon>
              </div>
              <div class="other-item" title="校园卡登录">
                <el-icon :size="22"><CreditCard /></el-icon>
              </div>
            </div>
          </div>

          <div class="login-tip">
            <el-icon :size="14"><InfoFilled /></el-icon>
            <span>测试提示：任意账号密码，选择角色即可登录体验</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  User,
  Lock,
  School,
  Clock,
  Document,
  DataAnalysis,
  InfoFilled,
  Avatar,
  Reading,
  UserFilled,
  Check,
  ChatDotRound,
  Phone,
  CreditCard,
  Monitor,
  Notebook,
  Medal,
  TrendCharts,
  User as UserIcon,
  Calendar,
  Bell,
  CircleCheck,
  DataLine,
  OfficeBuilding,
  Files
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

const form = reactive({
  username: '',
  password: '',
  role: 'student'
})

const roleList = [
  { value: 'student', label: '学生', icon: Avatar },
  { value: 'teacher', label: '教师', icon: Reading },
  { value: 'counselor', label: '辅导员', icon: UserFilled }
]

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

// 各角色数据配置
const roleDataConfig = {
  student: {
    title: '学生端 · 数据概览',
    mainIcon: UserIcon,
    mainIconBg: 'rgba(99, 102, 241, 0.2)',
    mainColor: '#6366f1',
    mainValue: '3,256',
    mainLabel: '在校学生总数',
    tip: '本周出勤率较上周提升 2.3%，继续加油！',
    stats: [
      { label: '本周出勤率', value: '94.8%', icon: CircleCheck, color: '#10b981', iconBg: 'rgba(16, 185, 129, 0.15)' },
      { label: '今日已签到', value: '2,890人', icon: Calendar, color: '#6366f1', iconBg: 'rgba(99, 102, 241, 0.15)' },
      { label: '待签到课程', value: '12门', icon: Bell, color: '#f59e0b', iconBg: 'rgba(245, 158, 11, 0.15)' },
      { label: '请假申请中', value: '86人', icon: Document, color: '#ef4444', iconBg: 'rgba(239, 68, 68, 0.15)' }
    ]
  },
  teacher: {
    title: '教师端 · 教学概览',
    mainIcon: Reading,
    mainIconBg: 'rgba(102, 126, 234, 0.2)',
    mainColor: '#667eea',
    mainValue: '186',
    mainLabel: '在职教师总数',
    tip: '今日共有 42 门课程正在进行中',
    stats: [
      { label: '待审批请假', value: '23条', icon: Files, color: '#f59e0b', iconBg: 'rgba(245, 158, 11, 0.15)' },
      { label: '平均出勤率', value: '92.6%', icon: DataLine, color: '#10b981', iconBg: 'rgba(16, 185, 129, 0.15)' },
      { label: '今日课程', value: '42门', icon: Calendar, color: '#6366f1', iconBg: 'rgba(99, 102, 241, 0.15)' },
      { label: '本月课时', value: '1,280节', icon: Clock, color: '#764ba2', iconBg: 'rgba(118, 75, 162, 0.15)' }
    ]
  },
  counselor: {
    title: '辅导员端 · 管理概览',
    mainIcon: OfficeBuilding,
    mainIconBg: 'rgba(16, 185, 129, 0.2)',
    mainColor: '#10b981',
    mainValue: '24',
    mainLabel: '辅导员总数',
    tip: '本月共审批请假申请 312 条',
    stats: [
      { label: '管理学生', value: '3,256人', icon: UserIcon, color: '#6366f1', iconBg: 'rgba(99, 102, 241, 0.15)' },
      { label: '待审批请假', value: '15条', icon: Files, color: '#f59e0b', iconBg: 'rgba(245, 158, 11, 0.15)' },
      { label: '管理班级', value: '68个', icon: OfficeBuilding, color: '#667eea', iconBg: 'rgba(102, 126, 234, 0.15)' },
      { label: '本月通过', value: '289条', icon: CircleCheck, color: '#10b981', iconBg: 'rgba(16, 185, 129, 0.15)' }
    ]
  }
}

// 当前角色数据
const currentRoleData = computed(() => roleDataConfig[form.role])

const selectRole = (role) => {
  form.role = role
}

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const roleNames = {
      student: '同学',
      teacher: '老师',
      counselor: '辅导员'
    }
    
    const mockUserInfo = {
      id: 1,
      username: form.username,
      name: form.username || '用户',
      role: form.role,
      roleName: roleNames[form.role],
      avatar: ''
    }
    
    userStore.setToken('mock-token-' + Date.now())
    userStore.setUserInfo(mockUserInfo)
    
    ElMessage.success(`登录成功，欢迎回来${roleNames[form.role]}！`)
    
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
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* ========== 背景装饰 ========== */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}
.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}
.circle-1 {
  width: 400px;
  height: 400px;
  top: -150px;
  right: -100px;
}
.circle-2 {
  width: 300px;
  height: 300px;
  bottom: 50px;
  left: -80px;
}
.circle-3 {
  width: 200px;
  height: 200px;
  top: 40%;
  left: 15%;
  background: rgba(255, 255, 255, 0.05);
}

.grid-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* 浮动装饰元素 */
.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  color: rgba(255, 255, 255, 0.15);
}
.float-item {
  position: absolute;
  animation: float 6s ease-in-out infinite;
}
.float-1 { top: 12%; left: 8%; animation-delay: 0s; }
.float-2 { top: 22%; right: 12%; animation-delay: 1s; }
.float-3 { bottom: 28%; left: 6%; animation-delay: 2s; }
.float-4 { bottom: 18%; right: 8%; animation-delay: 3s; }
.float-5 { top: 48%; left: 4%; animation-delay: 1.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-18px) rotate(5deg); }
}

/* ========== 登录主体 ========== */
.login-wrapper {
  width: 1050px;
  max-width: 100%;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
  display: flex;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* ========== 左侧 ========== */
.login-left {
  width: 52%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 35px 32px;
  color: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  width: 280px;
  height: 280px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  top: -90px;
  right: -70px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}
.logo-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}
.brand-name {
  font-size: 16px;
  font-weight: 600;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 6px 0;
  line-height: 1.3;
  position: relative;
  z-index: 1;
}
.subtitle {
  font-size: 13px;
  opacity: 0.85;
  margin: 0 0 18px 0;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

/* 功能卡片 */
.feature-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}
.feature-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s;
}
.feature-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}
.feature-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.feature-text {
  flex: 1;
}
.feature-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
}
.feature-desc {
  font-size: 11px;
  opacity: 0.8;
}

/* ========== 数据展示窗口 ========== */
.data-window {
  margin-top: auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 14px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
}

.window-header {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.25);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.window-dots {
  display: flex;
  gap: 6px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot-red { background: #ff5f57; }
.dot-yellow { background: #febc2e; }
.dot-green { background: #28c840; }

.window-title {
  margin-left: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  flex: 1;
}

.window-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}
.status-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.window-body {
  padding: 16px;
  min-height: 200px;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 主数据 */
.main-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.main-stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.main-stat-info {
  flex: 1;
}
.main-stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 2px;
}
.main-stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* 数据网格 */
.data-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}
.data-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  transition: all 0.3s;
}
.data-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}
.data-item-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.data-item-info {
  flex: 1;
  min-width: 0;
}
.data-item-value {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 2px;
}
.data-item-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

/* 底部提示 */
.data-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

/* ========== 右侧 ========== */
.login-right {
  width: 48%;
  padding: 45px 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 360px;
}

.card-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1e293b;
}
.card-desc {
  font-size: 13px;
  color: #94a3b8;
  margin: 0 0 25px 0;
}

/* 角色选择器 */
.role-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.role-item {
  flex: 1;
  padding: 16px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}
.role-item:hover {
  border-color: #c7d2fe;
  background: #f5f3ff;
  transform: translateY(-2px);
}
.role-item.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
}
.role-icon {
  width: 40px;
  height: 40px;
  margin: 0 auto 8px;
  background: #f1f5f9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.3s;
}
.role-item.active .role-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
.role-name {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}
.role-item.active .role-name {
  color: #667eea;
  font-weight: 600;
}
.role-check {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  background: #667eea;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 输入框 */
.custom-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  padding: 9px 14px;
  transition: all 0.3s;
}
.custom-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c7d2fe inset;
}
.custom-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) inset;
}
.custom-input :deep(.el-input__inner) {
  height: 30px;
  line-height: 30px;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  font-size: 12px;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 46px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  margin-top: 5px;
  transition: all 0.3s;
}
.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

/* 底部其他登录 */
.login-footer {
  margin-top: 22px;
}
.divider {
  position: relative;
  text-align: center;
  margin-bottom: 15px;
}
.divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: #e2e8f0;
}
.divider-text {
  position: relative;
  padding: 0 12px;
  background: #fff;
  font-size: 11px;
  color: #94a3b8;
}

.other-login {
  display: flex;
  justify-content: center;
  gap: 18px;
}
.other-item {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s;
}
.other-item:hover {
  background: #eef2ff;
  color: #667eea;
  transform: translateY(-2px);
}

/* 提示 */
.login-tip {
  margin-top: 20px;
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
}

/* 响应式 */
@media (max-width: 900px) {
  .login-wrapper {
    flex-direction: column;
  }
  .login-left,
  .login-right {
    width: 100%;
  }
  .login-left {
    padding: 35px 25px;
  }
  .login-right {
    padding: 35px 25px;
  }
  .data-window {
    display: none;
  }
}
</style>