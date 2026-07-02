package com.palscare.bookingservice.dto;

import com.palscare.bookingservice.model.AppointmentStatus;
import com.palscare.bookingservice.model.ConsultationMode;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private Long slotId;
    private LocalDateTime bookingDate;
    private LocalDateTime appointmentDatetime;
    private AppointmentStatus status;
    private ConsultationMode consultationMode;
    private String reason;
    private PaymentDetails paymentDetails;
}
