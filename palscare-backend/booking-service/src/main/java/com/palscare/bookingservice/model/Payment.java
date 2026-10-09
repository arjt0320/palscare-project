package com.palscare.bookingservice.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Step 1: Payment Document Entity for MongoDB.
 * Represents a financial billing or mock transaction record associated with an appointment.
 * Backed by the 'payments' collection in MongoDB.
 */
@Document(collection = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    /**
     * Step 2: Primary document ID in MongoDB.
     */
    @Id
    private String id;

    /**
     * Step 3: Reference to the associated Appointment String ID.
     */
    @Indexed
    private String appointmentId;

    /**
     * Step 4: External or mock payment gateway transaction identifier.
     */
    @Indexed(unique = true)
    private String transactionId;

    /**
     * Step 5: Total consultation fee charged.
     */
    private BigDecimal amount;

    /**
     * Step 6: Platform service fee portion.
     */
    private BigDecimal platformFee;

    /**
     * Step 7: Current transaction status (SUCCESS, FAILED, REFUNDED).
     */
    private PaymentStatus paymentStatus;

    /**
     * Step 8: Transaction timestamp.
     */
    private LocalDateTime createdAt;

    /**
     * Step 9: Lifecycle initialization helper.
     */
    public void initializeDefaults() {
        if (this.id == null || this.id.trim().isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.paymentStatus == null) {
            this.paymentStatus = PaymentStatus.SUCCESS;
        }
    }
}
