package com.attendance.controller;

import com.attendance.common.Result;
import com.attendance.entity.SysUser;
import com.attendance.service.SysUserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.annotation.Resource;
import java.util.List;

// 标记为接口控制器，返回JSON数据
@RestController
// 接口统一前缀：http://localhost:8080/user/xxx
@RequestMapping("/user")
public class SysUserController {

    // 注入业务层
    @Resource
    private SysUserService sysUserService;

    // 接口1：查询所有用户
    @GetMapping("/list")
    public Result<List<SysUser>> getUserList(){
        return Result.success(sysUserService.getUserList());
    }

    // 接口2：用户登录
    @GetMapping("/login")
    public Result<SysUser> login(@RequestParam String username, @RequestParam String password){
        SysUser user = sysUserService.login(username,password);
        if(user == null){
            return Result.fail("账号或密码错误");
        }
        return Result.success(user);
    }
}