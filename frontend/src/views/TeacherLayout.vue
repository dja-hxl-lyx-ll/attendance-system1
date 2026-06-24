<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
      <div class="logo-section">
        <div class="logo-icon">
          <el-icon :size="22"><School /></el-icon>
        </div>
        <span v-if="!isCollapse" class="logo-text">教师工作台</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="sidebar-menu"
        background-color="transparent"
        text-color="#94a3b8"
        active-text-color="#667eea"
      >
        <el-menu-item index="/teacher/home">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        <el-menu-item index="/teacher/create-sign">
          <el-icon><Promotion /></el-icon>
          <template #title>发布签到</template>
        </el-menu-item>
        <el-menu-item index="/teacher/attendance-stats">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>考勤统计</template>
        </el-menu-item>
        <el-menu-item index="/teacher/leave-approval">
          <el-icon><DocumentChecked /></el-icon>
          <template #title>请假审批</template>
          <el-badge v-if="pendingCount > 0" :value="pendingCount" class="menu-badge" />
        </el-menu-item>
        <el-menu-item index="/teacher/class-management">
          <el-icon><Avatar /></el-icon>
          <template #title>班级管理</template>
        </el-menu-item>
        <el-menu-item index="/teacher/profile">
          <el-icon><User /></el-icon>
          <template #title>个人中心</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧主区域 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" :size="20" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/teacher/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-badge :value="pendingCount" class="notification-badge">
            <el-icon :size="20" class="header-icon"><Bell /></el-icon>
          </el-badge>
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-dropdown">
              <el-avatar :size="32" class="user-avatar">
                {{ userStore.userInfo?.name?.charAt(0) || '教' }}
              </el-avatar>
              <div class="user-info">
                <div class="user-name">{{ userStore.userInfo?.name || '教师' }}</div>
                <div class="user-role">教师</div>
              </div>
              <el-icon :size="14" class="arrow-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  HomeFilled,
  Promotion,
  DataAnalysis,
  DocumentChecked,
  Avatar,
  User,
  School,
  Bell,
  ArrowDown,
  Fold,
  Expand,
  SwitchButton
} from '@element-plus/icons-vue'
// import { getPendingLeaveCount } from '@/api/leave'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const pendingCount = ref(3)

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta?.title || '')

const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/teacher/profile')
  } else if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      router.push('/login')
      ElMessage.success('已退出登录')
    }).catch(() => {})
  }
}

onMounted(() => {
  // TODO: 加载待审批数量
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background: #f1f5f9;
}

/* 侧边栏 */
.aside {
  background: #1e293b;
  color: #fff;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.logo-section {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}
.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.logo-text {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
  padding: 12px 8px;
  flex: 1;
  position: relative;
}
.sidebar-menu :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  border-radius: 8px;
  margin-bottom: 4px;
  font-size: 14px;
}
.sidebar-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}
.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  color: #818cf8;
}
.sidebar-menu :deep(.el-menu-item .el-icon) {
  font-size: 18px;
}

.menu-badge {
  margin-left: 8px;
}

/* 顶部栏 */
.header {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px !important;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.collapse-btn {
  cursor: pointer;
  color: #64748b;
  transition: color 0.3s;
}
.collapse-btn:hover {
  color: #667eea;
}
.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.header-icon {
  color: #64748b;
  cursor: pointer;
  transition: color 0.3s;
}
.header-icon:hover {
  color: #667eea;
}
.notification-badge {
  cursor: pointer;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.3s;
}
.user-dropdown:hover {
  background: #f1f5f9;
}
.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
}
.user-info {
  line-height: 1.2;
}
.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}
.user-role {
  font-size: 12px;
  color: #94a3b8;
}
.arrow-icon {
  color: #94a3b8;
}

/* 内容区 */
.main {
  background-color: #f1f5f9;
  padding: 24px;
  overflow-x: hidden;
}

/* 页面切换动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>