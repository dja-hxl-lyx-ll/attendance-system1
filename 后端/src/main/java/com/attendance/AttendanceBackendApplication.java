package com.attendance;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.attendance.mapper")
public class AttendanceBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(AttendanceBackendApplication.class, args);
    }
}