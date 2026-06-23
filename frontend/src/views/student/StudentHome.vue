<template>
  <div class="student-home">
    <!-- 欢迎语 -->
    <div class="welcome-card">
      <div class="welcome-text">
        <h2>你好，{{ userName }}同学 👋</h2>
        <p>今天也要加油哦~</p>
      </div>
      <div class="welcome-date">
        {{ currentDate }}
      </div>
    </div>

    <!-- 数据卡片 -->
    <el-row :gutter="20" class="card-row">
      <!-- 今日待签到 -->
      <el-col :span="8">
        <el-card class="stat-card" :class="{ 'card-warning': pendingCount > 0 }" shadow="hover">
          <div class="stat-icon" style="background: #e6a23c">
            <el-icon :size="24"><Bell /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ pendingCount }}</div>
            <div class="stat-label">今日待签到</div>
          </div>
          <div class="stat-tip" v-if="pendingCount > 0">
            快去签到吧！
          </div>
        </el-card>
      </el-col>

      <!-- 本月出勤 -->
      <el-col :span="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon :size="24"><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number" style="color: #67c23a">{{ attendDays }}天</div>
            <div class="stat-label">本月出勤</div>
          </div>
        </el-card>
      </el-col>

      <!-- 本月缺勤 -->
      <el-col :span="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #f56c6c">
            <el-icon :size="24"><CircleClose /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number" style="color: #f56c6c">{{ absentDays }}天</div>
            <div class="stat-label">本月缺勤</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-card class="quick-card" shadow="hover">
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
import { ElMessage } from 'element-plus'
import {
  Bell,
  CircleCheck,
  CircleClose,
  EditPen,
  Calendar,
  Document,
  List,
  User
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userName = computed(() => userStore.userInfo?.name || '同学')

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

// 统计数据（先用模拟数据，后面换接口）
const pendingCount = ref(1)
const attendDays = ref(18)
const absentDays = ref(2)

// 快捷入口
const quickList = [
  { name: '签到中心', path: '/student/sign-in', icon: EditPen, color: '#409eff' },
  { name: '我的考勤', path: '/student/my-attendance', icon: Calendar, color: '#67c23a' },
  { name: '请假申请', path: '/student/leave-apply', icon: Document, color: '#e6a23c' },
  { name: '我的请假', path: '/student/my-leave', icon: List, color: '#909399' }
]

// 跳转
const goTo = (path) => {
  router.push(path)
}

// 加载数据（后面换成真实接口）
const loadData = () => {
  // TODO: 调用接口获取真实数据
  // const res = await getHomeData()
  // pendingCount.value = res.data.pendingCount
  // attendDays.value = res.data.attendDays
  // absentDays.value = res.data.absentDays
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.student-home {
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
.card-warning {
  border: 1px solid #e6a23c;
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
.stat-tip {
  font-size: 12px;
  color: #e6a23c;
  margin-top: 5px;
}

/* 快捷入口 */
.quick-card {
  margin-bottom: 20px;
}
.card-title {
  margin: 0 0 20px 0;
  font-size: 16px;
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