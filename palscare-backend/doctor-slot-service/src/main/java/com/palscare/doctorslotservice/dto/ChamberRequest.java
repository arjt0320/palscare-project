package com.palscare.doctorslotservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChamberRequest {
    @NotBlank(message = "Chamber name is required")
    private String name;

    @NotBlank(message = "Chamber address is required")
    private String address;
}
