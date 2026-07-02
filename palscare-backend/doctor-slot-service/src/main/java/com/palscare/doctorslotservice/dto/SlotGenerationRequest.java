package com.palscare.doctorslotservice.dto;

import com.palscare.doctorslotservice.model.SlotMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalTime;

@Data
public class SlotGenerationRequest {
    @NotBlank(message = "Slot day is required")
    private String slotDay;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "Slot mode is required")
    private SlotMode slotMode;

    private Long chamberId; // Can be null for VIDEO mode
}
