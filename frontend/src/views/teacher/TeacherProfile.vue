<template>
  <div class="teacher-profile">
    <h3 class="page-title">个人中心</h3>

    <el-row :gutter="24">
      <!-- 左侧：个人信息卡片 -->
      <el-col :span="8">
        <div class="profile-card card-hover">
          <!-- 顶部渐变背景 -->
          <div class="profile-header">
            <div class="header-bg"></div>
            <el-avatar :size="80" class="user-avatar">
              {{ userInfo.name?.charAt(0) || '教' }}
            </el-avatar>
          </div>
          
          <div class="profile-body">
            <div class="user-name">{{ userInfo.name }}</div>
            <div class="user-title">{{ userInfo.title }}</div>
            <div class="user-tags">
              <el-tag size="small" effect="light" type="primary">教师</el-tag>
              <el-tag size="small" effect="light" type="success">{{ userInfo.department }}</el-tag>
            </div>

            <el-divider />

            <div class="info-grid">
              <div class="info-item">
                <div class="info-icon" style="background: rgba(99, 102, 241, 0.1); color: #6366f1">
                  <el-icon :size="16"><Postcard /></el-icon>
                </div>
                <div class="info-content">
                  <div class="info-label">工号</div>
                  <div class="info-value">{{ userInfo.teacherNo }}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981">
                  <el-icon :size="16"><Reading /></el-icon>
                </div>
                <div class="info-content">
                  <div class="info-label">教授课程</div>
                  <div class="info-value">{{ userInfo.courseCount }} 门</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b">
                  <el-icon :size="16"><User /></el-icon>
                </div>
                <div class="info-content">
                  <div class="info-label">性别</div>
                  <div class="info-value">{{ userInfo.gender || '未设置' }}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon" style="background: rgba(239, 68, 68, 0.1); color: #ef4444">
                  <el-icon :size="16"><Phone /></el-icon>
                </div>
                <div class="info-content">
                  <div class="info-label">手机号</div>
                  <div class="info-value">{{ userInfo.phone || '未设置' }}</div>
                </div>
              </div>
              <div class="info-item" style="grid-column: span 2">
                <div class="info-icon" style="background: rgba(102, 126, 234, 0.1); color: #667eea">
                  <el-icon :size="16"><Message /></el-icon>
                </div>
                <div class="info-content">
                  <div class="info-label">邮箱</div>
                  <div class="info-value">{{ userInfo.email || '未设置' }}</div>
                </div>
              </div>
            </div>

            <el-button type="primary" class="edit-btn" @click="editVisible = true">
              <el-icon><Edit /></el-icon>
              编辑资料
            </el-button>
          </div>
        </div>
      </el-col>

      <!-- 右侧：修改密码 + 教学概览 -->
      <el-col :span="16">
        <!-- 修改密码 -->
        <div class="section-card card-hover">
          <div class="card-header">
            <div class="header-left">
              <div class="header-icon" style="background: rgba(102, 126, 234, 0.1); color: #667eea">
                <el-icon :size="20"><Lock /></el-icon>
              </div>
              <h3 class="card-title">修改密码</h3>
            </div>
            <span class="header-tip">定期修改密码更安全</span>
          </div>

          <el-form 
            :model="passwordForm" 
            :rules="passwordRules" 
            ref="passwordFormRef" 
            label-width="100px"
            class="password-form"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="原密码" prop="oldPassword">
                  <el-input 
                    v-model="passwordForm.oldPassword" 
                    type="password" 
                    show-password
                    placeholder="请输入原密码"
                    size="large"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="新密码" prop="newPassword">
                  <el-input 
                    v-model="passwordForm.newPassword" 
                    type="password" 
                    show-password
                    placeholder="请输入新密码（6-20位）"
                    size="large"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input 
                    v-model="passwordForm.confirmPassword" 
                    type="password" 
                    show-password
                    placeholder="请再次输入新密码"
                    size="large"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item>
              <el-button type="primary" class="submit-btn" @click="changePassword" :loading="passwordLoading">
                确认修改
              </el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 本月教学概览 -->
        <div class="section-card card-hover" style="margin-top: 24px">
          <div class="card-header">
            <div class="header-left">
              <div class="header-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981">
                <el-icon :size="20"><DataAnalysis /></el-icon>
              </div>
              <h3 class="card-title">本月教学概览</h3>
            </div>
            <el-button type="primary" link @click="goToStats">查看详情 →</el-button>
          </div>

          <el-row :gutter="20">
            <el-col :span="6" v-for="(item, index) in overviewList" :key="index">
              <div class="stat-item">
                <div class="stat-icon-wrapper" :style="{ background: item.bgColor }">
                  <el-icon :size="24" :style="{ color: item.color }">
                    <component :is="item.icon" />
                  </el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number" :style="{ color: item.color }">{{ item.value }}</div>
                  <div class="stat-label">{{ item.label }}</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>

    <!-- 编辑资料弹窗 -->
    <el-dialog v-model="editVisible" title="编辑资料" width="500px" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile" :loading="editLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  Lock,
  Edit,
  User,
  Phone,
  Message,
  Postcard,
  Reading,
  DataAnalysis,
  Reading as Book,
  UserFilled,
  Clock,
  TrendCharts
} from '@element-plus/icons-vue'
// import { updatePassword, updateProfile } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const passwordFormRef = ref(null)
const passwordLoading = ref(false)
const editVisible = ref(false)
const editLoading = ref(false)

// 用户信息
const userInfo = computed(() => ({
  name: userStore.userInfo?.name || '张老师',
  teacherNo: 'T2024001',
  title: '讲师',
  department: '计算机学院',
  courseCount: 4,
  gender: '男',
  phone: '13800138000',
  email: 'teacher@example.com'
}))

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 校验确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 编辑资料表单
const editForm = reactive({
  name: '',
  gender: '',
  phone: '',
  email: ''
})

// 教学概览
const overviewList = [
  { label: '教授课程', value: '4门', icon: Book, color: '#667eea', bgColor: 'rgba(102, 126, 234, 0.1)' },
  { label: '学生总数', value: '135人', icon: UserFilled, color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)' },
  { label: '课时数', value: '64节', icon: Clock, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  { label: '平均出勤率', value: '92.6%', icon: TrendCharts, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' }
]

// 修改密码
const changePassword = async () => {
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return

  passwordLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('密码修改成功，请重新登录')
    
    userStore.logout()
    router.push('/login')
  } catch (e) {
    ElMessage.error(e.message || '修改失败')
  } finally {
    passwordLoading.value = false
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordFormRef.value.resetFields()
}

// 打开编辑弹窗时填充数据
watch(editVisible, (val) => {
  if (val) {
    editForm.name = userInfo.value.name
    editForm.gender = userInfo.value.gender
    editForm.phone = userInfo.value.phone
    editForm.email = userInfo.value.email
  }
})

// 保存资料
const saveProfile = async () => {
  editLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    userStore.setUserInfo({
      ...userStore.userInfo,
      name: editForm.name
    })
    
    ElMessage.success('保存成功')
    editVisible.value = false
  } catch (e) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    editLoading.value = false
  }
}

// 跳转到考勤统计
const goToStats = () => {
  router.push('/teacher/attendance-stats')
}
</script>

<style scoped>
.teacher-profile {
  padding: 0;
}
.page-title {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

/* 通用卡片 */
.section-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}
.header-tip {
  font-size: 12px;
  color: #94a3b8;
}

/* 左侧个人信息卡片 */
.profile-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}

.profile-header {
  position: relative;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 50px;
}
.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.user-avatar {
  position: relative;
  z-index: 1;
  border: 4px solid #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 32px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.profile-body {
  padding: 0 24px 24px;
  text-align: center;
}
.user-name {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
}
.user-title {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
}
.user-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  text-align: left;
  margin-bottom: 20px;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.info-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.info-content {
  flex: 1;
  min-width: 0;
}
.info-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 2px;
}
.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-btn {
  width: 100%;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 密码表单 */
.password-form {
  max-width: 100%;
}
.submit-btn {
  width: 140px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

/* 教学概览 */
.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s;
}
.stat-item:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}
.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-info {
  flex: 1;
}
.stat-number {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 13px;
  color: #64748b;
}

/* hover 上浮效果 */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}
</style>