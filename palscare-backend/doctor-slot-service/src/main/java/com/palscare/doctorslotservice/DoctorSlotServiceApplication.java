package com.palscare.doctorslotservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class DoctorSlotServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(DoctorSlotServiceApplication.class, args);
    }
}
