package com.palscare.doctorslotservice.dto;

import com.palscare.doctorslotservice.model.SlotMode;
import lombok.Builder;
import lombok.Data;
import java.time.LocalTime;

@Data
@Builder
public class SlotResponse {
    private Long id;
    private Long doctorId;
    private Long chamberId;
    private String slotDay;
    private LocalTime startTime;
    private SlotMode slotMode;
    private Boolean isBooked;
    private Integer version;
}
