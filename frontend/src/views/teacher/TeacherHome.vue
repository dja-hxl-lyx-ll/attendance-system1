<template>
  <div class="teacher-home">
    <!-- 欢迎语 -->
    <div class="welcome-card">
      <div class="welcome-text">
        <h2>你好，{{ userName }}老师 👋</h2>
        <p>今天有 {{ todayClassCount }} 节课，加油~</p>
      </div>
      <div class="welcome-date">
        {{ currentDate }}
      </div>
    </div>

    <!-- 数据卡片 -->
    <el-row :gutter="20" class="card-row">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #409eff">
            <el-icon :size="24"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ studentCount }}</div>
            <div class="stat-label">学生总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon :size="24"><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number" style="color: #67c23a">{{ courseCount }}</div>
            <div class="stat-label">教授课程</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #e6a23c">
            <el-icon :size="24"><Bell /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number" style="color: #e6a23c">{{ pendingLeave }}</div>
            <div class="stat-label">待审批请假</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #f56c6c">
            <el-icon :size="24"><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number" style="color: #f56c6c">{{ absentCount }}</div>
            <div class="stat-label">本月缺勤人次</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 今日课程 -->
    <el-card class="today-card" shadow="hover">
      <div class="card-header">
        <h3 class="card-title">今日课程</h3>
        <el-button type="primary" link @click="goToCreateSign">
          发布签到 →
        </el-button>
      </div>
      <el-table :data="todayCourseList" border stripe>
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column prop="className" label="班级" width="150" />
        <el-table-column prop="time" label="上课时间" width="180" />
        <el-table-column prop="classroom" label="教室" width="120" />
        <el-table-column prop="studentCount" label="学生人数" width="120" />
        <el-table-column label="签到状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.signStatus === 'ongoing' ? 'success' : 'info'" size="small">
              {{ row.signStatus === 'ongoing' ? '进行中' : '未开始' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 快捷入口 -->
    <el-card class="quick-card" shadow="hover" style="margin-top: 20px">
      <h3 class="card-title">快捷入口</h3>
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in quickList" :key="item.path">
          <div class="quick-item" @click="goTo(item.path)">
            <div class="quick-icon" :style="{ background: item.color }">
              <el-icon :size="28"><component :is="item.icon" /></el-icon>
            </div>
            <div class="quick-text">{{ item.name }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  User,
  CircleCheck,
  Bell,
  Warning,
  EditPen,
  DataAnalysis,
  Document,
  Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userName = computed(() => userStore.userInfo?.name || '教师')

// 当前日期
const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[now.getDay()]
  return `${year}年${month}月${day}日 星期${weekDay}`
})

// 统计数据（模拟）
const studentCount = ref(120)
const courseCount = ref(4)
const pendingLeave = ref(3)
const absentCount = ref(8)
const todayClassCount = ref(2)

// 今日课程（模拟）
const todayCourseList = ref([
  {
    id: 1,
    courseName: '计算机网络',
    className: '计科2班',
    time: '08:00 - 09:40',
    classroom: 'A301',
    studentCount: 45,
    signStatus: 'ongoing'
  },
  {
    id: 2,
    courseName: '数据结构',
    className: '计科1班',
    time: '10:00 - 11:40',
    classroom: 'B202',
    studentCount: 48,
    signStatus: 'pending'
  }
])

// 快捷入口
const quickList = [
  { name: '发布签到', path: '/teacher/create-sign', icon: EditPen, color: '#409eff' },
  { name: '考勤统计', path: '/teacher/attendance-stats', icon: DataAnalysis, color: '#67c23a' },
  { name: '请假审批', path: '/teacher/leave-approval', icon: Document, color: '#e6a23c' },
  { name: '班级管理', path: '/teacher/class-management', icon: User, color: '#909399' }
]

// 跳转
const goTo = (path) => {
  router.push(path)
}

const goToCreateSign = () => {
  router.push('/teacher/create-sign')
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
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.welcome-text h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
}
.welcome-text p {
  margin: 0;
  opacity: 0.9;
}
.welcome-date {
  font-size: 16px;
  opacity: 0.9;
}

/* 数据卡片 */
.card-row {
  margin-bottom: 20px;
}
.stat-card {
  display: flex;
  align-items: center;
  padding: 10px;
}
.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-right: 15px;
}
.stat-info {
  flex: 1;
}
.stat-number {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}
.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 今日课程 */
.today-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.card-title {
  margin: 0;
  font-size: 16px;
}

/* 快捷入口 */
.quick-card {
  margin-bottom: 20px;
}
.quick-item {
  text-align: center;
  cursor: pointer;
  padding: 15px;
  border-radius: 8px;
  transition: all 0.3s;
}
.quick-item:hover {
  background: #f5f7fa;
  transform: translateY(-3px);
}
.quick-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin: 0 auto 10px;
}
.quick-text {
  font-size: 14px;
  color: #606266;
}
</style>