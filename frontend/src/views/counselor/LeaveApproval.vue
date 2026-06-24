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
          <el-button @click="resetFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6" v-for="(item, index) in statCards" :key="index">
        <div class="stat-card card-hover" :style="{ '--card-color': item.color }">
          <div class="stat-icon">
            <el-icon :size="22"><component :is="item.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number" :style="{ color: item.color }">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 列表 -->
    <div class="section-card">
      <div class="table-header">
        <h3 class="table-title">请假申请列表</h3>
        <div class="table-actions">
          <el-button type="primary" link @click="loadList">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <el-table :data="list" border stripe class="approval-table">
        <el-table-column label="申请人" width="130">
          <template #default="{ row }">
            <div class="applicant-cell">
              <el-avatar :size="36" class="applicant-avatar">
                {{ row.studentName?.charAt(0) }}
              </el-avatar>
              <div class="applicant-info">
                <div class="applicant-name">{{ row.studentName }}</div>
                <div class="applicant-class">{{ row.className }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="请假类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small" effect="light" round>
              {{ row.typeText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间范围" min-width="200">
          <template #default="{ row }">
            <div class="time-range">
              <div class="time-item">
                <el-icon :size="12" class="time-icon"><Clock /></el-icon>
                <span>{{ formatDateTime(row.startTime) }}</span>
              </div>
              <div class="time-arrow">
                <el-icon :size="14"><ArrowDown /></el-icon>
              </div>
              <div class="time-item">
                <el-icon :size="12" class="time-icon"><Clock /></el-icon>
                <span>{{ formatDateTime(row.endTime) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="天数" width="90" align="center">
          <template #default="{ row }">
            <span class="days-text">{{ row.days }} 天</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="130" align="center">
          <template #default="{ row }">
            <div class="status-cell">
              <span class="status-dot" :class="row.status"></span>
              <el-tag :type="getStatusType(row.status)" size="small" effect="light">
                {{ getStatusText(row.status) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="160" align="center">
          <template #default="{ row }">
            <span class="apply-time">{{ formatDateTime(row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="showDetail(row)">
              <el-icon :size="14"><View /></el-icon>
              详情
            </el-button>
            <el-button 
              v-if="row.status === 'pending_level1'" 
              type="success" 
              link 
              size="small"
              @click="openApproval(row, 'pass')"
            >
              <el-icon :size="14"><CircleCheck /></el-icon>
              通过
            </el-button>
            <el-button 
              v-if="row.status === 'pending_level1'" 
              type="danger" 
              link 
              size="small"
              @click="openApproval(row, 'reject')"
            >
              <el-icon :size="14"><CircleClose /></el-icon>
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
          background
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog 
      v-model="detailVisible" 
      title="请假详情" 
      width="700px"
      :close-on-click-modal="false"
      class="detail-dialog"
    >
      <div v-if="currentDetail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <div class="section-header">
            <div class="section-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981">
              <el-icon :size="18"><User /></el-icon>
            </div>
            <h4 class="section-title">基本信息</h4>
          </div>
          <el-descriptions :column="2" border size="default" class="detail-desc">
            <el-descriptions-item label="申请人">
              <span class="desc-value">{{ currentDetail.studentName }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="班级">
              <span class="desc-value">{{ currentDetail.className }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="请假类型">
              <el-tag :type="getTypeTagType(currentDetail.type)" size="small" effect="light" round>
                {{ currentDetail.typeText }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前状态">
              <el-tag :type="getStatusType(currentDetail.status)" size="small" effect="light" round>
                {{ getStatusText(currentDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="请假天数" :span="2">
              <span class="days-highlight">{{ currentDetail.days }} 天</span>
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
              <div class="reason-text">{{ currentDetail.reason }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 证明材料 -->
        <div class="detail-section" v-if="currentDetail.proofFiles && currentDetail.proofFiles.length">
          <div class="section-header">
            <div class="section-icon" style="background: rgba(99, 102, 241, 0.1); color: #6366f1">
              <el-icon :size="18"><Picture /></el-icon>
            </div>
            <h4 class="section-title">证明材料</h4>
          </div>
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
          <div class="section-header">
            <div class="section-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b">
              <el-icon :size="18"><TrendCharts /></el-icon>
            </div>
            <h4 class="section-title">审批进度</h4>
          </div>
          <div class="timeline-wrapper">
            <el-timeline>
              <el-timeline-item
                v-for="(item, idx) in currentDetail.approvalList"
                :key="idx"
                :timestamp="formatDateTime(item.time)"
                :type="getApprovalResultType(item.result)"
                placement="top"
                :hollow="item.result === 'submit'"
                size="large"
              >
                <div class="approval-item">
                  <div class="approval-header">
                    <span class="approver-name">{{ item.approverName }}</span>
                    <span class="approver-role">（{{ item.roleText }}）</span>
                    <el-tag 
                      :type="getApprovalResultType(item.result)" 
                      size="small" 
                      effect="light"
                      class="approval-tag"
                    >
                      {{ getApprovalResultText(item.result) }}
                    </el-tag>
                  </div>
                  <div v-if="item.opinion" class="approval-opinion">
                    <span class="opinion-label">意见：</span>
                    <span class="opinion-text">{{ item.opinion }}</span>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
      </div>

      <template #footer v-if="currentDetail && currentDetail.status === 'pending_level1'">
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="success" @click="openApproval(currentDetail, 'pass')">
          <el-icon><CircleCheck /></el-icon>
          通过
        </el-button>
        <el-button type="danger" @click="openApproval(currentDetail, 'reject')">
          <el-icon><CircleClose /></el-icon>
          驳回
        </el-button>
      </template>
      <template #footer v-else>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 审批弹窗 -->
    <el-dialog 
      v-model="approvalVisible" 
      :title="approvalType === 'pass' ? '通过请假申请' : '驳回请假申请'" 
      width="500px"
      :close-on-click-modal="false"
      class="approval-dialog"
    >
      <div class="approval-info" v-if="currentApprovalItem">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="申请人">{{ currentApprovalItem.studentName }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ currentApprovalItem.className }}</el-descriptions-item>
          <el-descriptions-item label="请假类型">{{ currentApprovalItem.typeText }}</el-descriptions-item>
          <el-descriptions-item label="请假天数">{{ currentApprovalItem.days }} 天</el-descriptions-item>
        </el-descriptions>
      </div>

      <el-form :model="approvalForm" label-width="80px" style="margin-top: 20px">
        <el-form-item label="审批意见">
          <el-input
            v-model="approvalForm.opinion"
            type="textarea"
            :rows="4"
            :placeholder="approvalType === 'pass' ? '请输入审批意见（选填）' : '请输入驳回原因（必填）'"
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
import {
  Search,
  Refresh,
  Document,
  Clock,
  CircleCheck,
  CircleClose,
  User,
  Picture,
  TrendCharts,
  View,
  ArrowDown
} from '@element-plus/icons-vue'

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
    status: 'pending_level1',
    reason: '感冒发烧，需要去医院检查，医生建议休息两天。',
    proofFiles: [],
    createTime: '2024-06-19 15:30:00',
    approvalList: [
      { approverName: '张三', roleText: '学生', result: 'submit', time: '2024-06-19 15:30:00', opinion: '提交申请' }
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
      { approverName: '我', roleText: '辅导员', result: 'pass', time: '2024-06-14 14:30:00', opinion: '同意' },
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
      { approverName: '我', roleText: '辅导员', result: 'reject', time: '2024-06-09 11:00:00', opinion: '非必要事假，不予批准。' }
    ]
  }
]

// 统计卡片
const statCards = computed(() => [
  { label: '全部申请', value: mockList.length, icon: Document, color: '#6366f1' },
  { label: '待审批', value: mockList.filter(i => i.status.startsWith('pending')).length, icon: Clock, color: '#f59e0b' },
  { label: '已通过', value: mockList.filter(i => i.status === 'approved').length, icon: CircleCheck, color: '#10b981' },
  { label: '已驳回', value: mockList.filter(i => i.status === 'rejected').length, icon: CircleClose, color: '#ef4444' }
])

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

// 审批结果相关（用方法，不用嵌套三元表达式）
const getApprovalResultText = (result) => {
  if (result === 'pass') return '通过'
  if (result === 'reject') return '驳回'
  return '提交申请'
}

const getApprovalResultType = (result) => {
  if (result === 'pass') return 'success'
  if (result === 'reject') return 'danger'
  return 'info'
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
    
    if (approvalType.value === 'pass') {
      ElMessage.success('审批通过')
    } else {
      ElMessage.success('已驳回')
    }
    approvalVisible.value = false
    
    const item = list.value.find(i => i.id === currentApprovalItem.value.id)
    if (item) {
      if (approvalType.value === 'pass') {
        item.status = 'pending_level2'
      } else {
        item.status = 'rejected'
      }
      item.approvalList.push({
        approverName: '我',
        roleText: '辅导员',
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
  margin-right: 14px;
  flex-shrink: 0;
}
.stat-content {
  flex: 1;
}
.stat-number {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 13px;
  color: #94a3b8;
}

/* 表格头部 */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.table-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

/* 申请人单元格 */
.applicant-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.applicant-avatar {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  font-weight: 600;
  flex-shrink: 0;
}
.applicant-info {
  flex: 1;
  min-width: 0;
}
.applicant-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}
.applicant-class {
  font-size: 12px;
  color: #94a3b8;
}

/* 时间范围 */
.time-range {
  font-size: 13px;
  line-height: 1.8;
}
.time-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
}
.time-icon {
  color: #94a3b8;
}
.time-arrow {
  text-align: center;
  color: #cbd5e1;
  margin: 2px 0;
}

/* 天数 */
.days-text {
  font-weight: 600;
  color: #10b981;
  font-size: 14px;
}

/* 状态 */
.status-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
}
.status-dot.pending_level1,
.status-dot.pending_level2 {
  background: #f59e0b;
  animation: pulse 2s ease-in-out infinite;
}
.status-dot.approved {
  background: #10b981;
}
.status-dot.rejected {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.apply-time {
  font-size: 13px;
  color: #64748b;
}

/* 分页 */
.pagination {
  margin-top: 20px;
  text-align: right;
}

/* ========== 详情弹窗 ========== */
.detail-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
}
.detail-section {
  margin-bottom: 28px;
}
.detail-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.section-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.detail-desc :deep(.el-descriptions__label) {
  width: 100px;
  background: #f8fafc;
  color: #64748b;
}
.desc-value {
  font-weight: 500;
  color: #1e293b;
}
.days-highlight {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}
.reason-text {
  line-height: 1.6;
  color: #475569;
}

/* 证明材料 */
.proof-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.proof-img {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}
.proof-img:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 审批进度时间线 */
.timeline-wrapper {
  padding-left: 10px;
}
.approval-item {
  padding: 4px 0;
}
.approval-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.approver-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.approver-role {
  font-size: 12px;
  color: #94a3b8;
}
.approval-tag {
  margin-left: auto;
}
.approval-opinion {
  font-size: 13px;
  color: #64748b;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 8px;
  line-height: 1.5;
}
.opinion-label {
  color: #94a3b8;
}
.opinion-text {
  color: #475569;
}

/* 审批弹窗 */
.approval-info {
  margin-bottom: 10px;
}

/* hover 上浮 */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
</style>