package com.palscare.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientProfileRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    private String phone;
    private LocalDate dob;
    private String bloodGroup;
}
