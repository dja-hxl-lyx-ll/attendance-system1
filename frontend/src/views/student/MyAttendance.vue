<template>
  <div class="my-attendance">
    <h3 class="page-title">我的考勤</h3>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-icon" style="background: #409eff">
            <el-icon :size="22"><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ totalDays }}</div>
            <div class="stat-label">应出勤天数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon :size="22"><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-num" style="color: #67c23a">{{ normalDays }}</div>
            <div class="stat-label">正常出勤</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-icon" style="background: #e6a23c">
            <el-icon :size="22"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-num" style="color: #e6a23c">{{ lateDays }}</div>
            <div class="stat-label">迟到</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-icon" style="background: #f56c6c">
            <el-icon :size="22"><CircleClose /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-num" style="color: #f56c6c">{{ absentDays }}</div>
            <div class="stat-label">缺勤</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true">
        <el-form-item label="月份">
          <el-date-picker
            v-model="month"
            type="month"
            placeholder="选择月份"
            style="width: 200px"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="courseFilter" placeholder="全部课程" clearable style="width: 200px">
            <el-option label="计算机网络" value="计算机网络" />
            <el-option label="数据结构" value="数据结构" />
            <el-option label="操作系统" value="操作系统" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="正常" value="normal" />
            <el-option label="迟到" value="late" />
            <el-option label="缺勤" value="absent" />
            <el-option label="请假" value="leave" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadList">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 视图切换 -->
    <div class="view-switch">
      <el-radio-group v-model="viewType">
        <el-radio-button label="list">列表视图</el-radio-button>
        <el-radio-button label="calendar">日历视图</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 列表视图 -->
    <el-card v-if="viewType === 'list'" shadow="hover">
      <el-table :data="list" border stripe>
        <el-table-column prop="date" label="日期" width="130" />
        <el-table-column prop="weekday" label="星期" width="100" />
        <el-table-column prop="courseName" label="课程" width="180" />
        <el-table-column prop="teacherName" label="任课老师" width="130" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="signTime" label="签到时间" width="130">
          <template #default="{ row }">
            {{ row.signTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="classroom" label="教室" width="120" />
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 日历视图 -->
    <el-card v-else shadow="hover">
      <el-calendar v-model="selectedDate">
        <template #date-cell="{ data }">
          <div class="calendar-cell">
            <div class="cell-day">{{ data.day.split('-').slice(2).join('') }}</div>
            <div class="cell-status">
              <el-tag 
                v-if="getDayStatus(data.day)" 
                :type="getStatusType(getDayStatus(data.day))"
                size="small"
                effect="dark"
              >
                {{ getStatusText(getDayStatus(data.day)) }}
              </el-tag>
            </div>
          </div>
        </template>
      </el-calendar>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Calendar,
  CircleCheck,
  Clock,
  CircleClose
} from '@element-plus/icons-vue'
// import { getMyAttendance } from '@/api/attendance'

const viewType = ref('list')
const month = ref('')
const courseFilter = ref('')
const statusFilter = ref('')
const list = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedDate = ref(new Date())

// 模拟数据
const mockList = [
  { date: '2024-06-20', weekday: '周四', courseName: '计算机网络', teacherName: '张老师', status: 'normal', signTime: '08:30:15', classroom: 'A301' },
  { date: '2024-06-19', weekday: '周三', courseName: '数据结构', teacherName: '李老师', status: 'late', signTime: '08:45:22', classroom: 'B202' },
  { date: '2024-06-18', weekday: '周二', courseName: '操作系统', teacherName: '王老师', status: 'absent', signTime: '-', classroom: 'C101' },
  { date: '2024-06-17', weekday: '周一', courseName: '计算机网络', teacherName: '张老师', status: 'normal', signTime: '08:28:30', classroom: 'A301' },
  { date: '2024-06-14', weekday: '周五', courseName: '数据结构', teacherName: '李老师', status: 'leave', signTime: '-', classroom: 'B202' },
  { date: '2024-06-13', weekday: '周四', courseName: '计算机网络', teacherName: '张老师', status: 'normal', signTime: '08:31:05', classroom: 'A301' },
  { date: '2024-06-12', weekday: '周三', courseName: '操作系统', teacherName: '王老师', status: 'normal', signTime: '08:29:18', classroom: 'C101' },
]

// 统计数据
const totalDays = computed(() => 22)
const normalDays = computed(() => mockList.filter(i => i.status === 'normal').length + 15)
const lateDays = computed(() => mockList.filter(i => i.status === 'late').length + 2)
const absentDays = computed(() => mockList.filter(i => i.status === 'absent').length + 1)

// 状态相关
const getStatusText = (status) => {
  const map = {
    normal: '正常',
    late: '迟到',
    absent: '缺勤',
    leave: '请假'
  }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = {
    normal: 'success',
    late: 'warning',
    absent: 'danger',
    leave: 'info'
  }
  return map[status] || ''
}

// 获取某天的考勤状态（日历视图用）
const getDayStatus = (day) => {
  const item = mockList.find(i => i.date === day)
  return item ? item.status : null
}

// 加载列表
const loadList = () => {
  // TODO: 后面换成真实接口
  list.value = mockList
  total.value = 22
}

// 分页
const handlePageChange = (page) => {
  pageNum.value = page
  loadList()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  pageNum.value = 1
  loadList()
}

// 重置筛选
const resetFilter = () => {
  month.value = ''
  courseFilter.value = ''
  statusFilter.value = ''
  pageNum.value = 1
  loadList()
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.my-attendance {
  padding: 20px;
}
.page-title {
  margin: 0 0 20px 0;
  font-size: 20px;
}

.stat-row {
  margin-bottom: 20px;
}
.stat-item {
  display: flex;
  align-items: center;
  padding: 10px;
}
.stat-icon {
  width: 45px;
  height: 45px;
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
.stat-num {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 3px;
}
.stat-label {
  font-size: 13px;
  color: #909399;
}

.filter-card {
  margin-bottom: 20px;
}

.view-switch {
  margin-bottom: 15px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 日历视图 */
.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.cell-day {
  font-size: 16px;
  margin-bottom: 5px;
}
.cell-status {
  font-size: 12px;
}
</style>