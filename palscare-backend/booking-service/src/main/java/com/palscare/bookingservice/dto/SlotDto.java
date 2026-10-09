package com.palscare.bookingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

/**
 * Step 1: Slot DTO consumed by Booking Service from Doctor Slot Service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotDto {
    /** Step 2: Unique String ID of the slot */
    private String id;

    /** Step 3: Doctor's String ID */
    private String doctorId;

    /** Step 4: Optional Chamber String ID */
    private String chamberId;

    /** Step 5: Day of the week */
    private String slotDay;

    /** Step 6: Start time */
    private LocalTime startTime;

    /** Step 7: Mode (CHAMBER or VIDEO) */
    private String slotMode;

    /** Step 8: Whether booked */
    private Boolean isBooked;

    /** Step 9: Optimistic lock version tag */
    private Integer version;
}
