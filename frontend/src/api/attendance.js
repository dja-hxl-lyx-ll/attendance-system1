import request from '@/utils/request'

// ========== 学生端 ==========

// 获取可签到任务列表
export function getSignTaskList() {
  return request({
    url: '/attendance/student/tasks',
    method: 'get'
  })
}

// 学生签到
export function studentSign(data) {
  return request({
    url: '/attendance/student/sign',
    method: 'post',
    data
  })
}

// 获取我的考勤记录
export function getMyAttendanceList(params) {
  return request({
    url: '/attendance/student/records',
    method: 'get',
    params
  })
}

// ========== 教师端 ==========

// 教师发布签到
export function createSignIn(data) {
  return request({
    url: '/attendance/teacher/create',
    method: 'post',
    data
  })
}

// 获取进行中的签到列表
export function getOngoingSignList() {
  return request({
    url: '/attendance/teacher/ongoing',
    method: 'get'
  })
}

// 结束签到
export function endSignIn(id) {
  return request({
    url: `/attendance/teacher/end/${id}`,
    method: 'post'
  })
}

// 获取考勤统计数据
export function getAttendanceStats(params) {
  return request({
    url: '/attendance/teacher/stats',
    method: 'get',
    params
  })
}

// 获取学生考勤明细列表
export function getStudentAttendanceList(params) {
  return request({
    url: '/attendance/teacher/student-list',
    method: 'get',
    params
  })
}