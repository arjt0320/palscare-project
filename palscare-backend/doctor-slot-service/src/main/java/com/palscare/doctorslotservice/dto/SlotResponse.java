package com.palscare.doctorslotservice.dto;

import com.palscare.doctorslotservice.model.SlotMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

/**
 * Step 1: Slot Response DTO.
 * Returned to doctors and patients when viewing or reserving consultation slots in MongoDB.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotResponse {
    /** Step 2: Unique String ID generated in MongoDB */
    private String id;

    /** Step 3: Reference doctor String ID */
    private String doctorId;

    /** Step 4: Optional clinic/chamber String ID */
    private String chamberId;

    /** Step 5: Optional clinic display name */
    private String chamberName;

    /** Step 6: Day of the week (e.g., 'Monday') */
    private String slotDay;

    /** Step 7: Starting time */
    private LocalTime startTime;

    /** Step 8: Ending time */
    private LocalTime endTime;

    /** Step 9: Consultation mode (CHAMBER or VIDEO) */
    private SlotMode slotMode;

    /** Step 10: Reservation status */
    private Boolean isBooked;

    /** Step 11: Optimistic lock version tag */
    private Integer version;
}
