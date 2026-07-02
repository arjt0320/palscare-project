package com.palscare.doctorslotservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChamberResponse {
    private Long id;
    private Long doctorId;
    private String name;
    private String address;
}
