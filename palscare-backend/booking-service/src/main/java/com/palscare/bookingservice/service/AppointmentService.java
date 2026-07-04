package com.palscare.bookingservice.service;

import com.palscare.bookingservice.dto.*;
import com.palscare.bookingservice.model.*;
import com.palscare.bookingservice.repository.AppointmentRepository;
import com.palscare.bookingservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate;

    @Value("${palscare.services.user-service.url}")
    private String userServiceUrl;

    @Value("${palscare.services.doctor-slot-service.url}")
    private String doctorSlotServiceUrl;

    private Long getPatientIdFromUserService(String oktaUid) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", oktaUid);
        headers.set("X-User-Role", "PATIENT");
        headers.set("X-User-Email", "");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<Long> response = restTemplate.exchange(
                    userServiceUrl + "/api/v1/patients/internal/id",
                    HttpMethod.GET,
                    entity,
                    Long.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to resolve patient internal ID: " + e.getMessage());
        }
    }

    private SlotDto getSlotFromSlotService(String oktaUid, Long slotId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", oktaUid);
        headers.set("X-User-Role", "PATIENT");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<SlotDto> response = restTemplate.exchange(
                    doctorSlotServiceUrl + "/api/v1/doctors/slots/internal/" + slotId,
                    HttpMethod.GET,
                    entity,
                    SlotDto.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to fetch slot details: " + e.getMessage());
        }
    }

    private void lockSlotInSlotService(String oktaUid, Long slotId, Integer version) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", oktaUid);
        headers.set("X-User-Role", "PATIENT");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            restTemplate.exchange(
                    doctorSlotServiceUrl + "/api/v1/doctors/slots/internal/" + slotId + "/book?version=" + version,
                    HttpMethod.PUT,
                    entity,
                    Void.class
            );
        } catch (Exception e) {
            throw new IllegalStateException("Optimistic Lock conflict or slot already booked: " + e.getMessage());
        }
    }

    private void releaseSlotInSlotService(String oktaUid, Long slotId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", oktaUid);
        headers.set("X-User-Role", "PATIENT");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            restTemplate.exchange(
                    doctorSlotServiceUrl + "/api/v1/doctors/slots/internal/" + slotId + "/release",
                    HttpMethod.PUT,
                    entity,
                    Void.class
            );
        } catch (Exception e) {
            throw new IllegalStateException("Failed to release slot in slot service: " + e.getMessage());
        }
    }

    private LocalDateTime calculateAppointmentDateTime(String slotDay, LocalTime startTime) {
        DayOfWeek dayOfWeek = DayOfWeek.valueOf(slotDay.toUpperCase());
        LocalDate today = LocalDate.now();
        LocalDate appointmentDate = today.with(TemporalAdjusters.nextOrSame(dayOfWeek));
        return LocalDateTime.of(appointmentDate, startTime);
    }

    @Transactional
    public AppointmentResponse createAppointment(String oktaUid, AppointmentRequest request) {
        Long patientId = getPatientIdFromUserService(oktaUid);

        // Fetch Slot details
        SlotDto slot = getSlotFromSlotService(oktaUid, request.getSlotId());
        if (Boolean.TRUE.equals(slot.getIsBooked())) {
            throw new IllegalStateException("Slot is already booked");
        }

        // Reserve the slot via Optimistic Locking check
        lockSlotInSlotService(oktaUid, slot.getId(), slot.getVersion());

        // Calculate fees based on consult mode
        ConsultationMode consultMode = ConsultationMode.valueOf(slot.getSlotMode());
        BigDecimal amount = consultMode == ConsultationMode.VIDEO ? new BigDecimal("500.00") : new BigDecimal("800.00");
        BigDecimal platformFee = new BigDecimal("50.00");

        LocalDateTime appointmentDateTime = calculateAppointmentDateTime(slot.getSlotDay(), slot.getStartTime());

        Appointment appointment = Appointment.builder()
                .patientId(patientId)
                .doctorId(slot.getDoctorId())
                .slotId(slot.getId())
                .appointmentDatetime(appointmentDateTime)
                .status(AppointmentStatus.BOOKED)
                .consultationMode(consultMode)
                .reason(request.getReason())
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);

        Payment payment = Payment.builder()
                .appointment(savedAppointment)
                .transactionId(request.getPaymentTransactionId())
                .amount(amount)
                .platformFee(platformFee)
                .paymentStatus(PaymentStatus.SUCCESS)
                .build();

        paymentRepository.save(payment);

        return mapToResponse(savedAppointment, payment);
    }

    @Transactional
    public AppointmentResponse cancelAppointment(String oktaUid, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Appointment is already cancelled");
        }

        // Apply 4-Hour cancellation rule
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(appointment.getAppointmentDatetime().minusHours(4))) {
            throw new IllegalArgumentException("Cannot cancel within 4 hours of the appointment");
        }

        // Release the slot
        releaseSlotInSlotService(oktaUid, appointment.getSlotId());

        // Mark appointment cancelled
        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment updated = appointmentRepository.save(appointment);

        // Trigger payment refund
        Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalStateException("Payment record not found"));
        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        return mapToResponse(updated, payment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getPatientAppointments(String oktaUid) {
        Long patientId = getPatientIdFromUserService(oktaUid);
        return appointmentRepository.findByPatientId(patientId).stream()
                .map(appt -> {
                    Payment payment = paymentRepository.findByAppointmentId(appt.getId()).orElse(null);
                    return mapToResponse(appt, payment);
                })
                .collect(Collectors.toList());
    }

    private Long getDoctorIdFromUserService(String oktaUid) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", oktaUid);
        headers.set("X-User-Role", "DOCTOR");
        headers.set("X-User-Email", "");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<Long> response = restTemplate.exchange(
                    "http://user-service/api/v1/doctors/internal/id",
                    HttpMethod.GET,
                    entity,
                    Long.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to resolve doctor internal ID: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorAppointments(String oktaUid) {
        Long doctorId = getDoctorIdFromUserService(oktaUid);
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(appt -> {
                    Payment payment = paymentRepository.findByAppointmentId(appt.getId()).orElse(null);
                    return mapToResponse(appt, payment);
                })
                .collect(Collectors.toList());
    }

    private AppointmentResponse mapToResponse(Appointment appt, Payment payment) {
        PaymentDetails payDetails = null;
        if (payment != null) {
            payDetails = PaymentDetails.builder()
                    .transactionId(payment.getTransactionId())
                    .amount(payment.getAmount())
                    .platformFee(payment.getPlatformFee())
                    .paymentStatus(payment.getPaymentStatus())
                    .build();
        }

        return AppointmentResponse.builder()
                .id(appt.getId())
                .patientId(appt.getPatientId())
                .doctorId(appt.getDoctorId())
                .slotId(appt.getSlotId())
                .bookingDate(appt.getBookingDate())
                .appointmentDatetime(appt.getAppointmentDatetime())
                .status(appt.getStatus())
                .consultationMode(appt.getConsultationMode())
                .reason(appt.getReason())
                .paymentDetails(payDetails)
                .build();
    }
}
