<template>
  <div class="leave-approval">
    <h3 class="page-title">请假审批</h3>

    <!-- 筛选区 -->
    <div class="filter-card section-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 130px">
            <el-option label="待审批" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="filterForm.classId" placeholder="全部班级" clearable style="width: 130px">
            <el-option label="计科1班" value="1" />
            <el-option label="计科2班" value="2" />
            <el-option label="软工1班" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="请假类型">
          <el-select v-model="filterForm.type" placeholder="全部类型" clearable style="width: 130px">
            <el-option label="事假" value="personal" />
            <el-option label="病假" value="sick" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadList">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6" v-for="(item, index) in statCards" :key="index">
        <div class="stat-card card-hover" :style="{ '--card-color': item.color }">
          <div class="stat-icon">
            <el-icon :size="20"><component :is="item.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 列表 -->
    <div class="section-card">
      <el-table :data="list" border stripe>
        <el-table-column prop="studentName" label="申请人" width="100" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="typeText" label="请假类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small" effect="light">
              {{ row.typeText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间范围" min-width="220">
          <template #default="{ row }">
            <div class="time-range">
              <div class="time-start">{{ formatDate(row.startTime) }}</div>
              <div class="time-arrow">↓</div>
              <div class="time-end">{{ formatDate(row.endTime) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="days" label="天数" width="80" align="center">
          <template #default="{ row }">
            <span style="font-weight: 600">{{ row.days }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" effect="light">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="showDetail(row)">
              详情
            </el-button>
            <el-button 
              v-if="row.status === 'pending_level2'" 
              type="success" 
              link 
              size="small"
              @click="openApproval(row, 'pass')"
            >
              通过
            </el-button>
            <el-button 
              v-if="row.status === 'pending_level2'" 
              type="danger" 
              link 
              size="small"
              @click="openApproval(row, 'reject')"
            >
              驳回
            </el-button>
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

    <!-- 详情弹窗 -->
    <el-dialog 
      v-model="detailVisible" 
      title="请假详情" 
      width="650px"
      :close-on-click-modal="false"
      class="detail-dialog"
    >
      <div v-if="currentDetail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4 class="section-title">基本信息</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="申请人">{{ currentDetail.studentName }}</el-descriptions-item>
            <el-descriptions-item label="班级">{{ currentDetail.className }}</el-descriptions-item>
            <el-descriptions-item label="请假类型">
              <el-tag :type="getTypeTagType(currentDetail.type)" size="small" effect="light">
                {{ currentDetail.typeText }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(currentDetail.status)" size="small" effect="light">
                {{ getStatusText(currentDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="请假天数" :span="2">
              <span style="font-weight: 600; font-size: 16px; color: #667eea">
                {{ currentDetail.days }} 天
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="开始时间" :span="2">
              {{ formatDateTime(currentDetail.startTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="结束时间" :span="2">
              {{ formatDateTime(currentDetail.endTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="申请时间" :span="2">
              {{ formatDateTime(currentDetail.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="请假原因" :span="2">
              {{ currentDetail.reason }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

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
              :hollow="item.result === 'submit'"
            >
              <div class="approval-item">
                <span class="approver-name">{{ item.approverName }}</span>
                <span class="approver-role">（{{ item.roleText }}）</span>
                <span class="approval-result">
                  {{ item.result === 'pass' ? '通过' : (item.result === 'reject' ? '驳回' : '提交申请') }}
                </span>
                <div v-if="item.opinion" class="approval-opinion">
                  意见：{{ item.opinion }}
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <template #footer v-if="currentDetail?.status === 'pending_level2'">
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="success" @click="openApproval(currentDetail, 'pass')">通过</el-button>
        <el-button type="danger" @click="openApproval(currentDetail, 'reject')">驳回</el-button>
      </template>
      <template #footer v-else>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 审批弹窗 -->
    <el-dialog 
      v-model="approvalVisible" 
      :title="approvalType === 'pass' ? '通过请假' : '驳回请假'" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="approvalForm" label-width="80px">
        <el-form-item label="审批意见">
          <el-input
            v-model="approvalForm.opinion"
            type="textarea"
            :rows="4"
            :placeholder="approvalType === 'pass' ? '请输入审批意见（选填）' : '请输入驳回原因'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approvalVisible = false">取消</el-button>
        <el-button 
          :type="approvalType === 'pass' ? 'success' : 'danger'" 
          @click="doApproval"
          :loading="approving"
        >
          确认{{ approvalType === 'pass' ? '通过' : '驳回' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Document, CircleCheck, CircleClose, Clock } from '@element-plus/icons-vue'
// import { getTeacherLeaveList, getLeaveDetail, teacherApproveLeave } from '@/api/leave'

const filterForm = reactive({
  status: '',
  classId: '',
  type: ''
})

const list = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const detailVisible = ref(false)
const currentDetail = ref(null)

const approvalVisible = ref(false)
const approvalType = ref('pass')
const approving = ref(false)
const currentApprovalItem = ref(null)
const approvalForm = ref({
  opinion: ''
})

// 统计卡片
const statCards = computed(() => [
  { label: '全部申请', value: mockList.length, icon: Document, color: '#6366f1' },
  { label: '待审批', value: mockList.filter(i => i.status.startsWith('pending')).length, icon: Clock, color: '#f59e0b' },
  { label: '已通过', value: mockList.filter(i => i.status === 'approved').length, icon: CircleCheck, color: '#10b981' },
  { label: '已驳回', value: mockList.filter(i => i.status === 'rejected').length, icon: CircleClose, color: '#ef4444' }
])

// 模拟数据
const mockList = [
  {
    id: 1,
    studentName: '张三',
    className: '计科1班',
    type: 'sick',
    typeText: '病假',
    startTime: '2024-06-20 08:00:00',
    endTime: '2024-06-21 18:00:00',
    days: 2,
    status: 'pending_level2',
    reason: '感冒发烧，需要去医院检查，医生建议休息两天。',
    proofFiles: [],
    createTime: '2024-06-19 15:30:00',
    approvalList: [
      { approverName: '张三', roleText: '学生', result: 'submit', time: '2024-06-19 15:30:00', opinion: '提交申请' },
      { approverName: '刘辅导员', roleText: '辅导员', result: 'pass', time: '2024-06-19 16:00:00', opinion: '同意' }
    ]
  },
  {
    id: 2,
    studentName: '李四',
    className: '计科2班',
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
      { approverName: '李四', roleText: '学生', result: 'submit', time: '2024-06-14 10:20:00', opinion: '提交申请' },
      { approverName: '刘辅导员', roleText: '辅导员', result: 'pass', time: '2024-06-14 14:30:00', opinion: '同意' },
      { approverName: '张老师', roleText: '任课教师', result: 'pass', time: '2024-06-14 16:00:00', opinion: '已了解' }
    ]
  },
  {
    id: 3,
    studentName: '王五',
    className: '软工1班',
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
      { approverName: '王五', roleText: '学生', result: 'submit', time: '2024-06-09 09:00:00', opinion: '提交申请' },
      { approverName: '刘辅导员', roleText: '辅导员', result: 'reject', time: '2024-06-09 11:00:00', opinion: '非必要事假，不予批准。' }
    ]
  }
]

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

const getTypeTagType = (type) => {
  const map = {
    sick: 'danger',
    personal: 'warning',
    other: 'info'
  }
  return map[type] || 'info'
}

// 格式化时间
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

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
  list.value = mockList
  total.value = mockList.length
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
  filterForm.status = ''
  filterForm.classId = ''
  filterForm.type = ''
  pageNum.value = 1
  loadList()
}

// 查看详情
const showDetail = (row) => {
  currentDetail.value = row
  detailVisible.value = true
}

// 打开审批弹窗
const openApproval = (row, type) => {
  currentApprovalItem.value = row
  approvalType.value = type
  approvalForm.value.opinion = ''
  detailVisible.value = false
  approvalVisible.value = true
}

// 执行审批
const doApproval = async () => {
  if (approvalType.value === 'reject' && !approvalForm.value.opinion) {
    ElMessage.warning('请填写驳回原因')
    return
  }

  approving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(approvalType.value === 'pass' ? '已通过' : '已驳回')
    approvalVisible.value = false
    
    const item = list.value.find(i => i.id === currentApprovalItem.value.id)
    if (item) {
      item.status = approvalType.value === 'pass' ? 'approved' : 'rejected'
      item.approvalList.push({
        approverName: '我',
        roleText: '任课教师',
        result: approvalType.value,
        time: new Date().toLocaleString(),
        opinion: approvalForm.value.opinion || (approvalType.value === 'pass' ? '同意' : '驳回')
      })
    }
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    approving.value = false
  }
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.leave-approval {
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

/* 统计卡片 */
.stat-row {
  margin-bottom: 20px;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
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
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--card-color);
  opacity: 0.15;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--card-color);
  margin-right: 12px;
  flex-shrink: 0;
}
.stat-content {
  flex: 1;
}
.stat-number {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  margin-bottom: 3px;
}
.stat-label {
  font-size: 12px;
  color: #94a3b8;
}

/* 时间范围 */
.time-range {
  font-size: 13px;
  line-height: 1.6;
}
.time-start {
  color: #1e293b;
  font-weight: 500;
}
.time-arrow {
  color: #cbd5e1;
  font-size: 10px;
}
.time-end {
  color: #64748b;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 详情弹窗 */
.detail-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
}
.detail-section {
  margin-bottom: 25px;
}
.section-title {
  margin: 0 0 15px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  padding-left: 10px;
  border-left: 3px solid #667eea;
}

.proof-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.proof-img {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  cursor: pointer;
}

.approval-item {
  font-size: 14px;
}
.approver-name {
  font-weight: 600;
  color: #1e293b;
}
.approver-role {
  color: #94a3b8;
  font-size: 13px;
}
.approval-result {
  margin-left: 10px;
  font-weight: 500;
}
.approval-opinion {
  margin-top: 5px;
  color: #64748b;
  font-size: 13px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
}
</style>