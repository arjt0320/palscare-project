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

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponse> getProfile(@AuthenticationPrincipal GatewayUserPrincipal principal) {
        return ResponseEntity.ok(userService.getDoctorProfile(principal.getUserId()));
    }

    @PostMapping("/onboarding")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorResponse> onboardDoctor(
            @AuthenticationPrincipal GatewayUserPrincipal principal,
            @Valid @RequestBody DoctorOnboardingRequest request) {
        return ResponseEntity.ok(userService.onboardDoctor(principal.getUserId(), request));
    }

    @GetMapping("/internal/id")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Long> getDoctorId(@AuthenticationPrincipal GatewayUserPrincipal principal) {
        return ResponseEntity.ok(userService.getDoctorId(principal.getUserId()));
    }
}
