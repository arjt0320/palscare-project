package com.palscare.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DoctorOnboardingRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Specialty is required")
    private String specialty;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    private String university;

    @NotNull(message = "Experience years is required")
    private Integer experienceYears;

    private String bio;
}
