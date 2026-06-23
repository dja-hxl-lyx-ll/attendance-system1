package com.attendance.service;

import com.attendance.entity.SysUser;
import java.util.List;

public interface SysUserService {
    // 查询全部用户
    List<SysUser> getUserList();
    // 用户登录
    SysUser login(String username,String password);
}