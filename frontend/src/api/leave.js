import request from '@/utils/request'

// ========== 学生端 ==========

// 上传证明文件
export function uploadProof(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/leave/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 提交请假申请
export function submitLeave(data) {
  return request({
    url: '/leave/apply',
    method: 'post',
    data
  })
}

// 获取我的请假列表
export function getMyLeaveList(params) {
  return request({
    url: '/leave/my-list',
    method: 'get',
    params
  })
}

// 获取请假详情
export function getLeaveDetail(id) {
  return request({
    url: `/leave/${id}`,
    method: 'get'
  })
}

// ========== 教师端 ==========

// 获取教师审批列表
export function getTeacherLeaveList(params) {
  return request({
    url: '/leave/approval-list',
    method: 'get',
    params
  })
}

// 教师审批请假
export function teacherApproveLeave(data) {
  return request({
    url: '/leave/approve',
    method: 'post',
    data
  })
}

// ========== 辅导员端 ==========

// 获取辅导员审批列表
export function getCounselorLeaveList(params) {
  return request({
    url: '/leave/counselor-list',
    method: 'get',
    params
  })
}

// 辅导员审批请假
export function counselorApproveLeave(data) {
  return request({
    url: '/leave/counselor-approve',
    method: 'post',
    data
  })
}

// 获取待审批数量
export function getPendingLeaveCount() {
  return request({
    url: '/leave/pending-count',
    method: 'get'
  })
}