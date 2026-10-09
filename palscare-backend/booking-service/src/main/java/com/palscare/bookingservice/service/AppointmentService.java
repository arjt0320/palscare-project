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
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Step 1: Appointment Service business logic layer.
 * Coordinates appointment reservations, optimistic slot locking, and billing records in MongoDB.
 */
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

    /**
     * Step 2: Resolve patient internal MongoDB String ID by calling user-service.
     */
    private String getPatientIdFromUserService(String oktaUid) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", oktaUid);
        headers.set("X-User-Role", "PATIENT");
        headers.set("X-User-Email", "");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    userServiceUrl + "/api/v1/patients/internal/id",
                    HttpMethod.GET,
                    entity,
                    String.class
            );
            return response.getBody();
        } catch (Exception e) {
            // Fallback for resilient local development / testing
            return oktaUid;
        }
    }

    /**
     * Step 3: Fetch Slot details by calling doctor-slot-service.
     */
    private SlotDto getSlotFromSlotService(String oktaUid, String slotId) {
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
            throw new IllegalArgumentException("Failed to fetch slot details from slot-service: " + e.getMessage());
        }
    }

    /**
     * Step 4: Lock slot in doctor-slot-service with optimistic lock version verification.
     */
    private void lockSlotInSlotService(String oktaUid, String slotId, Integer version) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", oktaUid);
        headers.set("X-User-Role", "PATIENT");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            String url = doctorSlotServiceUrl + "/api/v1/doctors/slots/internal/" + slotId + "/book";
            if (version != null) {
                url += "?version=" + version;
            }
            restTemplate.exchange(url, HttpMethod.PUT, entity, Void.class);
        } catch (Exception e) {
            throw new IllegalStateException("Slot booking conflict: " + e.getMessage());
        }
    }

    /**
     * Step 5: Release booked slot back to available status in doctor-slot-service.
     */
    private void releaseSlotInSlotService(String oktaUid, String slotId) {
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

    /**
     * Step 6: Calculate upcoming calendar date and time from recurring weekly slot.
     */
    private LocalDateTime calculateAppointmentDateTime(String slotDay, LocalTime startTime) {
        try {
            DayOfWeek dayOfWeek = DayOfWeek.valueOf(slotDay.trim().toUpperCase());
            LocalDate today = LocalDate.now();
            LocalDate appointmentDate = today.with(TemporalAdjusters.nextOrSame(dayOfWeek));
            return LocalDateTime.of(appointmentDate, startTime);
        } catch (Exception e) {
            return LocalDateTime.now().plusDays(1).with(startTime);
        }
    }

    /**
     * Step 7: Create a new appointment and payment record in MongoDB.
     */
    public AppointmentResponse createAppointment(String oktaUid, AppointmentRequest request) {
        String patientId = getPatientIdFromUserService(oktaUid);

        // Fetch Slot details
        SlotDto slot = getSlotFromSlotService(oktaUid, request.getSlotId());
        if (slot == null) {
            throw new IllegalArgumentException("Slot not found with ID: " + request.getSlotId());
        }
        if (Boolean.TRUE.equals(slot.getIsBooked())) {
            throw new IllegalStateException("Slot is already booked");
        }

        // Reserve the slot via optimistic concurrency check
        lockSlotInSlotService(oktaUid, slot.getId(), slot.getVersion());

        // Calculate consultation fee
        ConsultationMode consultMode;
        try {
            consultMode = ConsultationMode.valueOf(slot.getSlotMode().toUpperCase());
        } catch (Exception e) {
            consultMode = ConsultationMode.VIDEO;
        }

        BigDecimal amount = consultMode == ConsultationMode.VIDEO ? new BigDecimal("500.00") : new BigDecimal("800.00");
        BigDecimal platformFee = new BigDecimal("50.00");

        LocalDateTime appointmentDateTime = calculateAppointmentDateTime(slot.getSlotDay(), slot.getStartTime());

        // Build and save Appointment document in MongoDB
        String appointmentId = UUID.randomUUID().toString();
        Appointment appointment = Appointment.builder()
                .id(appointmentId)
                .patientId(patientId)
                .doctorId(slot.getDoctorId())
                .slotId(slot.getId())
                .bookingDate(LocalDateTime.now())
                .appointmentDatetime(appointmentDateTime)
                .status(AppointmentStatus.BOOKED)
                .consultationMode(consultMode)
                .reason(request.getReason() != null ? request.getReason() : "General Consultation")
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Build and save Payment document in MongoDB
        Payment payment = Payment.builder()
                .id(UUID.randomUUID().toString())
                .appointmentId(savedAppointment.getId())
                .transactionId(request.getPaymentTransactionId())
                .amount(amount)
                .platformFee(platformFee)
                .paymentStatus(PaymentStatus.SUCCESS)
                .createdAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        return mapToResponse(savedAppointment, payment);
    }

    /**
     * Step 8: Cancel appointment in MongoDB with 4-hour cancellation policy.
     */
    public AppointmentResponse cancelAppointment(String oktaUid, String appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + appointmentId));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Appointment is already cancelled");
        }

        // Apply 4-Hour cancellation rule
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(appointment.getAppointmentDatetime().minusHours(4))) {
            throw new IllegalArgumentException("Cannot cancel within 4 hours of the appointment");
        }

        // Release the slot in doctor-slot-service
        releaseSlotInSlotService(oktaUid, appointment.getSlotId());

        // Mark appointment cancelled in MongoDB
        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment updated = appointmentRepository.save(appointment);

        // Update payment to REFUNDED in MongoDB
        Payment payment = paymentRepository.findByAppointmentId(appointmentId).orElse(null);
        if (payment != null) {
            payment.setPaymentStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
        }

        return mapToResponse(updated, payment);
    }

    /**
     * Step 9: Query all appointments for the patient from MongoDB.
     */
    public List<AppointmentResponse> getPatientAppointments(String oktaUid) {
        String patientId = getPatientIdFromUserService(oktaUid);
        return appointmentRepository.findByPatientId(patientId).stream()
                .map(appt -> {
                    Payment payment = paymentRepository.findByAppointmentId(appt.getId()).orElse(null);
                    return mapToResponse(appt, payment);
                })
                .collect(Collectors.toList());
    }

    /**
     * Step 10: Resolve doctor internal String ID by calling user-service.
     */
    private String getDoctorIdFromUserService(String oktaUid) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", oktaUid);
        headers.set("X-User-Role", "DOCTOR");
        headers.set("X-User-Email", "");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    userServiceUrl + "/api/v1/doctors/internal/id",
                    HttpMethod.GET,
                    entity,
                    String.class
            );
            return response.getBody();
        } catch (Exception e) {
            // Fallback for resilient local development / testing
            return oktaUid;
        }
    }

    /**
     * Step 11: Query all appointments scheduled with the doctor from MongoDB.
     */
    public List<AppointmentResponse> getDoctorAppointments(String oktaUid) {
        String doctorId = getDoctorIdFromUserService(oktaUid);
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(appt -> {
                    Payment payment = paymentRepository.findByAppointmentId(appt.getId()).orElse(null);
                    return mapToResponse(appt, payment);
                })
                .collect(Collectors.toList());
    }

    /**
     * Step 12: Transform MongoDB Appointment and Payment documents to response DTO.
     */
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
