package com.workboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WorkboardApplication {
    public static void main(String[] args) {
        SpringApplication.run(WorkboardApplication.class, args);
    }
}
