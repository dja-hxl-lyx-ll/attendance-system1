<template>
  <div class="teacher-home">
    <!-- 欢迎卡片 -->
    <div class="welcome-card">
      <div class="welcome-left">
        <div class="welcome-greeting">
          <h2>你好，{{ userName }}老师 👋</h2>
          <p>今天有 {{ todayClassCount }} 节课，辛苦啦~</p>
        </div>
        <div class="welcome-stats">
          <div class="stat-item">
            <span class="stat-label">学生总数</span>
            <span class="stat-value">{{ studentCount }} 人</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">教授课程</span>
            <span class="stat-value">{{ courseCount }} 门</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-label">待审批请假</span>
            <span class="stat-value" style="color: #f59e0b">{{ pendingLeaveCount }} 条</span>
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

    <!-- 今日课程 + 快捷入口 -->
    <el-row :gutter="20">
      <el-col :span="16">
        <div class="section-card card-hover">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-dot"></span>
              今日课程
            </h3>
            <el-button type="primary" link @click="goToCreateSign">
              发布签到 →
            </el-button>
          </div>
          <div class="course-list">
            <div 
              v-for="course in todayCourseList" 
              :key="course.id" 
              class="course-item"
              :class="{ active: course.status === 'ongoing' }"
            >
              <div class="course-time">
                <div class="time-start">{{ course.startTime }}</div>
                <div class="time-line"></div>
                <div class="time-end">{{ course.endTime }}</div>
              </div>
              <div class="course-info">
                <div class="course-name">{{ course.name }}</div>
                <div class="course-meta">
                  <el-icon :size="14"><Location /></el-icon>
                  <span>{{ course.classroom }}</span>
                  <el-icon :size="14" style="margin-left: 15px"><Avatar /></el-icon>
                  <span>{{ course.className }} · {{ course.studentCount }}人</span>
                </div>
              </div>
              <div class="course-status">
                <el-tag 
                  :type="course.status === 'ongoing' ? 'success' : (course.status === 'finished' ? 'info' : 'warning')"
                  size="small"
                  effect="light"
                >
                  {{ course.statusText }}
                </el-tag>
                <el-button 
                  v-if="course.status === 'ongoing'" 
                  type="primary" 
                  size="small"
                  @click="goToCreateSign"
                >
                  发布签到
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="8">
        <!-- 快捷入口 -->
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

        <!-- 待审批请假 -->
        <div class="section-card card-hover" style="margin-top: 20px">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-dot" style="background: #f59e0b"></span>
              待审批请假
            </h3>
            <el-tag type="warning" size="small" effect="light">{{ pendingLeaveList.length }} 条</el-tag>
          </div>
          <div class="pending-list">
            <div v-for="(item, index) in pendingLeaveList" :key="index" class="pending-item">
              <el-avatar :size="36" class="pending-avatar">
                {{ item.studentName?.charAt(0) }}
              </el-avatar>
              <div class="pending-content">
                <div class="pending-name">
                  {{ item.studentName }}
                  <el-tag size="small" type="info" effect="plain">{{ item.typeText }}</el-tag>
                </div>
                <div class="pending-desc">{{ item.className }} · {{ item.days }}天</div>
              </div>
              <el-button type="primary" link size="small">审批</el-button>
            </div>
          </div>
          <div class="view-all" @click="goToLeaveApproval">
            查看全部 →
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
import {
  User,
  DataAnalysis,
  DocumentChecked,
  Promotion,
  Avatar,
  Location,
  TrendCharts,
  ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const userName = computed(() => userStore.userInfo?.name || '教师')

// 当前日期
const now = new Date()
const currentDay = now.getDate()
const currentMonth = now.getMonth() + 1
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const currentWeek = weekDays[now.getDay()]

// 统计数据
const studentCount = ref(135)
const courseCount = ref(4)
const todayClassCount = ref(4)
const pendingLeaveCount = ref(3)

// 数据卡片
const statCards = [
  { label: '学生总数', value: '135', icon: User, color: '#6366f1', trend: 'up', trendText: '较上月 +5' },
  { label: '教授课程', value: '4门', icon: DataAnalysis, color: '#667eea', trend: 'up', trendText: '本学期' },
  { label: '待审批请假', value: '3', icon: DocumentChecked, color: '#f59e0b', trend: 'down', trendText: '较昨日 -2' },
  { label: '本月缺勤', value: '12', icon: Promotion, color: '#ef4444', trend: 'down', trendText: '较上月 -8' }
]

// 今日课程
const todayCourseList = ref([
  {
    id: 1,
    name: '计算机网络',
    className: '计科1班',
    classroom: 'A301',
    studentCount: 48,
    startTime: '08:00',
    endTime: '09:40',
    status: 'finished',
    statusText: '已结束'
  },
  {
    id: 2,
    name: '数据结构',
    className: '计科2班',
    classroom: 'B202',
    studentCount: 45,
    startTime: '10:00',
    endTime: '11:40',
    status: 'ongoing',
    statusText: '进行中'
  },
  {
    id: 3,
    name: '操作系统',
    className: '软工1班',
    classroom: 'C101',
    studentCount: 42,
    startTime: '14:00',
    endTime: '15:40',
    status: 'pending',
    statusText: '未开始'
  },
  {
    id: 4,
    name: '软件工程',
    className: '计科1班',
    classroom: 'A203',
    studentCount: 48,
    startTime: '16:00',
    endTime: '17:40',
    status: 'pending',
    statusText: '未开始'
  }
])

// 快捷入口
const quickList = [
  { name: '发布签到', path: '/teacher/create-sign', icon: Promotion, color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: '考勤统计', path: '/teacher/attendance-stats', icon: DataAnalysis, color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { name: '请假审批', path: '/teacher/leave-approval', icon: DocumentChecked, color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  { name: '班级管理', path: '/teacher/class-management', icon: Avatar, color: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }
]

// 待审批列表
const pendingLeaveList = ref([
  { id: 1, studentName: '张三', className: '计科1班', typeText: '病假', days: 2 },
  { id: 2, studentName: '李四', className: '计科2班', typeText: '事假', days: 1 },
  { id: 3, studentName: '王五', className: '软工1班', typeText: '其他', days: 3 }
])

const goTo = (path) => {
  router.push(path)
}

const goToCreateSign = () => {
  router.push('/teacher/create-sign')
}

const goToLeaveApproval = () => {
  router.push('/teacher/leave-approval')
}

onMounted(() => {
  // TODO: 加载真实数据
})
</script>

<style scoped>
.teacher-home {
  padding: 0;
}

/* 欢迎卡片 */
.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

/* 课程列表 */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.course-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
  transition: all 0.3s;
  border: 1px solid transparent;
}
.course-item:hover {
  background: #f1f5f9;
}
.course-item.active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%);
  border-color: rgba(16, 185, 129, 0.2);
}

.course-time {
  width: 70px;
  text-align: center;
  flex-shrink: 0;
}
.time-start {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.time-line {
  width: 2px;
  height: 20px;
  background: #e2e8f0;
  margin: 4px auto;
}
.time-end {
  font-size: 13px;
  color: #94a3b8;
}

.course-info {
  flex: 1;
  padding: 0 20px;
}
.course-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
}
.course-meta {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
}

.course-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
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

/* 待审批列表 */
.pending-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 15px;
}
.pending-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.3s;
}
.pending-item:hover {
  background: #f8fafc;
}
.pending-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  flex-shrink: 0;
}
.pending-content {
  flex: 1;
  min-width: 0;
}
.pending-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}
.pending-desc {
  font-size: 12px;
  color: #94a3b8;
}

.view-all {
  text-align: center;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  font-size: 13px;
  color: #667eea;
  cursor: pointer;
  transition: color 0.3s;
}
.view-all:hover {
  color: #764ba2;
}
</style>