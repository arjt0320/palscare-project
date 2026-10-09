package com.palscare.userservice.dto;

import com.palscare.userservice.model.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Step 1: Doctor Profile Response DTO.
 * Returned to clients when fetching doctor credentials and public directory profiles.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponse {
    /** Step 2: Unique String ID generated in MongoDB */
    private String id;

    /** Step 3: Account email */
    private String email;

    /** Step 4: Doctor full name */
    private String name;

    /** Step 5: Clinical medical specialty */
    private String specialty;

    /** Step 6: Medical license registration number */
    private String registrationNumber;

    /** Step 7: Medical school / university */
    private String university;

    /** Step 8: Total years of clinical experience */
    private Integer experienceYears;

    /** Step 9: Clinical biography */
    private String bio;

    /** Step 10: Phone contact */
    private String phone;

    /** Step 11: Current verification status (APPROVED, PENDING, REJECTED) */
    private VerificationStatus verificationStatus;
}
