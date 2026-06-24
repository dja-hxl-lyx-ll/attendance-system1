<template>
  <div class="counselor-profile">
    <h3 class="page-title">个人中心</h3>

    <el-row :gutter="24">
      <!-- 左侧：个人信息卡片 -->
      <el-col :span="9">
        <div class="profile-card section-card card-hover">
          <!-- 顶部渐变背景 -->
          <div class="profile-header">
            <div class="header-bg"></div>
            <div class="header-decoration">
              <div class="deco-circle deco-1"></div>
              <div class="deco-circle deco-2"></div>
              <div class="deco-circle deco-3"></div>
            </div>
            
            <!-- 头像 -->
            <div class="avatar-wrapper">
              <div class="avatar-ring"></div>
              <el-avatar :size="90" class="profile-avatar">
                {{ userInfo.name?.charAt(0) || '辅' }}
              </el-avatar>
              <div class="online-dot"></div>
            </div>

            <!-- 姓名和角色 -->
            <div class="profile-name">{{ userInfo.name }}</div>
            <div class="profile-role">
              <el-icon :size="12"><School /></el-icon>
              辅导员
            </div>

            <!-- 标签 -->
            <div class="profile-tags">
              <el-tag size="small" type="success" effect="light" round>
                <el-icon :size="11"><Star /></el-icon>
                优秀辅导员
              </el-tag>
              <el-tag size="small" type="primary" effect="light" round>
                资深
              </el-tag>
            </div>
          </div>

          <!-- 信息列表 -->
          <div class="profile-info">
            <div class="info-item">
              <div class="info-icon" style="background: rgba(99, 102, 241, 0.12); color: #6366f1">
                <el-icon :size="16"><Postcard /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">工号</div>
                <div class="info-value">{{ userInfo.workId }}</div>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon" style="background: rgba(16, 185, 129, 0.12); color: #10b981">
                <el-icon :size="16"><OfficeBuilding /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">所属院系</div>
                <div class="info-value">{{ userInfo.department }}</div>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon" style="background: rgba(245, 158, 11, 0.12); color: #f59e0b">
                <el-icon :size="16"><UserFilled /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">管理班级</div>
                <div class="info-value">{{ userInfo.classCount }} 个班级</div>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon" style="background: rgba(239, 68, 68, 0.12); color: #ef4444">
                <el-icon :size="16"><User /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">性别</div>
                <div class="info-value">{{ userInfo.gender }}</div>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon" style="background: rgba(14, 165, 233, 0.12); color: #0ea5e9">
                <el-icon :size="16"><Phone /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">手机号</div>
                <div class="info-value">{{ userInfo.phone }}</div>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon" style="background: rgba(168, 85, 247, 0.12); color: #a855f7">
                <el-icon :size="16"><Message /></el-icon>
              </div>
              <div class="info-content">
                <div class="info-label">邮箱</div>
                <div class="info-value">{{ userInfo.email }}</div>
              </div>
            </div>
          </div>

          <!-- 编辑按钮 -->
          <el-button type="primary" class="edit-btn" @click="editVisible = true">
            <el-icon><Edit /></el-icon>
            编辑资料
          </el-button>
        </div>
      </el-col>

      <!-- 右侧：修改密码 + 本月概览 -->
      <el-col :span="15">
        <!-- 修改密码 -->
        <div class="section-card card-hover">
          <div class="card-header">
            <div class="header-left">
              <div class="section-icon" style="background: rgba(245, 158, 11, 0.12); color: #f59e0b">
                <el-icon :size="18"><Lock /></el-icon>
              </div>
              <h3 class="card-title">修改密码</h3>
            </div>
            <span class="header-tip">建议定期修改密码以保障账户安全</span>
          </div>

          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px" class="password-form">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入原密码">
                <template #prefix>
                  <el-icon><Key /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码（6-20位）">
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码">
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="submit-btn" @click="updatePassword" :loading="updating">
                <el-icon><Check /></el-icon>
                确认修改
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 本月审批概览 -->
        <div class="section-card card-hover" style="margin-top: 24px">
          <div class="card-header">
            <div class="header-left">
              <div class="section-icon" style="background: rgba(16, 185, 129, 0.12); color: #10b981">
                <el-icon :size="18"><DataLine /></el-icon>
              </div>
              <h3 class="card-title">本月审批概览</h3>
            </div>
            <el-tag type="success" effect="light" size="small">2024年6月</el-tag>
          </div>

          <el-row :gutter="20">
            <el-col :span="6" v-for="(item, index) in monthStats" :key="index">
              <div class="stat-item-card">
                <div class="stat-item-icon" :style="{ background: item.iconBg, color: item.color }">
                  <el-icon :size="22"><component :is="item.icon" /></el-icon>
                </div>
                <div class="stat-item-number" :style="{ color: item.color }">{{ item.value }}</div>
                <div class="stat-item-label">{{ item.label }}</div>
                <div class="stat-item-trend" :class="item.trend">
                  <el-icon :size="12"><TrendCharts v-if="item.trend === 'up'" /><ArrowDown v-else /></el-icon>
                  <span>{{ item.trendText }}</span>
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- 通过率进度条 -->
          <div class="rate-section">
            <div class="rate-header">
              <span class="rate-label">审批通过率</span>
              <span class="rate-value">{{ approvalRate }}%</span>
            </div>
            <el-progress 
              :percentage="approvalRate" 
              :stroke-width="10"
              :show-text="false"
              color="#10b981"
              striped
              striped-flow
            />
            <div class="rate-desc">
              高于平均水平，继续保持！
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 编辑资料弹窗 -->
    <el-dialog v-model="editVisible" title="编辑资料" width="520px" :close-on-click-modal="false" class="edit-dialog">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone">
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email">
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile" :loading="saving">
          <el-icon><Check /></el-icon>
          保存修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Star,
  Postcard,
  OfficeBuilding,
  UserFilled,
  User,
  Phone,
  Message,
  Edit,
  School,
  Lock,
  Key,
  Check,
  DataLine,
  TrendCharts,
  ArrowDown,
  DocumentChecked,
  CircleCheck,
  CircleClose,
  Clock
} from '@element-plus/icons-vue'

const userInfo = ref({
  name: '李辅导员',
  workId: 'F2021001',
  department: '计算机学院',
  classCount: 8,
  gender: '女',
  phone: '138****8888',
  email: 'counselor@school.edu.cn'
})

// 修改密码
const passwordFormRef = ref(null)
const updating = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const updatePassword = async () => {
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return

  updating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (e) {
    ElMessage.error(e.message || '修改失败')
  } finally {
    updating.value = false
  }
}

// 本月统计
const monthApproved = ref(289)
const monthRejected = ref(23)

const approvalRate = computed(() => {
  const total = monthApproved.value + monthRejected.value
  return total > 0 ? Math.round(monthApproved.value / total * 100) : 0
})

const monthStats = [
  { 
    label: '管理班级', 
    value: '8', 
    icon: OfficeBuilding, 
    color: '#6366f1', 
    iconBg: 'rgba(99, 102, 241, 0.15)',
    trend: 'up',
    trendText: '本学期'
  },
  { 
    label: '学生总数', 
    value: '328', 
    icon: UserFilled, 
    color: '#10b981', 
    iconBg: 'rgba(16, 185, 129, 0.15)',
    trend: 'up',
    trendText: '+12人'
  },
  { 
    label: '审批通过', 
    value: '289', 
    icon: CircleCheck, 
    color: '#10b981', 
    iconBg: 'rgba(16, 185, 129, 0.15)',
    trend: 'up',
    trendText: '+45'
  },
  { 
    label: '审批驳回', 
    value: '23', 
    icon: CircleClose, 
    color: '#ef4444', 
    iconBg: 'rgba(239, 68, 68, 0.15)',
    trend: 'down',
    trendText: '-8'
  }
]

// 编辑资料
const editVisible = ref(false)
const saving = ref(false)
const editForm = reactive({
  name: '',
  gender: '',
  phone: '',
  email: ''
})

const saveProfile = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    userInfo.value.name = editForm.name
    userInfo.value.gender = editForm.gender
    userInfo.value.phone = editForm.phone
    userInfo.value.email = editForm.email
    ElMessage.success('保存成功')
    editVisible.value = false
  } catch (e) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  editForm.name = userInfo.value.name
  editForm.gender = userInfo.value.gender
  editForm.phone = userInfo.value.phone
  editForm.email = userInfo.value.email
})
</script>

<style scoped>
.counselor-profile {
  padding: 0;
}
.page-title {
  margin: 0 0 24px 0;
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
}

/* 通用卡片 */
.section-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
}

/* ========== 左侧个人信息卡片 ========== */
.profile-card {
  padding: 0;
  overflow: hidden;
}

.profile-header {
  position: relative;
  padding: 30px 24px 24px;
  text-align: center;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 140px;
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 140px;
  overflow: hidden;
}
.deco-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}
.deco-1 {
  width: 120px;
  height: 120px;
  top: -40px;
  right: -20px;
}
.deco-2 {
  width: 80px;
  height: 80px;
  top: 30px;
  left: -10px;
}
.deco-3 {
  width: 50px;
  height: 50px;
  bottom: -20px;
  right: 60px;
}

/* 头像 */
.avatar-wrapper {
  position: relative;
  display: inline-block;
  z-index: 1;
  margin-top: 10px;
}
.avatar-ring {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%);
  animation: rotate 8s linear infinite;
}
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.profile-avatar {
  position: relative;
  z-index: 2;
  background: #fff;
  border: 4px solid #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  font-size: 36px;
  font-weight: 600;
  color: #10b981;
}
.online-dot {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  background: #10b981;
  border: 3px solid #fff;
  border-radius: 50%;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.5);
}

.profile-name {
  position: relative;
  z-index: 1;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-top: 16px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.profile-role {
  position: relative;
  z-index: 1;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.profile-tags {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}

/* 信息列表 */
.profile-info {
  padding: 0 24px 20px;
}
.info-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s;
}
.info-item:last-child {
  border-bottom: none;
}
.info-item:hover {
  background: #f8fafc;
  margin: 0 -10px;
  padding: 14px 10px;
  border-radius: 8px;
}
.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.info-content {
  flex: 1;
}
.info-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 3px;
}
.info-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

/* 编辑按钮 */
.edit-btn {
  width: calc(100% - 48px);
  margin: 0 24px 24px;
  height: 44px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s;
}
.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
}

/* ========== 右侧卡片 ========== */
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
.section-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.card-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}
.header-tip {
  font-size: 12px;
  color: #94a3b8;
}

/* 修改密码表单 */
.password-form {
  max-width: 480px;
}
.password-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding: 6px 15px;
}
.submit-btn {
  width: 160px;
  height: 42px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s;
}
.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
}

/* 本月统计 */
.stat-item-card {
  text-align: center;
  padding: 20px 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 14px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}
.stat-item-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--card-color, #10b981);
  opacity: 0;
  transition: opacity 0.3s;
}
.stat-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
.stat-item-card:hover::before {
  opacity: 1;
}
.stat-item-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-item-number {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
  line-height: 1.2;
}
.stat-item-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}
.stat-item-trend {
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 20px;
}
.stat-item-trend.up {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}
.stat-item-trend.down {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* 通过率 */
.rate-section {
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.15);
}
.rate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.rate-label {
  font-size: 14px;
  color: #475569;
  font-weight: 500;
}
.rate-value {
  font-size: 20px;
  font-weight: 700;
  color: #10b981;
}
.rate-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 10px;
  text-align: center;
}

/* 编辑弹窗 */
.edit-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
}

/* hover 上浮 */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}
</style>  