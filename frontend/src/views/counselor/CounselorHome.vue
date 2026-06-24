<template>
  <div class="counselor-home">
    <!-- 欢迎卡片 -->
    <div class="welcome-card">
      <div class="welcome-left">
        <div class="welcome-greeting">
          <h2>你好，{{ userName }}辅导员 👋</h2>
          <p>今日有 {{ pendingCount }} 条请假待审批，辛苦啦~</p>
        </div>
        <div class="welcome-stats">
          <div class="stat-item">
            <span class="stat-label">管理学生</span>
            <span class="stat-value">{{ studentCount }} 人</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">管理班级</span>
            <span class="stat-value">{{ classCount }} 个</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">待审批</span>
            <span class="stat-value" style="color: #fbbf24">{{ pendingCount }} 条</span>
          </div>
        </div>
      </div>
      <div class="welcome-right">
        <div class="date-box">
          <div class="date-day">{{ currentDay }}</div>
          <div class="date-month">{{ currentMonth }}月</div>
          <div class="date-week">星期{{ currentWeek }}</div>
        </div>
      </div>
    </div>

    <!-- 数据卡片 -->
    <el-row :gutter="20" class="card-row">
      <el-col :span="6" v-for="(item, index) in statCards" :key="index">
        <div class="stat-card card-hover" :style="{ '--card-color': item.color }">
          <div class="stat-icon">
            <el-icon :size="24"><component :is="item.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
          <div class="stat-trend" :class="item.trend">
            <el-icon><TrendCharts v-if="item.trend === 'up'" /><ArrowDown v-else /></el-icon>
            <span>{{ item.trendText }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 待审批请假 -->
      <el-col :span="16">
        <div class="section-card card-hover">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-dot" style="background: #f59e0b"></span>
              待审批请假
            </h3>
            <el-button type="primary" link @click="goToApproval">
              查看全部 →
            </el-button>
          </div>

          <div class="pending-list">
            <div v-for="item in pendingList" :key="item.id" class="pending-item">
              <el-avatar :size="40" class="pending-avatar">
                {{ item.studentName?.charAt(0) }}
              </el-avatar>
              <div class="pending-info">
                <div class="pending-top">
                  <span class="pending-name">{{ item.studentName }}</span>
                  <el-tag size="small" :type="getTypeTagType(item.type)" effect="light">
                    {{ item.typeText }}
                  </el-tag>
                  <span class="pending-days">{{ item.days }}天</span>
                </div>
                <div class="pending-bottom">
                  <span class="pending-class">{{ item.className }}</span>
                  <span class="pending-time">{{ item.startTime }} ~ {{ item.endTime }}</span>
                </div>
              </div>
              <div class="pending-actions">
                <el-button type="success" size="small" @click="approve(item)">通过</el-button>
                <el-button type="danger" size="small" plain @click="reject(item)">驳回</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 快捷入口 -->
      <el-col :span="8">
        <div class="section-card card-hover">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-dot"></span>
              快捷入口
            </h3>
          </div>
          <div class="quick-grid">
            <div 
              v-for="item in quickList" 
              :key="item.path" 
              class="quick-item"
              @click="goTo(item.path)"
            >
              <div class="quick-icon" :style="{ background: item.color }">
                <el-icon :size="22"><component :is="item.icon" /></el-icon>
              </div>
              <span class="quick-text">{{ item.name }}</span>
            </div>
          </div>
        </div>

        <!-- 本月审批概览 -->
        <div class="section-card card-hover" style="margin-top: 20px">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-dot" style="background: #10b981"></span>
              本月审批
            </h3>
          </div>
          <div class="month-stats">
            <div class="month-item">
              <div class="month-value success">{{ monthApproved }}</div>
              <div class="month-label">已通过</div>
            </div>
            <div class="month-divider"></div>
            <div class="month-item">
              <div class="month-value danger">{{ monthRejected }}</div>
              <div class="month-label">已驳回</div>
            </div>
          </div>
          <div class="approval-rate">
            <div class="rate-label">通过率</div>
            <el-progress 
              :percentage="approvalRate" 
              :stroke-width="8"
              :show-text="false"
              color="#10b981"
            />
            <span class="rate-value">{{ approvalRate }}%</span>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  User,
  DocumentChecked,
  Avatar,
  UserFilled,
  OfficeBuilding,
  TrendCharts,
  ArrowDown,
  CircleCheck,
  CircleClose
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const userName = computed(() => userStore.userInfo?.name || '辅导员')

// 当前日期
const now = new Date()
const currentDay = now.getDate()
const currentMonth = now.getMonth() + 1
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const currentWeek = weekDays[now.getDay()]

// 统计数据
const studentCount = ref(3256)
const classCount = ref(68)
const pendingCount = ref(5)
const monthApproved = ref(289)
const monthRejected = ref(23)

const approvalRate = computed(() => {
  const total = monthApproved.value + monthRejected.value
  return total > 0 ? Math.round(monthApproved.value / total * 100) : 0
})

// 数据卡片
const statCards = [
  { label: '管理学生', value: '3,256', icon: User, color: '#10b981', trend: 'up', trendText: '较上月 +12' },
  { label: '管理班级', value: '68', icon: OfficeBuilding, color: '#6366f1', trend: 'up', trendText: '本学期' },
  { label: '待审批请假', value: '5', icon: DocumentChecked, color: '#f59e0b', trend: 'down', trendText: '较昨日 -3' },
  { label: '本月已审批', value: '312', icon: CircleCheck, color: '#667eea', trend: 'up', trendText: '较上月 +45' }
]

// 待审批列表
const pendingList = ref([
  { id: 1, studentName: '张三', className: '计科1班', type: 'sick', typeText: '病假', days: 2, startTime: '6月20日', endTime: '6月21日' },
  { id: 2, studentName: '李四', className: '计科2班', type: 'personal', typeText: '事假', days: 1, startTime: '6月21日', endTime: '6月21日' },
  { id: 3, studentName: '王五', className: '软工1班', type: 'other', typeText: '其他', days: 3, startTime: '6月22日', endTime: '6月24日' },
  { id: 4, studentName: '赵六', className: '计科1班', type: 'sick', typeText: '病假', days: 1, startTime: '6月20日', endTime: '6月20日' },
  { id: 5, studentName: '钱七', className: '软工2班', type: 'personal', typeText: '事假', days: 2, startTime: '6月23日', endTime: '6月24日' }
])

// 类型标签颜色
const getTypeTagType = (type) => {
  const map = { sick: 'danger', personal: 'warning', other: 'info' }
  return map[type] || 'info'
}

// 快捷入口
const quickList = [
  { name: '请假审批', path: '/counselor/leave-approval', icon: DocumentChecked, color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  { name: '个人中心', path: '/counselor/profile', icon: UserFilled, color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }
]

const goTo = (path) => {
  router.push(path)
}

const goToApproval = () => {
  router.push('/counselor/leave-approval')
}

const approve = (item) => {
  ElMessage.success('已通过 ' + item.studentName + ' 的请假申请')
  const index = pendingList.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    pendingList.value.splice(index, 1)
    pendingCount.value--
    monthApproved.value++
  }
}

const reject = (item) => {
  ElMessage.info('已驳回 ' + item.studentName + ' 的请假申请')
  const index = pendingList.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    pendingList.value.splice(index, 1)
    pendingCount.value--
    monthRejected.value++
  }
}

onMounted(() => {
  // TODO: 加载真实数据
})
</script>

<style scoped>
.counselor-home {
  padding: 0;
}

/* 欢迎卡片 */
.welcome-card {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  padding: 30px 35px;
  border-radius: 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}
.welcome-card::before {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  right: -50px;
  top: -80px;
}
.welcome-card::after {
  content: '';
  position: absolute;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  right: 100px;
  bottom: -40px;
}

.welcome-left {
  position: relative;
  z-index: 1;
}
.welcome-greeting h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}
.welcome-greeting p {
  margin: 0 0 25px 0;
  opacity: 0.85;
  font-size: 14px;
}

.welcome-stats {
  display: flex;
  align-items: center;
  gap: 25px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-label {
  font-size: 12px;
  opacity: 0.75;
}
.stat-value {
  font-size: 22px;
  font-weight: 600;
}
.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
}

.welcome-right {
  position: relative;
  z-index: 1;
}
.date-box {
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}
.date-day {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}
.date-month {
  font-size: 13px;
  margin-top: 4px;
  opacity: 0.9;
}
.date-week {
  font-size: 12px;
  margin-top: 2px;
  opacity: 0.75;
}

/* 数据卡片行 */
.card-row {
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--card-color);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--card-color);
  opacity: 0.15;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--card-color);
  margin-right: 15px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}
.stat-number {
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 13px;
  color: #94a3b8;
}

.stat-trend {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 2px;
}
.stat-trend.up {
  color: #10b981;
}
.stat-trend.down {
  color: #ef4444;
}

/* 通用卡片 */
.section-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
}
.title-dot {
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #10b981 0%, #059669 100%);
  border-radius: 2px;
}

/* 待审批列表 */
.pending-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pending-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 10px;
  transition: all 0.3s;
}
.pending-item:hover {
  background: #f1f5f9;
}
.pending-avatar {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  flex-shrink: 0;
}
.pending-info {
  flex: 1;
  padding: 0 15px;
  min-width: 0;
}
.pending-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}
.pending-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.pending-days {
  font-size: 12px;
  color: #64748b;
  margin-left: auto;
}
.pending-bottom {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  gap: 15px;
}
.pending-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 快捷入口 */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}
.quick-item {
  text-align: center;
  padding: 20px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8fafc;
}
.quick-item:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}
.quick-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.quick-text {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}

/* 本月审批 */
.month-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
  padding: 15px 0;
  background: #f8fafc;
  border-radius: 10px;
}
.month-item {
  text-align: center;
}
.month-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}
.month-value.success { color: #10b981; }
.month-value.danger { color: #ef4444; }
.month-label {
  font-size: 12px;
  color: #94a3b8;
}
.month-divider {
  width: 1px;
  height: 30px;
  background: #e2e8f0;
}

.approval-rate {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rate-label {
  font-size: 13px;
  color: #64748b;
  flex-shrink: 0;
}
.approval-rate :deep(.el-progress) {
  flex: 1;
}
.rate-value {
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
  min-width: 40px;
  text-align: right;
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