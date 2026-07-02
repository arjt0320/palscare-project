package com.palscare.bookingservice.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class SlotDto {
    private Long id;
    private Long doctorId;
    private Long chamberId;
    private String slotDay;
    private LocalTime startTime;
    private String slotMode;
    private Boolean isBooked;
    private Integer version;
}
