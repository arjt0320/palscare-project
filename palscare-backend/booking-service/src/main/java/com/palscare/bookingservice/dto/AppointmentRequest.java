package com.palscare.bookingservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Step 1: Appointment Request DTO.
 * Submitted by patient to book an appointment for a specific slot.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequest {

    /** Step 2: Unique String ID of the slot in doctor-slot-service */
    @NotBlank(message = "Slot ID is required")
    private String slotId;

    /** Step 3: Medical reason or symptoms */
    private String reason;

    /** Step 4: Transaction ID from payment processor */
    @NotBlank(message = "Payment transaction ID is required")
    private String paymentTransactionId;
}
