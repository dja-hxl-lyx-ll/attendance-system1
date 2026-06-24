<template>
  <div class="class-management">
    <h3 class="page-title">班级管理</h3>

    <el-row :gutter="20">
      <!-- 左侧班级列表 -->
      <el-col :span="6">
        <div class="section-card class-list-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-dot"></span>
              班级列表
            </h3>
          </div>
          <div class="class-list">
            <div 
              v-for="item in classList" 
              :key="item.id" 
              class="class-item"
              :class="{ active: currentClassId === item.id }"
              @click="selectClass(item.id)"
            >
              <div class="class-icon">
                <el-icon :size="20"><Avatar /></el-icon>
              </div>
              <div class="class-info">
                <div class="class-name">{{ item.name }}</div>
                <div class="class-meta">{{ item.studentCount }}人 · 出勤率{{ item.attendanceRate }}%</div>
              </div>
              <el-icon :size="16" class="arrow-icon"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧学生列表 -->
      <el-col :span="18">
        <div class="section-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-dot" style="background: #10b981"></span>
              {{ currentClassName }} - 学生名单
            </h3>
            <div class="header-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索姓名/学号"
                style="width: 200px"
                clearable
                size="default"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="openAddDialog">
                <el-icon><Plus /></el-icon>
                添加学生
              </el-button>
            </div>
          </div>

          <el-table :data="studentList" border stripe>
            <el-table-column type="index" label="序号" width="70" align="center" />
            <el-table-column prop="studentNo" label="学号" width="120" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="gender" label="性别" width="80" align="center" />
            <el-table-column prop="phone" label="手机号" width="140" />
            <el-table-column prop="email" label="邮箱" min-width="180" />
            <el-table-column label="出勤率" width="150">
              <template #default="{ row }">
                <div class="attendance-rate">
                  <el-progress 
                    :percentage="row.attendanceRate" 
                    :stroke-width="6"
                    :show-text="false"
                    :color="getRateColor(row.attendanceRate)"
                  />
                  <span class="rate-text" :style="{ color: getRateColor(row.attendanceRate) }">
                    {{ row.attendanceRate }}%
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
                <el-button type="danger" link size="small" @click="deleteStudent(row)">删除</el-button>
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
      </el-col>
    </el-row>

    <!-- 添加/编辑学生弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑学生' : '添加学生'" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="studentForm" :rules="studentRules" ref="studentFormRef" label-width="80px">
        <el-form-item label="学号" prop="studentNo">
          <el-input v-model="studentForm.studentNo" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="studentForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="studentForm.gender">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="studentForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="studentForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStudent" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Avatar, ArrowRight, Search, Plus } from '@element-plus/icons-vue'
// import { getClassList, getStudentList, addStudent, updateStudent, deleteStudent } from '@/api/class'

const searchKeyword = ref('')
const currentClassId = ref(1)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const studentFormRef = ref(null)
const studentForm = reactive({
  id: null,
  studentNo: '',
  name: '',
  gender: '男',
  phone: '',
  email: ''
})

const studentRules = {
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }]
}

// 班级列表
const classList = ref([
  { id: 1, name: '计科1班', studentCount: 48, attendanceRate: 95.2 },
  { id: 2, name: '计科2班', studentCount: 45, attendanceRate: 92.8 },
  { id: 3, name: '软工1班', studentCount: 42, attendanceRate: 94.1 }
])

// 当前班级名
const currentClassName = computed(() => {
  const cls = classList.value.find(c => c.id === currentClassId.value)
  return cls?.name || ''
})

// 学生列表
const studentList = ref([
  { id: 1, studentNo: '2024001', name: '张三', gender: '男', phone: '13800138001', email: 'zhangsan@example.com', attendanceRate: 96.4 },
  { id: 2, studentNo: '2024002', name: '李四', gender: '女', phone: '13800138002', email: 'lisi@example.com', attendanceRate: 89.3 },
  { id: 3, studentNo: '2024003', name: '王五', gender: '男', phone: '13800138003', email: 'wangwu@example.com', attendanceRate: 92.9 },
  { id: 4, studentNo: '2024004', name: '赵六', gender: '女', phone: '13800138004', email: 'zhaoliu@example.com', attendanceRate: 100 },
  { id: 5, studentNo: '2024005', name: '钱七', gender: '男', phone: '13800138005', email: 'qianqi@example.com', attendanceRate: 85.7 },
  { id: 6, studentNo: '2024006', name: '孙八', gender: '男', phone: '13800138006', email: 'sunba@example.com', attendanceRate: 92.9 },
  { id: 7, studentNo: '2024007', name: '周九', gender: '女', phone: '13800138007', email: 'zhoujiu@example.com', attendanceRate: 96.4 },
  { id: 8, studentNo: '2024008', name: '吴十', gender: '男', phone: '13800138008', email: 'wushi@example.com', attendanceRate: 78.6 }
])

// 出勤率颜色
const getRateColor = (rate) => {
  if (rate >= 95) return '#10b981'
  if (rate >= 85) return '#f59e0b'
  return '#ef4444'
}

// 选择班级
const selectClass = (id) => {
  currentClassId.value = id
  pageNum.value = 1
  loadStudentList()
}

// 加载学生列表
const loadStudentList = () => {
  // TODO: 根据班级ID加载
  total.value = 48
}

// 分页
const handlePageChange = (page) => {
  pageNum.value = page
  loadStudentList()
}
const handleSizeChange = (size) => {
  pageSize.value = size
  pageNum.value = 1
  loadStudentList()
}

// 打开添加弹窗
const openAddDialog = () => {
  isEdit.value = false
  studentForm.id = null
  studentForm.studentNo = ''
  studentForm.name = ''
  studentForm.gender = '男'
  studentForm.phone = ''
  studentForm.email = ''
  dialogVisible.value = true
}

// 打开编辑弹窗
const openEditDialog = (row) => {
  isEdit.value = true
  studentForm.id = row.id
  studentForm.studentNo = row.studentNo
  studentForm.name = row.name
  studentForm.gender = row.gender
  studentForm.phone = row.phone
  studentForm.email = row.email
  dialogVisible.value = true
}

// 保存学生
const saveStudent = async () => {
  const valid = await studentFormRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    if (isEdit.value) {
      const item = studentList.value.find(i => i.id === studentForm.id)
      if (item) {
        Object.assign(item, studentForm)
      }
      ElMessage.success('编辑成功')
    } else {
      studentList.value.unshift({
        id: Date.now(),
        ...studentForm,
        attendanceRate: 100
      })
      total.value++
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    saving.value = false
  }
}

// 删除学生
const deleteStudent = (row) => {
  ElMessageBox.confirm(`确定要删除学生「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = studentList.value.findIndex(i => i.id === row.id)
      if (index > -1) {
        studentList.value.splice(index, 1)
        total.value--
      }
      ElMessage.success('删除成功')
    } catch (e) {
      ElMessage.error(e.message || '删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadStudentList()
})
</script>

<style scoped>
.class-management {
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
}

.class-list-card {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

.header-actions {
  display: flex;
  gap: 10px;
}

/* 班级列表 */
.class-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.class-item {
  display: flex;
  align-items: center;
  padding: 14px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}
.class-item:hover {
  background: #f8fafc;
}
.class-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: rgba(102, 126, 234, 0.2);
}

.class-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}
.class-item.active .class-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.class-info {
  flex: 1;
  min-width: 0;
}
.class-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 3px;
}
.class-meta {
  font-size: 12px;
  color: #94a3b8;
}

.arrow-icon {
  color: #cbd5e1;
  flex-shrink: 0;
}
.class-item.active .arrow-icon {
  color: #667eea;
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