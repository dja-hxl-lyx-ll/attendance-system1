<template>
  <div class="counselor-home">
    <!-- 欢迎语 -->
    <div class="welcome-card">
      <div class="welcome-text">
        <h2>你好，{{ userName }}老师 👋</h2>
        <p>今天有 {{ pendingCount }} 条请假待审批，加油~</p>
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
            <div class="stat-label">管理学生数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #e6a23c">
            <el-icon :size="24"><Bell /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number" style="color: #e6a23c">{{ pendingCount }}</div>
            <div class="stat-label">待审批请假</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon :size="24"><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number" style="color: #67c23a">{{ approvedCount }}</div>
            <div class="stat-label">本月已通过</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #f56c6c">
            <el-icon :size="24"><CircleClose /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number" style="color: #f56c6c">{{ rejectedCount }}</div>
            <div class="stat-label">本月已驳回</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待审批请假列表 -->
    <el-card class="pending-card" shadow="hover">
      <div class="card-header">
        <h3 class="card-title">待审批请假</h3>
        <el-button type="primary" link @click="goToApproval">
          查看全部 →
        </el-button>
      </div>
      
      <el-table :data="pendingList" border stripe v-if="pendingList.length > 0">
        <el-table-column prop="studentName" label="申请人" width="120" />
        <el-table-column prop="className" label="班级" width="150" />
        <el-table-column prop="typeText" label="请假类型" width="100" />
        <el-table-column label="时间范围" min-width="250">
          <template #default="{ row }">
            <div>{{ formatDateTime(row.startTime) }}</div>
            <div style="color: #909399; font-size: 12px">
              至 {{ formatDateTime(row.endTime) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="days" label="天数" width="100">
          <template #default="{ row }">
            {{ row.days }} 天
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="success" link size="small" @click="openApproval(row, 'pass')">
              通过
            </el-button>
            <el-button type="danger" link size="small" @click="openApproval(row, 'reject')">
              驳回
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-else description="暂无待审批请假" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Bell,
  CircleCheck,
  CircleClose,
  Document,
  Setting
} from '@element-plus/icons-vue'
// import { getCounselorStats, getPendingLeaveList, approveLeave } from '@/api/leave'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userName = computed(() => userStore.userInfo?.name || '辅导员')

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
const studentCount = ref(300)
const pendingCount = ref(3)
const approvedCount = ref(28)
const rejectedCount = ref(5)

// 待审批列表（模拟）
const pendingList = ref([
  {
    id: 1,
    studentName: '张三',
    className: '计科1班',
    typeText: '病假',
    startTime: '2024-06-20 08:00:00',
    endTime: '2024-06-21 18:00:00',
    days: 2,
    createTime: '2024-06-19 15:30:00'
  },
  {
    id: 2,
    studentName: '李四',
    className: '计科2班',
    typeText: '事假',
    startTime: '2024-06-22 08:00:00',
    endTime: '2024-06-22 18:00:00',
    days: 1,
    createTime: '2024-06-20 10:20:00'
  },
  {
    id: 3,
    studentName: '王五',
    className: '软工1班',
    typeText: '其他',
    startTime: '2024-06-25 08:00:00',
    endTime: '2024-06-27 18:00:00',
    days: 3,
    createTime: '2024-06-20 09:00:00'
  }
])

// 快捷入口
const quickList = [
  { name: '请假审批', path: '/counselor/leave-approval', icon: Document, color: '#e6a23c' },
  { name: '个人中心', path: '/counselor/profile', icon: Setting, color: '#909399' }
]

// 格式化时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 跳转
const goTo = (path) => {
  router.push(path)
}

const goToApproval = () => {
  router.push('/counselor/leave-approval')
}

// 打开审批弹窗
const openApproval = (row, type) => {
  const action = type === 'pass' ? '通过' : '驳回'
  ElMessageBox.prompt(`请输入${action}意见`, `${action}请假`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: type === 'pass' ? '选填' : '请填写驳回原因',
    inputValidator: (value) => {
      if (type === 'reject' && !value) {
        return '请填写驳回原因'
      }
      return true
    }
  }).then(async ({ value }) => {
    try {
      // TODO: 调用真实接口
      // await approveLeave({
      //   id: row.id,
      //   result: type,
      //   opinion: value || (type === 'pass' ? '同意' : '驳回')
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      ElMessage.success(`已${action}`)
      
      // 从列表中移除
      const index = pendingList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        pendingList.value.splice(index, 1)
        pendingCount.value--
      }
      
      if (type === 'pass') {
        approvedCount.value++
      } else {
        rejectedCount.value++
      }
    } catch (e) {
      ElMessage.error(e.message || '操作失败')
    }
  }).catch(() => {})
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

/* 待审批列表 */
.pending-card {
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