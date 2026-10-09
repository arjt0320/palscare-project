package com.palscare.doctorslotservice.dto;

import com.palscare.doctorslotservice.model.SlotMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

/**
 * Step 1: Slot Generation Request DTO.
 * Submitted by doctors to generate recurring consultation slots in MongoDB.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotGenerationRequest {

    /** Step 2: Day of the week for the recurring slot */
    @NotBlank(message = "Slot day is required")
    private String slotDay;

    /** Step 3: Starting time of consultation */
    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    /** Step 4: Optional ending time */
    private LocalTime endTime;

    /** Step 5: Mode of consultation (CHAMBER or VIDEO) */
    @NotNull(message = "Slot mode is required")
    private SlotMode slotMode;

    /** Step 6: Chamber String ID if mode is CHAMBER */
    private String chamberId;
}
