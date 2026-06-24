<template>
  <div class="attendance-stats">
    <h3 class="page-title">考勤统计</h3>

    <!-- 筛选区 -->
    <div class="filter-card section-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="课程">
          <el-select v-model="filterForm.courseId" placeholder="全部课程" clearable style="width: 150px">
            <el-option label="计算机网络" value="1" />
            <el-option label="数据结构" value="2" />
            <el-option label="操作系统" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="filterForm.classId" placeholder="全部班级" clearable style="width: 150px">
            <el-option label="计科1班" value="1" />
            <el-option label="计科2班" value="2" />
            <el-option label="软工1班" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 280px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="success" @click="exportData">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6" v-for="(item, index) in statCards" :key="index">
        <div class="stat-card card-hover" :style="{ '--card-color': item.color }">
          <div class="stat-icon">
            <el-icon :size="24"><component :is="item.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="16">
        <div class="section-card chart-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-dot"></span>
              出勤趋势
            </h3>
          </div>
          <div ref="trendChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="section-card chart-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-dot" style="background: #10b981"></span>
              考勤状态分布
            </h3>
          </div>
          <div ref="pieChartRef" class="chart-container pie-chart"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 学生明细 -->
    <div class="section-card">
      <div class="card-header">
        <h3 class="card-title">
          <span class="title-dot" style="background: #f59e0b"></span>
          学生考勤明细
        </h3>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索学生姓名/学号"
          style="width: 220px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-table :data="studentList" border stripe>
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="totalCount" label="应签到" width="100" align="center" />
        <el-table-column prop="normalCount" label="正常" width="100" align="center">
          <template #default="{ row }">
            <span style="color: #10b981; font-weight: 500">{{ row.normalCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lateCount" label="迟到" width="100" align="center">
          <template #default="{ row }">
            <span style="color: #f59e0b; font-weight: 500">{{ row.lateCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="absentCount" label="缺勤" width="100" align="center">
          <template #default="{ row }">
            <span style="color: #ef4444; font-weight: 500">{{ row.absentCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="leaveCount" label="请假" width="100" align="center">
          <template #default="{ row }">
            <span style="color: #6366f1; font-weight: 500">{{ row.leaveCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="出勤率" width="180">
          <template #default="{ row }">
            <div class="attendance-rate">
              <el-progress 
                :percentage="row.attendanceRate" 
                :stroke-width="8"
                :show-text="false"
                :color="getRateColor(row.attendanceRate)"
              />
              <span class="rate-text" :style="{ color: getRateColor(row.attendanceRate) }">
                {{ row.attendanceRate }}%
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default>
            <el-button type="primary" link size="small">详情</el-button>
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Search, Download, User, Clock, Warning, CircleCheck } from '@element-plus/icons-vue'
// import { getAttendanceStats, getStudentAttendanceList } from '@/api/attendance'

const searchKeyword = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const filterForm = reactive({
  courseId: '',
  classId: '',
  dateRange: []
})

const trendChartRef = ref(null)
const pieChartRef = ref(null)
let trendChart = null
let pieChart = null

// 统计卡片
const statCards = [
  { label: '学生总数', value: '135', icon: User, color: '#6366f1' },
  { label: '出勤率', value: '92.6%', icon: CircleCheck, color: '#10b981' },
  { label: '迟到人次', value: '23', icon: Clock, color: '#f59e0b' },
  { label: '缺勤人次', value: '12', icon: Warning, color: '#ef4444' }
]

// 学生列表
const studentList = ref([
  { studentNo: '2024001', studentName: '张三', className: '计科1班', totalCount: 28, normalCount: 27, lateCount: 1, absentCount: 0, leaveCount: 0, attendanceRate: 96.4 },
  { studentNo: '2024002', studentName: '李四', className: '计科1班', totalCount: 28, normalCount: 25, lateCount: 2, absentCount: 1, leaveCount: 0, attendanceRate: 89.3 },
  { studentNo: '2024003', studentName: '王五', className: '计科1班', totalCount: 28, normalCount: 26, lateCount: 0, absentCount: 0, leaveCount: 2, attendanceRate: 92.9 },
  { studentNo: '2024004', studentName: '赵六', className: '计科2班', totalCount: 28, normalCount: 28, lateCount: 0, absentCount: 0, leaveCount: 0, attendanceRate: 100 },
  { studentNo: '2024005', studentName: '钱七', className: '计科2班', totalCount: 28, normalCount: 24, lateCount: 3, absentCount: 1, leaveCount: 0, attendanceRate: 85.7 },
  { studentNo: '2024006', studentName: '孙八', className: '软工1班', totalCount: 28, normalCount: 26, lateCount: 1, absentCount: 0, leaveCount: 1, attendanceRate: 92.9 },
  { studentNo: '2024007', studentName: '周九', className: '软工1班', totalCount: 28, normalCount: 27, lateCount: 0, absentCount: 0, leaveCount: 1, attendanceRate: 96.4 },
  { studentNo: '2024008', studentName: '吴十', className: '软工1班', totalCount: 28, normalCount: 22, lateCount: 2, absentCount: 4, leaveCount: 0, attendanceRate: 78.6 }
])

// 出勤率颜色
const getRateColor = (rate) => {
  if (rate >= 95) return '#10b981'
  if (rate >= 85) return '#f59e0b'
  return '#ef4444'
}

// 加载数据
const loadData = () => {
  // TODO: 调用真实接口
  total.value = 45
}

// 重置筛选
const resetFilter = () => {
  filterForm.courseId = ''
  filterForm.classId = ''
  filterForm.dateRange = []
  loadData()
}

// 导出
const exportData = () => {
  // TODO: 导出功能
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

// 初始化图表
const initCharts = () => {
  // 趋势图
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    const trendOption = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周'],
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b' }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLabel: { color: '#64748b', formatter: '{value}%' }
      },
      series: [
        {
          name: '出勤率',
          type: 'line',
          smooth: true,
          data: [92, 95, 91, 94, 93, 96, 92.6],
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' }
            ])
          },
          itemStyle: { color: '#667eea' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.02)' }
            ])
          }
        }
      ]
    }
    trendChart.setOption(trendOption)
  }

  // 饼图
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
    const pieOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { color: '#64748b', fontSize: 13 }
      },
      series: [
        {
          name: '考勤状态',
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: { show: false },
          data: [
            { value: 3240, name: '正常出勤', itemStyle: { color: '#10b981' } },
            { value: 23, name: '迟到', itemStyle: { color: '#f59e0b' } },
            { value: 12, name: '缺勤', itemStyle: { color: '#ef4444' } },
            { value: 45, name: '请假', itemStyle: { color: '#6366f1' } }
          ]
        }
      ]
    }
    pieChart.setOption(pieOption)
  }
}

// 响应式
const handleResize = () => {
  trendChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initCharts()
    window.addEventListener('resize', handleResize)
  })
  loadData()
})
</script>

<style scoped>
.attendance-stats {
  padding: 0;
}
.page-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

/* 通用卡片 */
.section-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
}

.filter-card {
  padding: 16px 24px;
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

/* 统计卡片 */
.stat-row {
  margin-bottom: 20px;
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

/* 图表 */
.chart-card {
  margin-bottom: 0;
}
.chart-container {
  width: 100%;
  height: 300px;
}
.pie-chart {
  height: 280px;
}

/* 出勤率 */
.attendance-rate {
  display: flex;
  align-items: center;
  gap: 10px;
}
.attendance-rate :deep(.el-progress) {
  flex: 1;
}
.rate-text {
  font-size: 13px;
  font-weight: 600;
  min-width: 45px;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>