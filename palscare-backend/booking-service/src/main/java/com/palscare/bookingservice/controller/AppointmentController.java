package com.palscare.bookingservice.controller;

import com.palscare.bookingservice.dto.AppointmentRequest;
import com.palscare.bookingservice.dto.AppointmentResponse;
import com.palscare.bookingservice.security.GatewayUserPrincipal;
import com.palscare.bookingservice.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/patients/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponse> createAppointment(
            @AuthenticationPrincipal GatewayUserPrincipal principal,
            @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.createAppointment(principal.getUserId(), request));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponse> cancelAppointment(
            @AuthenticationPrincipal GatewayUserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(principal.getUserId(), id));
    }

    @GetMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponse>> getAppointments(
            @AuthenticationPrincipal GatewayUserPrincipal principal) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(principal.getUserId()));
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AppointmentResponse>> getDoctorAppointments(
            @AuthenticationPrincipal GatewayUserPrincipal principal) {
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(principal.getUserId()));
    }
}
