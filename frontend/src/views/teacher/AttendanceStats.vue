<template>
  <div class="attendance-stats">
    <h3 class="page-title">考勤统计</h3>

    <!-- 筛选区 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true">
        <el-form-item label="课程">
          <el-select v-model="courseFilter" placeholder="全部课程" clearable style="width: 200px">
            <el-option label="计算机网络" value="1" />
            <el-option label="数据结构" value="2" />
            <el-option label="操作系统" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="classFilter" placeholder="全部班级" clearable style="width: 200px">
            <el-option label="计科1班" value="1" />
            <el-option label="计科2班" value="2" />
            <el-option label="软工1班" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="success" @click="exportData">导出报表</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-icon" style="background: #409eff">
            <el-icon :size="22"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ totalStudents }}</div>
            <div class="stat-label">学生总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon :size="22"><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-num" style="color: #67c23a">{{ attendanceRate }}%</div>
            <div class="stat-label">出勤率</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-icon" style="background: #e6a23c">
            <el-icon :size="22"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-num" style="color: #e6a23c">{{ lateCount }}</div>
            <div class="stat-label">迟到人次</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-icon" style="background: #f56c6c">
            <el-icon :size="22"><CircleClose /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-num" style="color: #f56c6c">{{ absentCount }}</div>
            <div class="stat-label">缺勤人次</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>出勤趋势</span>
          </template>
          <div ref="chartTrend" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>考勤状态分布</span>
          </template>
          <div ref="chartPie" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 学生考勤明细 -->
    <el-card shadow="hover" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>学生考勤明细</span>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索学生姓名/学号"
            style="width: 250px"
            clearable
          />
        </div>
      </template>

      <el-table :data="studentList" border stripe>
        <el-table-column prop="studentNo" label="学号" width="150" />
        <el-table-column prop="studentName" label="姓名" width="120" />
        <el-table-column prop="className" label="班级" width="150" />
        <el-table-column prop="totalTimes" label="应签到次数" width="120" />
        <el-table-column prop="normalTimes" label="正常签到" width="120">
          <template #default="{ row }">
            <span style="color: #67c23a">{{ row.normalTimes }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lateTimes" label="迟到" width="100">
          <template #default="{ row }">
            <span style="color: #e6a23c">{{ row.lateTimes }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="absentTimes" label="缺勤" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c">{{ row.absentTimes }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="leaveTimes" label="请假" width="100" />
        <el-table-column label="出勤率" width="120">
          <template #default="{ row }">
            <el-progress 
              :percentage="Math.round((row.normalTimes + row.lateTimes) / row.totalTimes * 100)" 
              :stroke-width="10"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small">查看详情</el-button>
          </template>
        </el-table-column>
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
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  User,
  CircleCheck,
  Clock,
  CircleClose
} from '@element-plus/icons-vue'
// import { getAttendanceStats, getStudentAttendanceList } from '@/api/attendance'

const courseFilter = ref('')
const classFilter = ref('')
const dateRange = ref([])
const searchKeyword = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const chartTrend = ref(null)
const chartPie = ref(null)

// 统计数据（模拟）
const totalStudents = ref(135)
const attendanceRate = ref(92.5)
const lateCount = ref(18)
const absentCount = ref(12)

// 学生列表（模拟）
const studentList = ref([
  { studentNo: '2024001', studentName: '张三', className: '计科1班', totalTimes: 20, normalTimes: 18, lateTimes: 1, absentTimes: 1, leaveTimes: 0 },
  { studentNo: '2024002', studentName: '李四', className: '计科1班', totalTimes: 20, normalTimes: 15, lateTimes: 2, absentTimes: 3, leaveTimes: 0 },
  { studentNo: '2024003', studentName: '王五', className: '计科2班', totalTimes: 20, normalTimes: 20, lateTimes: 0, absentTimes: 0, leaveTimes: 0 },
  { studentNo: '2024004', studentName: '赵六', className: '计科2班', totalTimes: 20, normalTimes: 17, lateTimes: 1, absentTimes: 1, leaveTimes: 1 },
  { studentNo: '2024005', studentName: '钱七', className: '软工1班', totalTimes: 20, normalTimes: 16, lateTimes: 2, absentTimes: 2, leaveTimes: 0 },
])

// 加载数据
const loadData = () => {
  // TODO: 调用真实接口
  total.value = 50
  initCharts()
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    // 趋势图
    if (chartTrend.value) {
      const trendChart = echarts.init(chartTrend.value)
      trendChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['出勤率', '缺勤率'] },
        xAxis: {
          type: 'category',
          data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周']
        },
        yAxis: {
          type: 'value',
          max: 100,
          axisLabel: { formatter: '{value}%' }
        },
        series: [
          {
            name: '出勤率',
            type: 'line',
            smooth: true,
            data: [95, 92, 94, 90, 93, 91, 92.5],
            itemStyle: { color: '#67c23a' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
                { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
              ])
            }
          },
          {
            name: '缺勤率',
            type: 'line',
            smooth: true,
            data: [5, 8, 6, 10, 7, 9, 7.5],
            itemStyle: { color: '#f56c6c' }
          }
        ]
      })
    }

    // 饼图
    if (chartPie.value) {
      const pieChart = echarts.init(chartPie.value)
      pieChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: '5%', left: 'center' },
        series: [
          {
            name: '考勤状态',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: { show: false },
            emphasis: {
              label: { show: true, fontSize: 16, fontWeight: 'bold' }
            },
            labelLine: { show: false },
            data: [
              { value: 2490, name: '正常', itemStyle: { color: '#67c23a' } },
              { value: 18, name: '迟到', itemStyle: { color: '#e6a23c' } },
              { value: 12, name: '缺勤', itemStyle: { color: '#f56c6c' } },
              { value: 30, name: '请假', itemStyle: { color: '#909399' } }
            ]
          }
        ]
      })
    }
  })
}

// 分页
const handlePageChange = (page) => {
  pageNum.value = page
  loadData()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  pageNum.value = 1
  loadData()
}

// 重置筛选
const resetFilter = () => {
  courseFilter.value = ''
  classFilter.value = ''
  dateRange.value = []
  searchKeyword.value = ''
  pageNum.value = 1
  loadData()
}

// 导出报表
const exportData = () => {
  // TODO: 导出功能
  alert('导出功能开发中...')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.attendance-stats {
  padding: 20px;
}
.page-title {
  margin: 0 0 20px 0;
  font-size: 20px;
}

.filter-card {
  margin-bottom: 20px;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>