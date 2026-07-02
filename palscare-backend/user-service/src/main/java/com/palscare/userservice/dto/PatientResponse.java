package com.palscare.userservice.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class PatientResponse {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private LocalDate dob;
    private String bloodGroup;
}
