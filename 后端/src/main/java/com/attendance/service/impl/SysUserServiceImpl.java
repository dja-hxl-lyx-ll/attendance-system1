package com.attendance.service.impl;

import com.attendance.entity.SysUser;
import com.attendance.mapper.SysUserMapper;
import com.attendance.service.SysUserService;
import org.springframework.stereotype.Service;
import jakarta.annotation.Resource;
import java.util.List;

// @Service将当前类交给Spring容器管理
@Service
public class SysUserServiceImpl implements SysUserService {

    // 注入Mapper，调用数据库方法
    @Resource
    private SysUserMapper sysUserMapper;

    @Override
    public List<SysUser> getUserList() {
        return sysUserMapper.selectAll();
    }

    @Override
    public SysUser login(String username, String password) {
        return sysUserMapper.selectByLogin(username,password);
    }
}