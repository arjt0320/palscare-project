package com.palscare.userservice.controller;

import com.palscare.userservice.dto.DoctorResponse;
import com.palscare.userservice.dto.PatientProfileRequest;
import com.palscare.userservice.dto.PatientResponse;
import com.palscare.userservice.security.GatewayUserPrincipal;
import com.palscare.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Step 1: Patient Controller REST endpoints.
 * Handles patient profile management, doctor searches, and internal inter-service queries.
 */
@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final UserService userService;

    /**
     * Step 2: Fetch current authenticated patient's profile from MongoDB.
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponse> getProfile(@AuthenticationPrincipal GatewayUserPrincipal principal) {
        return ResponseEntity.ok(userService.getPatientProfile(principal.getUserId()));
    }

    /**
     * Step 3: Update current authenticated patient's demographics in MongoDB.
     */
    @PostMapping("/profile")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientResponse> saveProfile(
            @AuthenticationPrincipal GatewayUserPrincipal principal,
            @Valid @RequestBody PatientProfileRequest request) {
        return ResponseEntity.ok(userService.updatePatientProfile(principal.getUserId(), request));
    }

    /**
     * Step 4: Query approved doctors directory (optionally by specialty).
     */
    @GetMapping("/doctors")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<DoctorResponse>> getDoctors(@RequestParam(required = false) String specialty) {
        return ResponseEntity.ok(userService.getApprovedDoctors(specialty));
    }

    /**
     * Step 5: Internal inter-service endpoint: Get internal MongoDB String ID for patient.
     */
    @GetMapping("/internal/id")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<String> getPatientId(@AuthenticationPrincipal GatewayUserPrincipal principal) {
        return ResponseEntity.ok(userService.getPatientId(principal.getUserId()));
    }

    /**
     * Step 6: Internal inter-service endpoint: Retrieve patient summary by internal MongoDB String ID.
     */
    @GetMapping("/internal/{id}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<PatientResponse> getPatientByIdInternal(@PathVariable String id) {
        return ResponseEntity.ok(userService.getPatientById(id));
    }
}
