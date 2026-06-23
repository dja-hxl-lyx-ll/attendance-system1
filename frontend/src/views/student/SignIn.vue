<template>
  <div class="sign-in">
    <h3 class="page-title">签到中心</h3>

    <!-- 可签到任务 -->
    <div class="section">
      <h4 class="section-title">
        <el-icon><Bell /></el-icon>
        待签到
      </h4>
      
      <div v-if="pendingList.length > 0">
        <el-card 
          v-for="task in pendingList" 
          :key="task.id" 
          class="task-card"
          shadow="hover"
        >
          <div class="task-header">
            <div class="course-info">
              <span class="course-name">{{ task.courseName }}</span>
              <el-tag type="success" size="small">进行中</el-tag>
            </div>
            <div class="remain-time">
              剩余 {{ task.remainTime }} 分钟
            </div>
          </div>
          <div class="task-body">
            <div class="task-item">
              <el-icon><User /></el-icon>
              <span>任课老师：{{ task.teacherName }}</span>
            </div>
            <div class="task-item">
              <el-icon><Location /></el-icon>
              <span>教室：{{ task.classroom }}</span>
            </div>
          </div>
          <div class="task-footer">
            <el-button 
              type="primary" 
              @click="openSignDialog(task)"
              :disabled="task.signed"
            >
              {{ task.signed ? '已签到' : '立即签到' }}
            </el-button>
          </div>
        </el-card>
      </div>
      
      <el-empty v-else description="暂无待签到任务" />
    </div>

    <!-- 今日已完成 -->
    <div class="section">
      <h4 class="section-title">
        <el-icon><CircleCheck /></el-icon>
        今日已完成
      </h4>
      
      <div v-if="finishedList.length > 0">
        <el-card 
          v-for="task in finishedList" 
          :key="task.id" 
          class="task-card finished"
          shadow="never"
        >
          <div class="task-header">
            <div class="course-info">
              <span class="course-name">{{ task.courseName }}</span>
              <el-tag :type="task.status === 'normal' ? 'success' : 'warning'" size="small">
                {{ task.status === 'normal' ? '正常签到' : '迟到' }}
              </el-tag>
            </div>
            <div class="sign-time">
              {{ task.signTime }}
            </div>
          </div>
          <div class="task-body">
            <div class="task-item">
              <el-icon><User /></el-icon>
              <span>任课老师：{{ task.teacherName }}</span>
            </div>
          </div>
        </el-card>
      </div>
      
      <el-empty v-else description="今日暂无签到记录" />
    </div>

    <!-- 签到弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="输入签到码" 
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="sign-dialog">
        <div class="sign-course">
          课程：{{ currentTask?.courseName }}
        </div>
        <el-input 
          v-model="signCode" 
          placeholder="请输入6位签到码"
          maxlength="6"
          size="large"
          style="margin: 20px 0"
          @keyup.enter="doSign"
        />
        <div class="sign-tip">
          <el-icon><InfoFilled /></el-icon>
          请向任课老师获取签到码
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="doSign" :loading="signing">
          确认签到
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Bell,
  CircleCheck,
  User,
  Location,
  InfoFilled
} from '@element-plus/icons-vue'
// import { getAvailableTasks, studentSign } from '@/api/attendance'

const dialogVisible = ref(false)
const currentTask = ref(null)
const signCode = ref('')
const signing = ref(false)

// 待签到列表（模拟数据）
const pendingList = ref([
  {
    id: 1,
    courseName: '计算机网络',
    teacherName: '张老师',
    classroom: '教学楼A301',
    remainTime: 5,
    signed: false
  }
])

// 已完成列表（模拟数据）
const finishedList = ref([
  {
    id: 2,
    courseName: '数据结构',
    teacherName: '李老师',
    status: 'normal',
    signTime: '08:30:15'
  },
  {
    id: 3,
    courseName: '操作系统',
    teacherName: '王老师',
    status: 'late',
    signTime: '08:45:22'
  }
])

// 加载签到任务
const loadTasks = async () => {
  // TODO: 后面换成真实接口
  // const res = await getAvailableTasks()
  // pendingList.value = res.data.pending
  // finishedList.value = res.data.finished
}

// 打开签到弹窗
const openSignDialog = (task) => {
  currentTask.value = task
  signCode.value = ''
  dialogVisible.value = true
}

// 执行签到
const doSign = async () => {
  if (!signCode.value) {
    ElMessage.warning('请输入签到码')
    return
  }
  if (signCode.value.length !== 6) {
    ElMessage.warning('签到码为6位数字')
    return
  }

  signing.value = true
  try {
    // TODO: 后面换成真实接口
    // await studentSign(currentTask.value.id, signCode.value)
    
    // 模拟签到成功
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('签到成功！')
    currentTask.value.signed = true
    
    // 移到已完成列表
    const index = pendingList.value.findIndex(t => t.id === currentTask.value.id)
    if (index > -1) {
      const task = pendingList.value.splice(index, 1)[0]
      finishedList.value.unshift({
        ...task,
        status: 'normal',
        signTime: new Date().toLocaleTimeString()
      })
    }
    
    dialogVisible.value = false
  } catch (e) {
    ElMessage.error(e.message || '签到失败')
  } finally {
    signing.value = false
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.sign-in {
  padding: 20px;
}
.page-title {
  margin: 0 0 20px 0;
  font-size: 20px;
}

.section {
  margin-bottom: 30px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
}

.task-card {
  margin-bottom: 15px;
}
.task-card.finished {
  opacity: 0.8;
}
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.course-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.course-name {
  font-size: 18px;
  font-weight: bold;
}
.remain-time {
  color: #e6a23c;
  font-size: 14px;
}
.sign-time {
  color: #909399;
  font-size: 14px;
}
.task-body {
  margin-bottom: 15px;
}
.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}
.task-footer {
  text-align: right;
}

.sign-dialog {
  text-align: center;
}
.sign-course {
  font-size: 16px;
  color: #303133;
  margin-bottom: 10px;
}
.sign-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #909399;
  font-size: 13px;
}
</style>