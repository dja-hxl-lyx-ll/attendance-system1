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
        name: 'StudentProfile',
        component: () => import('@/views/student/Profile.vue'),
        meta: { title: '个人中心' }
      }
    ]
  },
  // 教师端布局
  {
    path: '/teacher',
    component: () => import('@/views/TeacherLayout.vue'),
    redirect: '/teacher/home',
    children: [
      {
        path: 'home',
        name: 'TeacherHome',
        component: () => import('@/views/teacher/TeacherHome.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'create-sign',
        name: 'CreateSign',
        component: () => import('@/views/teacher/CreateSign.vue'),
        meta: { title: '发布签到' }
      },
      {
        path: 'attendance-stats',
        name: 'AttendanceStats',
        component: () => import('@/views/teacher/AttendanceStats.vue'),
        meta: { title: '考勤统计' }
      },
      {
        path: 'leave-approval',
        name: 'LeaveApproval',
        component: () => import('@/views/teacher/LeaveApproval.vue'),
        meta: { title: '请假审批' }
      },
      {
        path: 'class-management',
        name: 'ClassManagement',
        component: () => import('@/views/teacher/ClassManagement.vue'),
        meta: { title: '班级管理' }
      },
      {
        path: 'profile',
        name: 'TeacherProfile',
        component: () => import('@/views/teacher/TeacherProfile.vue'),
        meta: { title: '个人中心' }
      }
    ]
  },
  // 辅导员端布局
  {
    path: '/counselor',
    component: () => import('@/views/CounselorLayout.vue'),
    redirect: '/counselor/home',
    children: [
      {
        path: 'home',
        name: 'CounselorHome',
        component: () => import('@/views/counselor/CounselorHome.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'leave-approval',
        name: 'CounselorLeaveApproval',
        component: () => import('@/views/counselor/LeaveApproval.vue'),
        meta: { title: '请假审批' }
      },
      {
        path: 'profile',
        name: 'CounselorProfile',
        component: () => import('@/views/counselor/CounselorProfile.vue'),
        meta: { title: '个人中心' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  next()
})

export default router