import request from '@/utils/request'

// 获取班级列表
export function getClassList() {
  return request({
    url: '/class/list',
    method: 'get'
  })
}

// 获取学生列表
export function getStudentList(params) {
  return request({
    url: '/class/student-list',
    method: 'get',
    params
  })
}

// 添加学生
export function addStudent(data) {
  return request({
    url: '/class/student/add',
    method: 'post',
    data
  })
}

// 编辑学生
export function updateStudent(data) {
  return request({
    url: '/class/student/update',
    method: 'post',
    data
  })
}

// 删除学生
export function deleteStudent(id) {
  return request({
    url: `/class/student/${id}`,
    method: 'delete'
  })
}