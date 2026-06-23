<template>
  <div class="my-leave">
    <h3 class="page-title">我的请假</h3>

    <!-- 筛选区 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true">
        <el-form-item label="状态">
          <el-select v-model="statusFilter" placeholder="全部" clearable style="width: 150px">
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
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
          <el-button type="primary" @click="loadList">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-num">{{ totalCount }}</div>
          <div class="stat-label">全部申请</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-num" style="color: #e6a23c">{{ pendingCount }}</div>
          <div class="stat-label">待审批</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-num" style="color: #67c23a">{{ approvedCount }}</div>
          <div class="stat-label">已通过</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-num" style="color: #f56c6c">{{ rejectedCount }}</div>
          <div class="stat-label">已驳回</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 列表 -->
    <el-card shadow="hover">
      <el-table :data="list" border stripe>
        <el-table-column prop="typeText" label="请假类型" width="120" />
        <el-table-column label="时间范围" min-width="280">
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
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前审批" width="150">
          <template #default="{ row }">
            {{ getCurrentApprover(row.status) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog 
      v-model="detailVisible" 
      title="请假详情" 
      width="650px"
      :close-on-click-modal="false"
    >
      <div v-if="currentDetail">
        <!-- 基本信息 -->
        <el-descriptions :column="2" border class="detail-section">
          <el-descriptions-item label="请假类型">
            {{ currentDetail.typeText }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentDetail.status)">
              {{ getStatusText(currentDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间" :span="2">
            {{ formatDateTime(currentDetail.startTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="结束时间" :span="2">
            {{ formatDateTime(currentDetail.endTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="请假天数">
            {{ currentDetail.days }} 天
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ formatDateTime(currentDetail.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="请假原因" :span="2">
            {{ currentDetail.reason }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 证明材料 -->
        <div class="detail-section" v-if="currentDetail.proofFiles?.length">
          <h4 class="section-title">证明材料</h4>
          <div class="proof-list">
            <el-image
              v-for="(img, idx) in currentDetail.proofFiles"
              :key="idx"
              :src="img"
              :preview-src-list="currentDetail.proofFiles"
              fit="cover"
              class="proof-img"
            />
          </div>
        </div>

        <!-- 审批进度 -->
        <div class="detail-section">
          <h4 class="section-title">审批进度</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(item, idx) in currentDetail.approvalList"
              :key="idx"
              :timestamp="formatDateTime(item.time)"
              :type="item.result === 'pass' ? 'success' : (item.result === 'reject' ? 'danger' : 'primary')"
              placement="top"
            >
              <div class="approval-item">
                <span class="approver-name">{{ item.approverName }}</span>
                <span class="approver-role">（{{ item.roleText }}）</span>
                <span class="approval-result">
                  {{ item.result === 'pass' ? '通过' : (item.result === 'reject' ? '驳回' : '提交') }}
                </span>
                <div v-if="item.opinion" class="approval-opinion">
                  意见：{{ item.opinion }}
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
// import { getMyLeaveList, getLeaveDetail } from '@/api/leave'

const statusFilter = ref('')
const dateRange = ref([])
const list = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const detailVisible = ref(false)
const currentDetail = ref(null)

// 模拟数据
const mockList = [
  {
    id: 1,
    type: 'sick',
    typeText: '病假',
    startTime: '2024-06-20 08:00:00',
    endTime: '2024-06-21 18:00:00',
    days: 2,
    status: 'pending_level1',
    reason: '感冒发烧，需要去医院检查，医生建议休息两天。',
    proofFiles: [],
    createTime: '2024-06-19 15:30:00',
    approvalList: [
      { approverName: '我', roleText: '学生', result: 'submit', time: '2024-06-19 15:30:00', opinion: '提交申请' }
    ]
  },
  {
    id: 2,
    type: 'personal',
    typeText: '事假',
    startTime: '2024-06-15 08:00:00',
    endTime: '2024-06-15 18:00:00',
    days: 1,
    status: 'approved',
    reason: '家里有事，需要回家处理。',
    proofFiles: [],
    createTime: '2024-06-14 10:20:00',
    approvalList: [
      { approverName: '我', roleText: '学生', result: 'submit', time: '2024-06-14 10:20:00', opinion: '提交申请' },
      { approverName: '刘辅导员', roleText: '辅导员', result: 'pass', time: '2024-06-14 14:30:00', opinion: '同意' },
      { approverName: '张老师', roleText: '任课教师', result: 'pass', time: '2024-06-14 16:00:00', opinion: '已了解' }
    ]
  },
  {
    id: 3,
    type: 'personal',
    typeText: '事假',
    startTime: '2024-06-10 08:00:00',
    endTime: '2024-06-12 18:00:00',
    days: 3,
    status: 'rejected',
    reason: '想出去旅游。',
    proofFiles: [],
    createTime: '2024-06-09 09:00:00',
    approvalList: [
      { approverName: '我', roleText: '学生', result: 'submit', time: '2024-06-09 09:00:00', opinion: '提交申请' },
      { approverName: '刘辅导员', roleText: '辅导员', result: 'reject', time: '2024-06-09 11:00:00', opinion: '非必要事假，不予批准，请合理安排时间。' }
    ]
  }
]

// 统计数据
const totalCount = computed(() => mockList.length)
const pendingCount = computed(() => mockList.filter(i => i.status.startsWith('pending')).length)
const approvedCount = computed(() => mockList.filter(i => i.status === 'approved').length)
const rejectedCount = computed(() => mockList.filter(i => i.status === 'rejected').length)

// 状态相关
const getStatusText = (status) => {
  const map = {
    pending_level1: '待辅导员审批',
    pending_level2: '待教师审批',
    approved: '已通过',
    rejected: '已驳回'
  }
  return map[status] || status
}

const getStatusType = (status) => {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  return 'warning'
}

const getCurrentApprover = (status) => {
  const map = {
    pending_level1: '辅导员',
    pending_level2: '任课教师',
    approved: '已完成',
    rejected: '已驳回'
  }
  return map[status] || '-'
}

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

// 加载列表
const loadList = () => {
  // TODO: 后面换成真实接口
  // const res = await getMyLeaveList({
  //   status: statusFilter.value,
  //   pageNum: pageNum.value,
  //   pageSize: pageSize.value
  // })
  // list.value = res.data.list
  // total.value = res.data.total
  
  // 模拟数据
  list.value = mockList
  total.value = mockList.length
}

// 分页变化
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
  statusFilter.value = ''
  dateRange.value = []
  pageNum.value = 1
  loadList()
}

// 查看详情
const showDetail = async (row) => {
  // TODO: 后面换成真实接口
  // const res = await getLeaveDetail(row.id)
  // currentDetail.value = res.data
  
  currentDetail.value = row
  detailVisible.value = true
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.my-leave {
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
  text-align: center;
}
.stat-num {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}
.stat-label {
  font-size: 14px;
  color: #909399;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.detail-section {
  margin-bottom: 25px;
}
.section-title {
  margin: 0 0 15px 0;
  font-size: 15px;
  color: #303133;
}

.proof-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.proof-img {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  cursor: pointer;
}

.approval-item {
  font-size: 14px;
}
.approver-name {
  font-weight: 500;
  color: #303133;
}
.approver-role {
  color: #909399;
  font-size: 13px;
}
.approval-result {
  margin-left: 10px;
  font-weight: 500;
}
.approval-opinion {
  margin-top: 5px;
  color: #606266;
  font-size: 13px;
}
</style>