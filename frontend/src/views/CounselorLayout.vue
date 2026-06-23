<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="aside">
      <div class="logo">考勤系统-辅导员端</div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/counselor/home">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/counselor/leave-approval">
          <el-icon><Document /></el-icon>
          <span>请假审批</span>
          <el-badge v-if="pendingCount > 0" :value="pendingCount" class="menu-badge" />
        </el-menu-item>
        <el-menu-item index="/counselor/profile">
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
            <el-breadcrumb-item :to="{ path: '/counselor/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="user-name">
              {{ userStore.userInfo?.name || '辅导员' }}
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
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  HomeFilled,
  Document,
  Setting,
  ArrowDown
} from '@element-plus/icons-vue'
// import { getPendingLeaveCount } from '@/api/leave'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 待审批数量
const pendingCount = ref(0)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 当前页面标题
const currentTitle = computed(() => route.meta?.title || '')

// 下拉菜单操作
const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/counselor/profile')
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

// 加载待审批数量
const loadPendingCount = async () => {
  // TODO: 调用真实接口
  // const res = await getPendingCount()
  // pendingCount.value = res.data
  pendingCount.value = 3
}

onMounted(() => {
  loadPendingCount()
})
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
  font-size: 15px;
  font-weight: bold;
  color: #fff;
  border-bottom: 1px solid #1f2d3d;
}
.aside :deep(.el-menu) {
  border-right: none;
}
.menu-badge {
  margin-left: 10px;
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