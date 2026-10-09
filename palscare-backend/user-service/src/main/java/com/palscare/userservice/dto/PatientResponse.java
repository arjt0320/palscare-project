package com.palscare.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Step 1: Patient Profile Response DTO.
 * Returned to clients when querying patient account information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponse {
    /** Step 2: Unique String ID generated in MongoDB */
    private String id;

    /** Step 3: Account email */
    private String email;

    /** Step 4: Patient full name */
    private String name;

    /** Step 5: Primary contact phone number */
    private String phone;

    /** Step 6: Patient date of birth */
    private LocalDate dob;

    /** Step 7: Blood group designation */
    private String bloodGroup;
}
