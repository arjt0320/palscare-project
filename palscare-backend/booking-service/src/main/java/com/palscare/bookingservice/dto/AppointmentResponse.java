package com.palscare.bookingservice.dto;

import com.palscare.bookingservice.model.AppointmentStatus;
import com.palscare.bookingservice.model.ConsultationMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Step 1: Appointment Response DTO.
 * Returned to patient and doctor when viewing appointment history or booking receipts.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    /** Step 2: Unique String ID generated in MongoDB */
    private String id;

    /** Step 3: Reference String ID of the patient */
    private String patientId;

    /** Step 4: Reference String ID of the doctor */
    private String doctorId;

    /** Step 5: Reference String ID of the booked slot */
    private String slotId;

    /** Step 6: Booking submission timestamp */
    private LocalDateTime bookingDate;

    /** Step 7: Scheduled date and time of appointment */
    private LocalDateTime appointmentDatetime;

    /** Step 8: Status (BOOKED, COMPLETED, CANCELLED) */
    private AppointmentStatus status;

    /** Step 9: Consultation mode (CHAMBER or VIDEO) */
    private ConsultationMode consultationMode;

    /** Step 10: Patient's reason / description */
    private String reason;

    /** Step 11: Associated payment and fee breakdown */
    private PaymentDetails paymentDetails;
}
