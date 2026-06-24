<template>
  <div class="create-sign">
    <h3 class="page-title">发布签到</h3>

    <el-row :gutter="20">
      <!-- 左侧：发布表单 -->
      <el-col :span="10">
        <div class="section-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-dot"></span>
              发起签到
            </h3>
          </div>

          <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
            <el-form-item label="选择课程" prop="courseId">
              <el-select v-model="form.courseId" placeholder="请选择课程" style="width: 100%">
                <el-option label="计算机网络" value="1" />
                <el-option label="数据结构" value="2" />
                <el-option label="操作系统" value="3" />
                <el-option label="软件工程" value="4" />
              </el-select>
            </el-form-item>

            <el-form-item label="选择班级" prop="classId">
              <el-select v-model="form.classId" placeholder="请选择班级" style="width: 100%">
                <el-option label="计科1班" value="1" />
                <el-option label="计科2班" value="2" />
                <el-option label="软工1班" value="3" />
              </el-select>
            </el-form-item>

            <el-form-item label="签到类型" prop="type">
              <div class="sign-type-selector">
                <div 
                  v-for="item in signTypeList" 
                  :key="item.value"
                  class="sign-type-item"
                  :class="{ active: form.type === item.value }"
                  @click="selectSignType(item.value)"
                >
                  <div class="type-icon" :style="{ background: item.iconBg, color: item.color }">
                    <el-icon :size="20"><component :is="item.icon" /></el-icon>
                  </div>
                  <span class="type-name">{{ item.label }}</span>
                  <div class="type-check" v-if="form.type === item.value">
                    <el-icon :size="12"><Check /></el-icon>
                  </div>
                </div>
              </div>
            </el-form-item>

            <!-- 普通签到：签到码 -->
            <template v-if="form.type === 'normal'">
              <el-form-item label="签到码" prop="signCode">
                <div class="sign-code-wrapper">
                  <el-input v-model="form.signCode" placeholder="请输入6位签到码" maxlength="6">
                    <template #append>
                      <el-button @click="generateCode" :icon="Refresh">
                        随机生成
                      </el-button>
                    </template>
                  </el-input>
                </div>
              </el-form-item>
            </template>

            <!-- 手势签到 -->
            <template v-else-if="form.type === 'gesture'">
              <el-form-item label="手势密码">
                <div class="gesture-setting">
                  <div class="gesture-preview">
                    <div class="pattern-grid">
                      <div 
                        v-for="i in 9" 
                        :key="i"
                        class="pattern-dot"
                        :class="{ active: gesturePattern.includes(i) }"
                      >
                        <div class="dot-inner"></div>
                      </div>
                    </div>
                  </div>
                  <div class="gesture-tip">
                    <el-icon :size="14"><InfoFilled /></el-icon>
                    学生需绘制相同手势才能签到
                  </div>
                </div>
              </el-form-item>
            </template>

            <!-- 位置签到 -->
            <template v-else-if="form.type === 'location'">
              <el-form-item label="签到地点" prop="location">
                <el-input v-model="form.location" placeholder="请输入签到地点，如：A301教室">
                  <template #prefix>
                    <el-icon><Location /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="有效范围" prop="radius">
                <el-select v-model="form.radius" placeholder="请选择有效范围" style="width: 100%">
                  <el-option label="50 米" :value="50" />
                  <el-option label="100 米" :value="100" />
                  <el-option label="200 米" :value="200" />
                  <el-option label="500 米" :value="500" />
                </el-select>
              </el-form-item>
            </template>

            <!-- 人脸签到 -->
            <template v-else-if="form.type === 'face'">
              <el-form-item label="识别方式">
                <el-radio-group v-model="form.faceMode">
                  <el-radio value="auto">自动识别</el-radio>
                  <el-radio value="manual">手动确认</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="识别阈值">
                <el-slider 
                  v-model="form.threshold" 
                  :min="50" 
                  :max="99" 
                  :step="1"
                  show-input
                  style="width: 80%"
                />
              </el-form-item>
            </template>

            <el-form-item label="签到时长" prop="duration">
              <el-select v-model="form.duration" placeholder="请选择时长" style="width: 100%">
                <el-option label="5分钟" :value="5" />
                <el-option label="10分钟" :value="10" />
                <el-option label="15分钟" :value="15" />
                <el-option label="30分钟" :value="30" />
                <el-option label="整节课" :value="100" />
              </el-select>
            </el-form-item>

            <el-form-item label="备注">
              <el-input
                v-model="form.remark"
                type="textarea"
                :rows="2"
                placeholder="请输入备注信息（选填）"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" class="submit-btn" @click="handleSubmit" :loading="submitting">
                <el-icon><Promotion /></el-icon>
                发布签到
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>

      <!-- 右侧：进行中的签到 -->
      <el-col :span="14">
        <div class="section-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-dot" style="background: #10b981"></span>
              进行中的签到
            </h3>
            <el-tag type="success" size="small" effect="light">{{ ongoingList.length }} 个进行中</el-tag>
          </div>

          <div class="ongoing-list" v-if="ongoingList.length > 0">
            <div v-for="item in ongoingList" :key="item.id" class="ongoing-item card-hover">
              <div class="ongoing-info">
                <div class="ongoing-course">{{ item.courseName }}</div>
                <div class="ongoing-meta">
                  <span class="meta-item">
                    <el-icon :size="13"><Avatar /></el-icon>
                    {{ item.className }}
                  </span>
                  <span class="meta-item">
                    <el-icon :size="13"><User /></el-icon>
                    {{ item.signedCount }}/{{ item.totalCount }}人
                  </span>
                  <span class="meta-item">
                    <el-icon :size="13"><Clock /></el-icon>
                    剩余 {{ item.remainingTime }}
                  </span>
                </div>
                <div class="sign-type-tag">
                  <el-tag :type="getSignTypeTagType(item.type)" size="small" effect="light">
                    <el-icon :size="11" style="margin-right: 2px">
                      <component :is="getSignTypeIcon(item.type)" />
                    </el-icon>
                    {{ getSignTypeText(item.type) }}
                  </el-tag>
                  <span class="sign-code-text" v-if="item.type === 'normal'">
                    签到码：<b>{{ item.signCode }}</b>
                  </span>
                </div>
              </div>
              <div class="ongoing-action">
                <div class="progress-wrapper">
                  <el-progress 
                    :percentage="Math.round(item.signedCount / item.totalCount * 100)" 
                    :stroke-width="6"
                    :show-text="false"
                    color="#10b981"
                  />
                  <span class="progress-text">{{ Math.round(item.signedCount / item.totalCount * 100) }}%</span>
                </div>
                <el-button type="danger" link @click="endSign(item)">
                  结束签到
                </el-button>
              </div>
            </div>
          </div>

          <el-empty v-else description="暂无进行中的签到" :image-size="80" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Promotion, Refresh, Avatar, User, Clock, Check, 
  Grid, Position, User as UserIcon, InfoFilled, Location 
} from '@element-plus/icons-vue'
// import { createSignIn, getOngoingSignList, endSignIn } from '@/api/attendance'

const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  courseId: '',
  classId: '',
  signCode: '',
  duration: 15,
  type: 'normal',
  location: '',
  radius: 100,
  faceMode: 'auto',
  threshold: 80,
  remark: ''
})

const rules = {
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  signCode: [
    { required: true, message: '请输入签到码', trigger: 'blur' },
    { len: 6, message: '签到码为6位', trigger: 'blur' }
  ],
  duration: [{ required: true, message: '请选择签到时长', trigger: 'change' }]
}

// 签到类型列表
const signTypeList = [
  { value: 'normal', label: '签到码', icon: Grid, color: '#667eea', iconBg: 'rgba(102, 126, 234, 0.15)' },
  { value: 'gesture', label: '手势', icon: Grid, color: '#10b981', iconBg: 'rgba(16, 185, 129, 0.15)' },
  { value: 'location', label: '位置', icon: Position, color: '#f59e0b', iconBg: 'rgba(245, 158, 11, 0.15)' },
  { value: 'face', label: '人脸', icon: UserIcon, color: '#ef4444', iconBg: 'rgba(239, 68, 68, 0.15)' }
]

// 手势预览图案（示例）
const gesturePattern = ref([1, 2, 3, 6, 9])

// 签到类型相关
const signTypeMap = {
  normal: { text: '签到码', icon: Grid, tagType: '' },
  gesture: { text: '手势签到', icon: Grid, tagType: 'success' },
  location: { text: '位置签到', icon: Position, tagType: 'warning' },
  face: { text: '人脸签到', icon: UserIcon, tagType: 'danger' }
}

const getSignTypeText = (type) => signTypeMap[type]?.text || type
const getSignTypeIcon = (type) => signTypeMap[type]?.icon || Grid
const getSignTypeTagType = (type) => signTypeMap[type]?.tagType || ''

// 选择签到类型
const selectSignType = (type) => {
  form.type = type
}

// 进行中的签到列表
const ongoingList = ref([
  {
    id: 1,
    courseName: '数据结构',
    className: '计科2班',
    signCode: '882345',
    signedCount: 38,
    totalCount: 45,
    remainingTime: '08:32',
    startTime: '2024-06-20 10:00:00',
    type: 'normal'
  },
  {
    id: 2,
    courseName: '操作系统',
    className: '软工1班',
    signedCount: 28,
    totalCount: 42,
    remainingTime: '12:45',
    startTime: '2024-06-20 14:00:00',
    type: 'gesture'
  }
])

// 随机生成签到码
const generateCode = () => {
  form.signCode = Math.floor(100000 + Math.random() * 900000).toString()
}

// 提交发布
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('签到发布成功！')
    
    // 添加到进行中列表
    ongoingList.value.unshift({
      id: Date.now(),
      courseName: form.courseId === '1' ? '计算机网络' : (form.courseId === '2' ? '数据结构' : '课程'),
      className: form.classId === '1' ? '计科1班' : (form.classId === '2' ? '计科2班' : '软工1班'),
      signCode: form.signCode,
      signedCount: 0,
      totalCount: 45,
      remainingTime: form.duration + ':00',
      startTime: new Date().toLocaleString(),
      type: form.type
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
  form.radius = 100
  form.faceMode = 'auto'
  form.threshold = 80
}

// 结束签到
const endSign = (item) => {
  ElMessageBox.confirm(`确定要结束「${item.courseName}」的签到吗？`, '提示', {
    confirmButtonText: '确定结束',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = ongoingList.value.findIndex(i => i.id === item.id)
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
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

/* 签到类型选择器 */
.sign-type-selector {
  display: flex;
  gap: 10px;
}
.sign-type-item {
  flex: 1;
  padding: 14px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}
.sign-type-item:hover {
  border-color: #c7d2fe;
  background: #f5f3ff;
  transform: translateY(-2px);
}
.sign-type-item.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
}
.type-icon {
  width: 38px;
  height: 38px;
  margin: 0 auto 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.type-name {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}
.sign-type-item.active .type-name {
  color: #667eea;
  font-weight: 600;
}
.type-check {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  background: #667eea;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 手势设置 */
.gesture-setting {
  display: flex;
  align-items: center;
  gap: 20px;
}
.gesture-preview {
  padding: 15px;
  background: #f8fafc;
  border-radius: 10px;
}
.pattern-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.pattern-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dot-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e2e8f0;
}
.pattern-dot.active {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}
.pattern-dot.active .dot-inner {
  background: #10b981;
}
.gesture-tip {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 发布按钮 */
.submit-btn {
  width: 140px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 进行中列表 */
.ongoing-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ongoing-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 12px;
}

.ongoing-course {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}
.ongoing-meta {
  display: flex;
  gap: 18px;
  margin-bottom: 10px;
}
.meta-item {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sign-type-tag {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sign-code-text {
  font-size: 13px;
  color: #64748b;
}
.sign-code-text b {
  color: #10b981;
  font-size: 16px;
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
}

.ongoing-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  min-width: 150px;
}
.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.progress-wrapper :deep(.el-progress) {
  flex: 1;
}
.progress-text {
  font-size: 13px;
  font-weight: 600;
  color: #10b981;
  min-width: 40px;
  text-align: right;
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