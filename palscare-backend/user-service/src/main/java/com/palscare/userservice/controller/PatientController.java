package com.palscare.userservice.controller;

import com.palscare.userservice.dto.PatientProfileRequest;
import com.palscare.userservice.dto.PatientResponse;
import com.palscare.userservice.dto.DoctorResponse;
import com.palscare.userservice.security.GatewayUserPrincipal;
import com.palscare.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponse> getProfile(@AuthenticationPrincipal GatewayUserPrincipal principal) {
        return ResponseEntity.ok(userService.getPatientProfile(principal.getUserId()));
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponse> saveProfile(
            @AuthenticationPrincipal GatewayUserPrincipal principal,
            @Valid @RequestBody PatientProfileRequest request) {
        return ResponseEntity.ok(userService.updatePatientProfile(principal.getUserId(), request));
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<DoctorResponse>> getDoctors(@RequestParam(required = false) String specialty) {
        return ResponseEntity.ok(userService.getApprovedDoctors(specialty));
    }

    @GetMapping("/internal/id")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Long> getPatientId(@AuthenticationPrincipal GatewayUserPrincipal principal) {
        return ResponseEntity.ok(userService.getPatientId(principal.getUserId()));
    }
}
