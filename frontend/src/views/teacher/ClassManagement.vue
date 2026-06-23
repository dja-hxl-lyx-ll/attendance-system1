<template>
  <div class="class-management">
    <h3 class="page-title">班级管理</h3>

    <!-- 班级列表 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="class-list-card">
          <template #header>
            <div class="card-header">
              <span>我的班级</span>
              <el-tag type="success">{{ classList.length }} 个班</el-tag>
            </div>
          </template>
          
          <div 
            v-for="cls in classList" 
            :key="cls.id"
            class="class-item"
            :class="{ active: currentClass?.id === cls.id }"
            @click="selectClass(cls)"
          >
            <div class="class-name">{{ cls.name }}</div>
            <div class="class-info">
              <span>{{ cls.studentCount }} 人</span>
              <span>出勤率 {{ cls.attendanceRate }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 学生列表 -->
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>{{ currentClass?.name || '请选择班级' }} - 学生名单</span>
              <div>
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索姓名/学号"
                  style="width: 200px; margin-right: 10px"
                  clearable
                />
                <el-button type="primary" @click="addStudent">
                  添加学生
                </el-button>
              </div>
            </div>
          </template>

          <el-table 
            :data="studentList" 
            border 
            stripe 
            v-loading="!currentClass"
            element-loading-text="请选择班级"
          >
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column prop="studentNo" label="学号" width="150" />
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="gender" label="性别" width="100" />
            <el-table-column prop="phone" label="手机号" width="150" />
            <el-table-column prop="email" label="邮箱" min-width="200" />
            <el-table-column label="出勤率" width="120">
              <template #default="{ row }">
                <el-progress 
                  :percentage="row.attendanceRate || 0" 
                  :stroke-width="8"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small">查看</el-button>
                <el-button type="warning" link size="small">编辑</el-button>
                <el-button type="danger" link size="small" @click="deleteStudent(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination" v-if="currentClass">
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
      </el-col>
    </el-row>

    <!-- 添加/编辑学生弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑学生' : '添加学生'" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="studentForm" :rules="studentRules" ref="studentFormRef" label-width="100px">
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
        <el-button type="primary" @click="saveStudent" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// import { getClassList, getStudentList, addStudent, updateStudent, deleteStudent } from '@/api/class'

const searchKeyword = ref('')
const currentClass = ref(null)
const classList = ref([])
const studentList = ref([])
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

// 模拟班级数据
const mockClassList = [
  { id: 1, name: '计科1班', studentCount: 48, attendanceRate: 93.5 },
  { id: 2, name: '计科2班', studentCount: 45, attendanceRate: 91.2 },
  { id: 3, name: '软工1班', studentCount: 42, attendanceRate: 94.8 }
]

// 模拟学生数据
const mockStudentList = [
  { id: 1, studentNo: '2024001', name: '张三', gender: '男', phone: '13800138001', email: 'zhangsan@example.com', attendanceRate: 95 },
  { id: 2, studentNo: '2024002', name: '李四', gender: '男', phone: '13800138002', email: 'lisi@example.com', attendanceRate: 85 },
  { id: 3, studentNo: '2024003', name: '王五', gender: '女', phone: '13800138003', email: 'wangwu@example.com', attendanceRate: 100 },
  { id: 4, studentNo: '2024004', name: '赵六', gender: '男', phone: '13800138004', email: 'zhaoliu@example.com', attendanceRate: 90 },
  { id: 5, studentNo: '2024005', name: '钱七', gender: '女', phone: '13800138005', email: 'qianqi@example.com', attendanceRate: 88 },
]

// 加载班级列表
const loadClassList = () => {
  // TODO: 调用真实接口
  classList.value = mockClassList
  // 默认选中第一个班级
  if (classList.value.length > 0) {
    selectClass(classList.value[0])
  }
}

// 选择班级
const selectClass = (cls) => {
  currentClass.value = cls
  pageNum.value = 1
  loadStudentList()
}

// 加载学生列表
const loadStudentList = () => {
  if (!currentClass.value) return
  // TODO: 调用真实接口
  studentList.value = mockStudentList
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

// 添加学生
const addStudent = () => {
  if (!currentClass.value) {
    ElMessage.warning('请先选择班级')
    return
  }
  isEdit.value = false
  studentForm.id = null
  studentForm.studentNo = ''
  studentForm.name = ''
  studentForm.gender = '男'
  studentForm.phone = ''
  studentForm.email = ''
  dialogVisible.value = true
}

// 删除学生
const deleteStudent = (row) => {
  ElMessageBox.confirm(`确定要删除「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // TODO: 调用真实接口
      // await deleteStudent(row.id)
      
      const index = studentList.value.findIndex(s => s.id === row.id)
      if (index > -1) {
        studentList.value.splice(index, 1)
      }
      ElMessage.success('删除成功')
    } catch (e) {
      ElMessage.error(e.message || '删除失败')
    }
  }).catch(() => {})
}

// 保存学生
const saveStudent = async () => {
  const valid = await studentFormRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    // TODO: 调用真实接口
    // if (isEdit.value) {
    //   await updateStudent(studentForm)
    // } else {
    //   await addStudent({ ...studentForm, classId: currentClass.value.id })
    // }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
    dialogVisible.value = false
    loadStudentList()
  } catch (e) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadClassList()
})
</script>

<style scoped>
.class-management {
  padding: 20px;
}
.page-title {
  margin: 0 0 20px 0;
  font-size: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-list-card {
  height: calc(100vh - 180px);
  overflow-y: auto;
}
.class-item {
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 10px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}
.class-item:hover {
  background: #f5f7fa;
}
.class-item.active {
  background: #ecf5ff;
  border-color: #409eff;
}
.class-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}
.class-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #909399;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>