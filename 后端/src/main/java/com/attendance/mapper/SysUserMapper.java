package com.attendance.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.attendance.entity.SysUser;
import java.util.List;

@Mapper
public interface SysUserMapper {
    List<SysUser> selectAll();
    SysUser selectByLogin(@Param("username") String username, @Param("password") String password);
}