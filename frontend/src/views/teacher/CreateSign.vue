<template>
  <div class="create-sign">
    <h3 class="page-title">发布签到</h3>

    <el-card shadow="hover">
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-width="120px"
        style="max-width: 600px"
      >
        <!-- 选择课程 -->
        <el-form-item label="选择课程" prop="courseId">
          <el-select v-model="form.courseId" placeholder="请选择课程" style="width: 100%">
            <el-option 
              v-for="course in courseList" 
              :key="course.id" 
              :label="course.name" 
              :value="course.id" 
            />
          </el-select>
        </el-form-item>

        <!-- 选择班级 -->
        <el-form-item label="选择班级" prop="classId">
          <el-select v-model="form.classId" placeholder="请选择班级" style="width: 100%">
            <el-option 
              v-for="cls in classList" 
              :key="cls.id" 
              :label="cls.name" 
              :value="cls.id" 
            />
          </el-select>
        </el-form-item>

        <!-- 签到码 -->
        <el-form-item label="签到码" prop="signCode">
          <div class="sign-code-section">
            <el-input v-model="form.signCode" placeholder="6位数字签到码" maxlength="6" style="width: 200px" />
            <el-button type="primary" @click="generateCode" style="margin-left: 10px">
              随机生成
            </el-button>
          </div>
          <div class="tip">
            <el-icon><InfoFilled /></el-icon>
            签到码为6位数字，学生需输入此码完成签到
          </div>
        </el-form-item>

        <!-- 签到时长 -->
        <el-form-item label="签到时长" prop="duration">
          <el-input-number v-model="form.duration" :min="1" :max="60" />
          <span style="margin-left: 10px; color: #909399">分钟</span>
        </el-form-item>

        <!-- 签到类型 -->
        <el-form-item label="签到类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="normal">普通签到</el-radio>
            <el-radio value="gps">GPS签到</el-radio>
            <el-radio value="photo">拍照签到</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="可选，填写备注信息"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting" size="large">
            发布签到
          </el-button>
          <el-button @click="resetForm" size="large">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 正在进行的签到 -->
    <el-card shadow="hover" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>正在进行的签到</span>
          <el-tag type="success">{{ ongoingList.length }} 个进行中</el-tag>
        </div>
      </template>
      
      <el-table :data="ongoingList" border stripe v-if="ongoingList.length > 0">
        <el-table-column prop="courseName" label="课程" />
        <el-table-column prop="className" label="班级" width="150" />
        <el-table-column prop="signCode" label="签到码" width="120" />
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="remainTime" label="剩余时间" width="120">
          <template #default="{ row }">
            <span style="color: #e6a23c">{{ row.remainTime }}分钟</span>
          </template>
        </el-table-column>
        <el-table-column prop="signedCount" label="已签到/总人数" width="150">
          <template #default="{ row }">
            {{ row.signedCount }}/{{ row.totalCount }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small">查看详情</el-button>
            <el-button type="danger" link size="small" @click="endSign(row)">结束签到</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-else description="暂无进行中的签到" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
// import { createSignIn, getOngoingSignList, endSignIn } from '@/api/attendance'

const formRef = ref(null)
const submitting = ref(false)

// 表单数据
const form = reactive({
  courseId: '',
  classId: '',
  signCode: '',
  duration: 15,
  type: 'normal',
  remark: ''
})

// 表单校验
const rules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  signCode: [
    { required: true, message: '请输入签到码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '签到码为6位数字', trigger: 'blur' }
  ],
  duration: [{ required: true, message: '请输入签到时长', trigger: 'blur' }],
  type: [{ required: true, message: '请选择签到类型', trigger: 'change' }]
}

// 课程列表（模拟）
const courseList = ref([
  { id: 1, name: '计算机网络' },
  { id: 2, name: '数据结构' },
  { id: 3, name: '操作系统' },
  { id: 4, name: '软件工程' }
])

// 班级列表（模拟）
const classList = ref([
  { id: 1, name: '计科1班' },
  { id: 2, name: '计科2班' },
  { id: 3, name: '软工1班' }
])

// 正在进行的签到列表（模拟）
const ongoingList = ref([
  {
    id: 1,
    courseName: '计算机网络',
    className: '计科2班',
    signCode: '123456',
    startTime: '2024-06-20 08:00:00',
    remainTime: 5,
    signedCount: 42,
    totalCount: 45
  }
])

// 随机生成签到码
const generateCode = () => {
  form.signCode = Math.floor(100000 + Math.random() * 900000).toString()
}

// 提交发布
const submitForm = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    // TODO: 调用真实接口
    // await createSignIn(form)
    
    // 模拟成功
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('签到发布成功！')
    
    // 添加到进行中列表
    const selectedCourse = courseList.value.find(c => c.id === form.courseId)
    const selectedClass = classList.value.find(c => c.id === form.classId)
    ongoingList.value.unshift({
      id: Date.now(),
      courseName: selectedCourse?.name || '',
      className: selectedClass?.name || '',
      signCode: form.signCode,
      startTime: new Date().toLocaleString(),
      remainTime: form.duration,
      signedCount: 0,
      totalCount: 45
    })
    
    resetForm()
  } catch (e) {
    ElMessage.error(e.message || '发布失败')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
  form.duration = 15
  form.type = 'normal'
}

// 结束签到
const endSign = (row) => {
  ElMessageBox.confirm(`确定要结束「${row.courseName}」的签到吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // TODO: 调用真实接口
      // await endSignIn(row.id)
      
      // 模拟成功
      const index = ongoingList.value.findIndex(item => item.id === row.id)
      if (index > -1) {
        ongoingList.value.splice(index, 1)
      }
      ElMessage.success('签到已结束')
    } catch (e) {
      ElMessage.error(e.message || '操作失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  // TODO: 加载进行中的签到列表
})
</script>

<style scoped>
.create-sign {
  padding: 20px;
}
.page-title {
  margin: 0 0 20px 0;
  font-size: 20px;
}

.sign-code-section {
  display: flex;
  align-items: center;
}
.tip {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>