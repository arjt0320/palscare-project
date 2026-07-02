package com.palscare.bookingservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentRequest {
    @NotNull(message = "Slot ID is required")
    private Long slotId;

    private String reason;

    @NotBlank(message = "Payment transaction ID is required")
    private String paymentTransactionId;
}
