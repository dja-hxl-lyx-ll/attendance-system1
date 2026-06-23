<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="aside">
      <div class="logo">考勤系统-教师端</div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/teacher/home">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/teacher/create-sign">
          <el-icon><EditPen /></el-icon>
          <span>发布签到</span>
        </el-menu-item>
        <el-menu-item index="/teacher/attendance-stats">
          <el-icon><DataAnalysis /></el-icon>
          <span>考勤统计</span>
        </el-menu-item>
        <el-menu-item index="/teacher/leave-approval">
          <el-icon><Document /></el-icon>
          <span>请假审批</span>
        </el-menu-item>
        <el-menu-item index="/teacher/class-management">
          <el-icon><User /></el-icon>
          <span>班级管理</span>
        </el-menu-item>
        <el-menu-item index="/teacher/profile">
          <el-icon><Setting /></el-icon>
          <span>个人中心</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧主区域 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header class="header">
        <div class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/teacher/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="user-name">
              {{ userStore.userInfo?.name || '教师' }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  HomeFilled,
  EditPen,
  DataAnalysis,
  Document,
  User,
  Setting,
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 当前页面标题
const currentTitle = computed(() => route.meta?.title || '')

// 下拉菜单操作
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
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.aside {
  background-color: #304156;
  color: #fff;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  border-bottom: 1px solid #1f2d3d;
}
.aside :deep(.el-menu) {
  border-right: none;
}
.header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user-name {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}
.main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>