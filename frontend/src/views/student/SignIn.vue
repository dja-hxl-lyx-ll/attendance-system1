<template>
  <div class="sign-in">
    <h3 class="page-title">签到中心</h3>

    <!-- 待签到任务 -->
    <div class="section-card" v-if="pendingList.length > 0">
      <div class="card-header">
        <h3 class="card-title">
          <span class="title-dot" style="background: #f59e0b"></span>
          待签到任务
        </h3>
        <el-tag type="warning" size="small" effect="light">{{ pendingList.length }} 个待签到</el-tag>
      </div>

      <div class="task-list">
        <div v-for="task in pendingList" :key="task.id" class="task-item card-hover">
          <div class="task-info">
            <div class="task-course">{{ task.courseName }}</div>
            <div class="task-meta">
              <span class="meta-item">
                <el-icon :size="14"><User /></el-icon>
                {{ task.teacher }}
              </span>
              <span class="meta-item">
                <el-icon :size="14"><Location /></el-icon>
                {{ task.classroom }}
              </span>
              <span class="meta-item">
                <el-icon :size="14"><Clock /></el-icon>
                剩余 {{ task.remainingTime }}
              </span>
            </div>
            <div class="task-type">
              <el-tag :type="getSignTypeTagType(task.type)" size="small" effect="light">
                <el-icon :size="12" style="margin-right: 3px">
                  <component :is="getSignTypeIcon(task.type)" />
                </el-icon>
                {{ getSignTypeText(task.type) }}
              </el-tag>
            </div>
          </div>
          <div class="task-action">
            <el-button type="primary" size="large" class="sign-btn" @click="openSignDialog(task)">
              立即签到
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 今日已完成 -->
    <div class="section-card" style="margin-top: 20px">
      <div class="card-header">
        <h3 class="card-title">
          <span class="title-dot" style="background: #10b981"></span>
          今日已完成
        </h3>
        <el-tag type="success" size="small" effect="light">{{ finishedList.length }} 个已完成</el-tag>
      </div>

      <div class="task-list" v-if="finishedList.length > 0">
        <div v-for="task in finishedList" :key="task.id" class="task-item finished">
          <div class="task-info">
            <div class="task-course">{{ task.courseName }}</div>
            <div class="task-meta">
              <span class="meta-item">
                <el-icon :size="14"><User /></el-icon>
                {{ task.teacher }}
              </span>
              <span class="meta-item">
                <el-icon :size="14"><Location /></el-icon>
                {{ task.classroom }}
              </span>
            </div>
          </div>
          <div class="task-status">
            <el-tag type="success" size="small" effect="light">
              <el-icon :size="12" style="margin-right: 3px"><CircleCheck /></el-icon>
              已签到
            </el-tag>
            <div class="sign-time">{{ task.signTime }}</div>
          </div>
        </div>
      </div>
      <el-empty v-else description="今日暂无已完成的签到" :image-size="80" />
    </div>

    <!-- 签到弹窗 -->
    <el-dialog 
      v-model="signDialogVisible" 
      :title="getSignTypeText(currentTask?.type) + ' - ' + currentTask?.courseName"
      width="500px"
      :close-on-click-modal="false"
      class="sign-dialog"
    >
      <div v-if="currentTask" class="sign-content">
        <!-- 签到类型提示 -->
        <div class="sign-type-banner" :class="currentTask.type">
          <div class="banner-icon">
            <el-icon :size="32"><component :is="getSignTypeIcon(currentTask.type)" /></el-icon>
          </div>
          <div class="banner-text">
            <div class="banner-title">{{ getSignTypeText(currentTask.type) }}</div>
            <div class="banner-desc">{{ getSignTypeDesc(currentTask.type) }}</div>
          </div>
        </div>

        <!-- 普通签到：输入签到码 -->
        <div v-if="currentTask.type === 'normal'" class="sign-normal">
          <div class="sign-code-input">
            <div class="code-inputs">
              <input 
                v-for="i in 6" 
                :key="i"
                type="text"
                maxlength="1"
                class="code-input"
                :ref="el => codeInputs[i-1] = el"
                v-model="signCode[i-1]"
                @input="handleCodeInput(i-1)"
                @keydown.backspace="handleCodeBackspace(i-1)"
                @keyup.enter="doSign"
              />
            </div>
          </div>
          <div class="sign-tip">
            <el-icon :size="14"><InfoFilled /></el-icon>
            请输入老师提供的6位签到码
          </div>
        </div>

        <!-- 手势签到 -->
        <div v-else-if="currentTask.type === 'gesture'" class="sign-gesture">
          <div class="gesture-pattern">
            <div class="pattern-grid">
              <div 
                v-for="i in 9" 
                :key="i"
                class="pattern-dot"
                :class="{ 
                  active: gesturePattern.includes(i),
                  error: gestureError 
                }"
                @mousedown="startGesture(i)"
                @mouseenter="enterDot(i)"
                @mouseup="endGesture"
                @touchstart.prevent="startGesture(i)"
                @touchmove.prevent="moveGesture"
                @touchend="endGesture"
              >
                <div class="dot-inner"></div>
              </div>
            </div>
            <div class="gesture-tip" :class="{ error: gestureError }">
              {{ gestureError ? '手势错误，请重新绘制' : '请绘制您的解锁手势' }}
            </div>
            <div class="gesture-hint">
              提示：连接至少4个点
            </div>
          </div>
        </div>

        <!-- 位置签到 -->
        <div v-else-if="currentTask.type === 'location'" class="sign-location">
          <div class="location-map">
            <div class="map-placeholder">
              <el-icon :size="48" class="map-icon"><Location /></el-icon>
              <div class="map-text">正在获取位置信息...</div>
            </div>
            <div class="location-range">
              <div class="range-circle"></div>
              <div class="range-marker">
                <el-icon :size="24"><Location /></el-icon>
              </div>
            </div>
          </div>
          <div class="location-info">
            <div class="info-item">
              <span class="info-label">签到地点</span>
              <span class="info-value">{{ currentTask.classroom }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">有效范围</span>
              <span class="info-value">100 米以内</span>
            </div>
            <div class="info-item">
              <span class="info-label">当前位置</span>
              <span class="info-value success">
                <el-icon :size="14"><CircleCheck /></el-icon>
                已在签到范围内
              </span>
            </div>
          </div>
        </div>

        <!-- 人脸签到 -->
        <div v-else-if="currentTask.type === 'face'" class="sign-face">
          <div class="face-camera">
            <div class="camera-frame">
              <div class="camera-placeholder" v-if="!cameraActive">
                <el-icon :size="48"><Camera /></el-icon>
                <div class="camera-text">点击下方按钮开启摄像头</div>
              </div>
              <video v-else ref="videoRef" class="camera-video" autoplay muted playsinline></video>
              <div class="face-scan-line" v-if="cameraActive && scanning"></div>
              <div class="face-corner corner-tl"></div>
              <div class="face-corner corner-tr"></div>
              <div class="face-corner corner-bl"></div>
              <div class="face-corner corner-br"></div>
            </div>
            <div class="face-status">
              <el-tag v-if="!cameraActive" type="info" effect="light">未开启摄像头</el-tag>
              <el-tag v-else-if="scanning" type="warning" effect="light">
                <el-icon class="is-loading"><Loading /></el-icon>
                人脸识别中...
              </el-tag>
              <el-tag v-else type="success" effect="light">
                <el-icon :size="14"><CircleCheck /></el-icon>
                识别成功
              </el-tag>
            </div>
          </div>
          <el-button 
            v-if="!cameraActive" 
            type="primary" 
            class="camera-btn"
            @click="startCamera"
          >
            <el-icon><Camera /></el-icon>
            开启摄像头
          </el-button>
        </div>
      </div>

      <template #footer>
        <el-button @click="signDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="doSign" 
          :loading="signing"
          :disabled="!canSign"
        >
          确认签到
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Clock,
  User,
  Location,
  CircleCheck,
  InfoFilled,
  Camera,
  Loading,
  Grid,
  Position,
  User as UserIcon
} from '@element-plus/icons-vue'
// import { getSignTasks, studentSignIn } from '@/api/attendance'

const signDialogVisible = ref(false)
const currentTask = ref(null)
const signing = ref(false)

// 待签到列表
const pendingList = ref([
  {
    id: 1,
    courseName: '数据结构',
    teacher: '李老师',
    classroom: 'B202',
    remainingTime: '08:32',
    type: 'normal'
  },
  {
    id: 2,
    courseName: '操作系统',
    teacher: '王老师',
    classroom: 'C101',
    remainingTime: '25:00',
    type: 'gesture'
  },
  {
    id: 3,
    courseName: '软件工程',
    teacher: '赵老师',
    classroom: 'A203',
    remainingTime: '45:00',
    type: 'location'
  }
])

// 已完成列表
const finishedList = ref([
  {
    id: 4,
    courseName: '计算机网络',
    teacher: '张老师',
    classroom: 'A301',
    signTime: '08:15',
    type: 'face'
  }
])

// ========== 签到类型相关 ==========
const signTypeMap = {
  normal: { text: '签到码签到', icon: Grid, tagType: '', desc: '输入老师提供的6位数字签到码' },
  gesture: { text: '手势签到', icon: Grid, tagType: 'success', desc: '绘制您的解锁手势完成签到' },
  location: { text: '位置签到', icon: Position, tagType: 'warning', desc: '在教室范围内即可完成签到' },
  face: { text: '人脸签到', icon: UserIcon, tagType: 'danger', desc: '人脸识别验证身份完成签到' }
}

const getSignTypeText = (type) => signTypeMap[type]?.text || type
const getSignTypeIcon = (type) => signTypeMap[type]?.icon || Grid
const getSignTypeTagType = (type) => signTypeMap[type]?.tagType || ''
const getSignTypeDesc = (type) => signTypeMap[type]?.desc || ''

// ========== 普通签到：签到码 ==========
const signCode = reactive(['', '', '', '', '', ''])
const codeInputs = ref([])

const handleCodeInput = (index) => {
  if (signCode[index] && index < 5) {
    nextTick(() => {
      codeInputs.value[index + 1]?.focus()
    })
  }
}

const handleCodeBackspace = (index) => {
  if (!signCode[index] && index > 0) {
    nextTick(() => {
      codeInputs.value[index - 1]?.focus()
    })
  }
}

// ========== 手势签到 ==========
const gesturePattern = ref([])
const gestureError = ref(false)
let isDrawing = false

const startGesture = (dot) => {
  isDrawing = true
  gestureError.value = false
  gesturePattern.value = [dot]
}

const enterDot = (dot) => {
  if (!isDrawing) return
  if (!gesturePattern.value.includes(dot)) {
    gesturePattern.value.push(dot)
  }
}

const endGesture = () => {
  isDrawing = false
  // 模拟：至少4个点才算有效
  if (gesturePattern.value.length < 4) {
    gestureError.value = true
    setTimeout(() => {
      gesturePattern.value = []
      gestureError.value = false
    }, 1000)
  }
}

const moveGesture = (e) => {
  if (!isDrawing) return
  // 简化处理，实际需要计算触摸位置对应的点
}

// ========== 位置签到 ==========
// 模拟已在范围内

// ========== 人脸签到 ==========
const cameraActive = ref(false)
const scanning = ref(false)
const videoRef = ref(null)

const startCamera = async () => {
  try {
    // 模拟开启摄像头
    cameraActive.value = true
    scanning.value = true
    
    // 模拟识别过程
    setTimeout(() => {
      scanning.value = false
      ElMessage.success('人脸识别成功')
    }, 2000)
  } catch (e) {
    ElMessage.error('无法访问摄像头，请检查权限设置')
  }
}

// ========== 是否可以签到 ==========
const canSign = computed(() => {
  if (!currentTask.value) return false
  const type = currentTask.value.type
  if (type === 'normal') {
    return signCode.every(c => c !== '')
  }
  if (type === 'gesture') {
    return gesturePattern.value.length >= 4
  }
  if (type === 'location') {
    return true // 模拟已在范围内
  }
  if (type === 'face') {
    return cameraActive.value && !scanning.value
  }
  return false
})

// ========== 打开签到弹窗 ==========
const openSignDialog = (task) => {
  currentTask.value = task
  signDialogVisible.value = true
  
  // 重置状态
  for (let i = 0; i < 6; i++) signCode[i] = ''
  gesturePattern.value = []
  gestureError.value = false
  cameraActive.value = false
  scanning.value = false
  
  nextTick(() => {
    codeInputs.value[0]?.focus()
  })
}

// ========== 执行签到 ==========
const doSign = async () => {
  if (!canSign.value) {
    ElMessage.warning('请完成签到验证')
    return
  }

  signing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 签到成功，移到已完成列表
    const task = pendingList.value.find(t => t.id === currentTask.value.id)
    if (task) {
      const index = pendingList.value.indexOf(task)
      pendingList.value.splice(index, 1)
      
      const now = new Date()
      finishedList.value.unshift({
        ...task,
        signTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      })
    }
    
    ElMessage.success('签到成功！')
    signDialogVisible.value = false
  } catch (e) {
    ElMessage.error(e.message || '签到失败')
  } finally {
    signing.value = false
  }
}

onMounted(() => {
  // TODO: 加载签到任务列表
})

onUnmounted(() => {
  // 清理摄像头
})
</script>

<style scoped>
.sign-in {
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

/* 任务列表 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.3s;
}
.task-item:hover {
  background: #f1f5f9;
}
.task-item.finished {
  opacity: 0.8;
}

.task-course {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}
.task-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}
.meta-item {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
}
.task-type {
  display: flex;
  gap: 8px;
}

.task-action {
  flex-shrink: 0;
}
.sign-btn {
  width: 120px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-weight: 600;
}

.task-status {
  text-align: right;
  flex-shrink: 0;
}
.sign-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 6px;
}

/* hover 上浮 */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

/* ========== 签到弹窗 ========== */
.sign-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
}

.sign-content {
  padding: 10px 0;
}

/* 签到类型横幅 */
.sign-type-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
}
.sign-type-banner.normal {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}
.sign-type-banner.gesture {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
}
.sign-type-banner.location {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
}
.sign-type-banner.face {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
}

.banner-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  flex-shrink: 0;
}
.sign-type-banner.gesture .banner-icon { color: #10b981; }
.sign-type-banner.location .banner-icon { color: #f59e0b; }
.sign-type-banner.face .banner-icon { color: #ef4444; }

.banner-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}
.banner-desc {
  font-size: 13px;
  color: #64748b;
}

/* ========== 普通签到 ========== */
.sign-normal {
  text-align: center;
  padding: 20px 0;
}
.sign-code-input {
  margin-bottom: 25px;
}
.code-inputs {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.code-input {
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  transition: all 0.3s;
  color: #1e293b;
}
.code-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.sign-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #94a3b8;
}

/* ========== 手势签到 ========== */
.sign-gesture {
  padding: 20px 0;
  text-align: center;
}
.gesture-pattern {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pattern-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 30px;
  background: #f8fafc;
  border-radius: 16px;
  margin-bottom: 20px;
  user-select: none;
}
.pattern-dot {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.dot-inner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: all 0.2s;
}
.pattern-dot.active {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}
.pattern-dot.active .dot-inner {
  background: #10b981;
}
.pattern-dot.error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}
.pattern-dot.error .dot-inner {
  background: #ef4444;
}

.gesture-tip {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
}
.gesture-tip.error {
  color: #ef4444;
}
.gesture-hint {
  font-size: 12px;
  color: #94a3b8;
}

/* ========== 位置签到 ========== */
.sign-location {
  padding: 10px 0;
}
.location-map {
  height: 180px;
  background: linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%);
  border-radius: 12px;
  position: relative;
  margin-bottom: 20px;
  overflow: hidden;
}
.map-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #64748b;
}
.map-icon {
  margin-bottom: 8px;
  opacity: 0.5;
}
.map-text {
  font-size: 13px;
}

.location-range {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.range-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px dashed #10b981;
  background: rgba(16, 185, 129, 0.1);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}
.range-marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #10b981;
}

.location-info {
  background: #f8fafc;
  border-radius: 10px;
  padding: 15px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}
.info-item:last-child {
  border-bottom: none;
}
.info-label {
  font-size: 13px;
  color: #64748b;
}
.info-value {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}
.info-value.success {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ========== 人脸签到 ========== */
.sign-face {
  padding: 10px 0;
  text-align: center;
}
.face-camera {
  margin-bottom: 20px;
}
.camera-frame {
  width: 240px;
  height: 240px;
  margin: 0 auto 15px;
  background: #1e293b;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}
.camera-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #64748b;
}
.camera-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
}
.camera-text {
  font-size: 13px;
}
.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 人脸扫描线 */
.face-scan-line {
  position: absolute;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  animation: scan 2s linear infinite;
}
@keyframes scan {
  0% { top: 10%; }
  50% { top: 90%; }
  100% { top: 10%; }
}

/* 四角装饰 */
.face-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid #10b981;
}
.corner-tl { top: 10px; left: 10px; border-right: none; border-bottom: none; border-radius: 8px 0 0 0; }
.corner-tr { top: 10px; right: 10px; border-left: none; border-bottom: none; border-radius: 0 8px 0 0; }
.corner-bl { bottom: 10px; left: 10px; border-right: none; border-top: none; border-radius: 0 0 0 8px; }
.corner-br { bottom: 10px; right: 10px; border-left: none; border-top: none; border-radius: 0 0 8px 0; }

.face-status {
  display: flex;
  justify-content: center;
}

.camera-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>