import request from '@/utils/request'

// 登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

// 修改密码
export function updatePassword(data) {
  return request({
    url: '/user/update-password',
    method: 'post',
    data
  })
}

// 修改个人资料
export function updateProfile(data) {
  return request({
    url: '/user/update-profile',
    method: 'post',
    data
  })
}