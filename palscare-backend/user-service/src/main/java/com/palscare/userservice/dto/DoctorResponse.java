package com.palscare.userservice.dto;

import com.palscare.userservice.model.VerificationStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DoctorResponse {
    private Long id;
    private String email;
    private String name;
    private String specialty;
    private String registrationNumber;
    private String university;
    private Integer experienceYears;
    private String bio;
    private String phone;
    private VerificationStatus verificationStatus;
}
