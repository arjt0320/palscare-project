package com.palscare.bookingservice.dto;

import com.palscare.bookingservice.model.PaymentStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PaymentDetails {
    private String transactionId;
    private BigDecimal amount;
    private BigDecimal platformFee;
    private PaymentStatus paymentStatus;
}
