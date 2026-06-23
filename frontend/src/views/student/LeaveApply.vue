<template>
  <div class="leave-apply">
    <h3 class="page-title">请假申请</h3>

    <el-card shadow="hover">
      <el-form 
        :model="form" 
        :rules="rules" 
        ref="formRef" 
        label-width="100px"
        style="max-width: 700px"
      >
        <!-- 请假类型 -->
        <el-form-item label="请假类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="personal">事假</el-radio>
            <el-radio value="sick">病假</el-radio>
            <el-radio value="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 开始时间 -->
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 300px"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <!-- 结束时间 -->
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 300px"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <!-- 请假天数（自动计算） -->
        <el-form-item label="请假天数">
          <el-tag type="warning" size="large">
            {{ leaveDays }} 天
          </el-tag>
          <span style="margin-left: 10px; color: #909399; font-size: 13px">
            （系统自动计算）
          </span>
        </el-form-item>

        <!-- 请假原因 -->
        <el-form-item label="请假原因" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="5"
            placeholder="请详细说明请假原因"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- 证明材料上传 -->
        <el-form-item label="证明材料">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :file-list="fileList"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :on-preview="handlePreview"
            :limit="5"
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">
            <el-icon><InfoFilled /></el-icon>
            支持 jpg、png 格式，最多上传5张
          </div>
        </el-form-item>

        <!-- 审批流程说明 -->
        <el-form-item label="审批流程">
          <el-steps :active="0" finish-status="success" size="small">
            <el-step title="提交申请" />
            <el-step title="辅导员审批" />
            <el-step title="任课教师审批" />
            <el-step title="完成" />
          </el-steps>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting" size="large">
            提交申请
          </el-button>
          <el-button @click="resetForm" size="large">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图片预览弹窗 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="600px">
      <img :src="previewUrl" style="width: 100%" />
    </el-dialog>

    <!-- 提交成功弹窗 -->
    <el-dialog v-model="successVisible" title="提交成功" width="400px">
      <div class="success-content">
        <el-icon :size="60" color="#67c23a"><CircleCheckFilled /></el-icon>
        <p style="font-size: 18px; margin: 20px 0">请假申请已提交！</p>
        <p style="color: #909399">请等待辅导员审批，审批进度可在"我的请假"中查看</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="goToMyLeave">查看我的请假</el-button>
        <el-button @click="successVisible = false">继续申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Plus,
  InfoFilled,
  CircleCheckFilled
} from '@element-plus/icons-vue'
// import { submitLeave, uploadProof } from '@/api/leave'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const previewVisible = ref(false)
const previewUrl = ref('')
const successVisible = ref(false)

// 表单数据
const form = reactive({
  type: '',
  startTime: null,
  endTime: null,
  reason: ''
})

// 表单校验规则
const rules = {
  type: [
    { required: true, message: '请选择请假类型', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请填写请假原因', trigger: 'blur' },
    { min: 5, message: '请假原因至少5个字', trigger: 'blur' }
  ]
}

// 上传的文件列表
const fileList = ref([])

// 计算请假天数
const leaveDays = computed(() => {
  if (!form.startTime || !form.endTime) return '0.0'
  const start = new Date(form.startTime).getTime()
  const end = new Date(form.endTime).getTime()
  if (end <= start) return '0.0'
  const days = (end - start) / (1000 * 60 * 60 * 24)
  return days.toFixed(1)
})

// 文件选择变化
const handleFileChange = (file, fileListArr) => {
  // 限制文件大小（比如 5MB）
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.warning('图片大小不能超过 5MB')
    fileListArr.pop()
    return
  }
  fileList.value = fileListArr
}

// 删除文件
const handleFileRemove = (file, fileListArr) => {
  fileList.value = fileListArr
}

// 预览图片
const handlePreview = (file) => {
  previewUrl.value = file.url
  previewVisible.value = true
}

// 提交表单
const submitForm = async () => {
  // 1. 校验表单
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  // 2. 校验时间
  if (new Date(form.endTime) <= new Date(form.startTime)) {
    ElMessage.warning('结束时间必须晚于开始时间')
    return
  }

  // 3. 提交
  submitting.value = true
  try {
    // TODO: 后面换成真实接口
    // 3.1 先上传图片（如果有）
    // let proofFiles = []
    // if (fileList.value.length > 0) {
    //   for (const file of fileList.value) {
    //     const res = await uploadProof(file.raw)
    //     proofFiles.push(res.data.url)
    //   }
    // }
    
    // 3.2 提交请假申请
    // const submitData = {
    //   ...form,
    //   proofFiles: proofFiles.join(',')
    // }
    // await submitLeave(submitData)
    
    // 模拟提交成功
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    successVisible.value = true
  } catch (e) {
    ElMessage.error(e.message || '提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
  fileList.value = []
}

// 跳转到我的请假
const goToMyLeave = () => {
  successVisible.value = false
  router.push('/student/my-leave')
}
</script>

<style scoped>
.leave-apply {
  padding: 20px;
}
.page-title {
  margin: 0 0 20px 0;
  font-size: 20px;
}

.upload-tip {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.success-content {
  text-align: center;
  padding: 20px 0;
}
</style>