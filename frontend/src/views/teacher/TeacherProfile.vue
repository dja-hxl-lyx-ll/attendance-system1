<template>
  <div class="teacher-profile">
    <h3 class="page-title">个人中心</h3>

    <el-row :gutter="20">
      <!-- 左侧：基本信息卡片 -->
      <el-col :span="8">
        <el-card class="info-card" shadow="hover">
          <div class="avatar-section">
            <el-avatar :size="80" :src="userInfo.avatar">
              {{ userInfo.name?.charAt(0) }}
            </el-avatar>
            <div class="user-name">{{ userInfo.name }}</div>
            <div class="user-role">
              <el-tag size="small">教师</el-tag>
            </div>
          </div>

          <el-divider />

          <div class="info-list">
            <div class="info-item">
              <span class="info-label">工号</span>
              <span class="info-value">{{ userInfo.teacherNo }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">职称</span>
              <span class="info-value">{{ userInfo.title }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">所属院系</span>
              <span class="info-value">{{ userInfo.department }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">性别</span>
              <span class="info-value">{{ userInfo.gender || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">手机号</span>
              <span class="info-value">{{ userInfo.phone || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">邮箱</span>
              <span class="info-value">{{ userInfo.email || '未设置' }}</span>
            </div>
          </div>

          <el-button type="primary" plain style="width: 100%; margin-top: 20px" @click="editVisible = true">
            编辑资料
          </el-button>
        </el-card>
      </el-col>

      <!-- 右侧：修改密码 + 教学概览 -->
      <el-col :span="16">
        <!-- 修改密码 -->
        <el-card class="password-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Lock /></el-icon>
              <span>修改密码</span>
            </div>
          </template>

          <el-form 
            :model="passwordForm" 
            :rules="passwordRules" 
            ref="passwordFormRef" 
            label-width="100px"
            style="max-width: 500px"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input 
                v-model="passwordForm.oldPassword" 
                type="password" 
                show-password
                placeholder="请输入原密码"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input 
                v-model="passwordForm.newPassword" 
                type="password" 
                show-password
                placeholder="请输入新密码（6-20位）"
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changePassword" :loading="passwordLoading">
                确认修改
              </el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 本月教学概览 -->
        <el-card class="overview-card" shadow="hover" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>本月教学概览</span>
            </div>
          </template>

          <el-row :gutter="20">
            <el-col :span="6">
              <div class="mini-stat">
                <div class="mini-num" style="color: #409eff">4</div>
                <div class="mini-label">教授课程</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="mini-stat">
                <div class="mini-num" style="color: #67c23a">135</div>
                <div class="mini-label">学生总数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="mini-stat">
                <div class="mini-num" style="color: #e6a23c">24</div>
                <div class="mini-label">课时数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="mini-stat">
                <div class="mini-num" style="color: #909399">92.5%</div>
                <div class="mini-label">平均出勤率</div>
              </div>
            </el-col>
          </el-row>

          <div style="margin-top: 20px; text-align: right">
            <el-button type="primary" link @click="goToStats">
              查看详细统计 →
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑资料弹窗 -->
    <el-dialog v-model="editVisible" title="编辑资料" width="500px">
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
  DataAnalysis
} from '@element-plus/icons-vue'
// import { updatePassword, updateProfile } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const passwordFormRef = ref(null)
const passwordLoading = ref(false)
const editVisible = ref(false)
const editLoading = ref(false)

// 用户信息
const userInfo = computed(() => userStore.userInfo || {
  name: '张老师',
  teacherNo: 'T2024001',
  title: '讲师',
  department: '计算机学院',
  gender: '男',
  phone: '',
  email: '',
  avatar: ''
})

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

// 修改密码
const changePassword = async () => {
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return

  passwordLoading.value = true
  try {
    // TODO: 后面换成真实接口
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('密码修改成功，请重新登录')
    
    // 退出登录，跳转到登录页
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
const openEdit = () => {
  editForm.name = userInfo.value.name || ''
  editForm.gender = userInfo.value.gender || ''
  editForm.phone = userInfo.value.phone || ''
  editForm.email = userInfo.value.email || ''
}

// 保存资料
const saveProfile = async () => {
  editLoading.value = true
  try {
    // TODO: 后面换成真实接口
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新 store 里的用户信息
    userStore.setUserInfo({
      ...userStore.userInfo,
      ...editForm
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

// 监听编辑弹窗打开
watch(editVisible, (val) => {
  if (val) {
    openEdit()
  }
})
</script>

<style scoped>
.teacher-profile {
  padding: 20px;
}
.page-title {
  margin: 0 0 20px 0;
  font-size: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

/* 左侧信息卡片 */
.info-card {
  text-align: center;
}
.avatar-section {
  padding: 20px 0;
}
.user-name {
  font-size: 20px;
  font-weight: bold;
  margin: 15px 0 8px;
}
.user-role {
  margin-bottom: 10px;
}

.info-list {
  text-align: left;
  padding: 0 10px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}
.info-item:last-child {
  border-bottom: none;
}
.info-label {
  color: #909399;
}
.info-value {
  color: #303133;
}

/* 密码卡片 */
.password-card {
  margin-bottom: 20px;
}

/* 教学概览 */
.mini-stat {
  text-align: center;
  padding: 15px 0;
  background: #f5f7fa;
  border-radius: 8px;
}
.mini-num {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}
.mini-label {
  font-size: 13px;
  color: #909399;
}
</style>