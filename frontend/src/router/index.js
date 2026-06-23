// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 路由配置
const routes = [
  // 登录页
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  // 学生端布局
  {
    path: '/student',
    component: () => import('@/views/Layout.vue'),
    redirect: '/student/home',
    children: [
      {
        path: 'home',
        name: 'StudentHome',
        component: () => import('@/views/student/StudentHome.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'sign-in',
        name: 'SignIn',
        component: () => import('@/views/student/SignIn.vue'),
        meta: { title: '签到中心' }
      },
      {
        path: 'my-attendance',
        name: 'MyAttendance',
        component: () => import('@/views/student/MyAttendance.vue'),
        meta: { title: '我的考勤' }
      },
      {
        path: 'leave-apply',
        name: 'LeaveApply',
        component: () => import('@/views/student/LeaveApply.vue'),
        meta: { title: '请假申请' }
      },
      {
        path: 'my-leave',
        name: 'MyLeave',
        component: () => import('@/views/student/MyLeave.vue'),
        meta: { title: '我的请假' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/student/Profile.vue'),
        meta: { title: '个人中心' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫（后面再加，先不加也能跑）
router.beforeEach((to, from, next) => {
  next()
})

export default router
