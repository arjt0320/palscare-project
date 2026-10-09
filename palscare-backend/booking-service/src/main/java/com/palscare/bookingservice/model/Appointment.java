package com.palscare.bookingservice.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Step 1: Appointment Document Entity for MongoDB.
 * Represents a consultation appointment booked between a patient and a doctor.
 * Backed by the 'appointments' collection in MongoDB.
 */
@Document(collection = "appointments")
@CompoundIndexes({
    // Step 2: Index to optimize querying appointments by patient or doctor by date
    @CompoundIndex(name = "patient_datetime_idx", def = "{'patientId': 1, 'appointmentDatetime': -1}"),
    @CompoundIndex(name = "doctor_datetime_idx", def = "{'doctorId': 1, 'appointmentDatetime': -1}")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    /**
     * Step 3: Primary document ID in MongoDB.
     */
    @Id
    private String id;

    /**
     * Step 4: Logical reference to patient's internal String ID from user-service.
     */
    @Indexed
    private String patientId;

    /**
     * Step 5: Logical reference to doctor's internal String ID from user-service.
     */
    @Indexed
    private String doctorId;

    /**
     * Step 6: Logical reference to slot's internal String ID from doctor-slot-service.
     * Enforced unique to prevent double-booking the same slot.
     */
    @Indexed(unique = true)
    private String slotId;

    /**
     * Step 7: Timestamp when the booking was submitted.
     */
    private LocalDateTime bookingDate;

    /**
     * Step 8: Scheduled date and time of the actual consultation.
     */
    private LocalDateTime appointmentDatetime;

    /**
     * Step 9: Appointment status (BOOKED, COMPLETED, CANCELLED).
     */
    @Indexed
    private AppointmentStatus status;

    /**
     * Step 10: Consultation mode (CHAMBER or VIDEO).
     */
    private ConsultationMode consultationMode;

    /**
     * Step 11: Patient's stated medical reason or symptoms for the appointment.
     */
    private String reason;

    /**
     * Step 12: Lifecycle initialization helper.
     */
    public void initializeDefaults() {
        if (this.id == null || this.id.trim().isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.bookingDate == null) {
            this.bookingDate = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = AppointmentStatus.BOOKED;
        }
    }
}
