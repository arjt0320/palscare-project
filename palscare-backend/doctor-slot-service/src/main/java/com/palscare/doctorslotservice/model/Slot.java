package com.palscare.doctorslotservice.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalTime;
import java.util.UUID;

/**
 * Step 1: Slot Document Entity for MongoDB.
 * Represents an individual bookable appointment time slot in a doctor's weekly recurring schedule.
 * Backed by the 'slots' collection in MongoDB.
 */
@Document(collection = "slots")
@CompoundIndexes({
    // Step 2: Index to optimize querying available slots by doctor, day, and booking status
    @CompoundIndex(name = "doctor_day_booked_idx", def = "{'doctorId': 1, 'slotDay': 1, 'isBooked': 1}")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Slot {

    /**
     * Step 3: Primary document ID in MongoDB.
     */
    @Id
    private String id;

    /**
     * Step 4: Logical reference to the doctor's internal String ID.
     */
    @Indexed
    private String doctorId;

    /**
     * Step 5: Embedded chamber snapshot (null indicates video / telemedicine consult).
     */
    private Chamber chamber;

    /**
     * Step 6: Day of the week for recurring schedule (e.g., 'Monday', 'Tuesday').
     */
    private String slotDay;

    /**
     * Step 7: Starting time of the consultation slot (e.g., 09:00:00).
     */
    private LocalTime startTime;

    /**
     * Step 8: Ending time of the consultation slot (e.g., 09:30:00).
     */
    private LocalTime endTime;

    /**
     * Step 9: Mode of consultation (CHAMBER or VIDEO).
     */
    private SlotMode slotMode;

    /**
     * Step 10: Boolean flag indicating if this slot has already been reserved.
     */
    @Indexed
    private Boolean isBooked;

    /**
     * Step 11: Optimistic locking version tag to prevent concurrent double-booking.
     * Spring Data MongoDB automatically increments this on every save.
     */
    @Version
    private Integer version;

    /**
     * Step 12: Lifecycle initialization helper.
     */
    public void initializeDefaults() {
        if (this.id == null || this.id.trim().isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.isBooked == null) {
            this.isBooked = false;
        }
    }
}
