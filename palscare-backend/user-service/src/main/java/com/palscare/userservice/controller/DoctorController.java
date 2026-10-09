package com.palscare.userservice.controller;

import com.palscare.userservice.dto.DoctorOnboardingRequest;
import com.palscare.userservice.dto.DoctorResponse;
import com.palscare.userservice.security.GatewayUserPrincipal;
import com.palscare.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Step 1: Doctor Controller REST endpoints.
 * Handles doctor profile management, onboarding credential submissions, and inter-service queries.
 */
@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final UserService userService;

    /**
     * Step 2: Fetch current authenticated doctor's profile from MongoDB.
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponse> getProfile(@AuthenticationPrincipal GatewayUserPrincipal principal) {
        return ResponseEntity.ok(userService.getDoctorProfile(principal.getUserId()));
    }

    /**
     * Step 3: Submit doctor onboarding information (qualifications, bio, registration number) to MongoDB.
     */
    @PostMapping("/onboarding")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponse> onboardDoctor(
            @AuthenticationPrincipal GatewayUserPrincipal principal,
            @Valid @RequestBody DoctorOnboardingRequest request) {
        return ResponseEntity.ok(userService.onboardDoctor(principal.getUserId(), request));
    }

    /**
     * Step 4: Internal inter-service endpoint: Get internal MongoDB String ID for doctor.
     */
    @GetMapping("/internal/id")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<String> getDoctorId(@AuthenticationPrincipal GatewayUserPrincipal principal) {
        return ResponseEntity.ok(userService.getDoctorId(principal.getUserId()));
    }
}
