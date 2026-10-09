package com.palscare.doctorslotservice.controller;

import com.palscare.doctorslotservice.dto.*;
import com.palscare.doctorslotservice.security.GatewayUserPrincipal;
import com.palscare.doctorslotservice.service.DoctorSlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Step 1: Doctor Slot Controller REST endpoints.
 * Handles doctor clinic chamber registration, slot schedules, and inter-service slot locking.
 */
@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorSlotController {

    private final DoctorSlotService doctorSlotService;

    /**
     * Step 2: Query chambers owned by authenticated doctor.
     */
    @GetMapping("/chambers")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<ChamberResponse>> getChambers(@AuthenticationPrincipal GatewayUserPrincipal principal) {
        return ResponseEntity.ok(doctorSlotService.getChambers(principal.getUserId()));
    }

    /**
     * Step 3: Register a new chamber in MongoDB.
     */
    @PostMapping("/chambers")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ChamberResponse> registerChamber(
            @AuthenticationPrincipal GatewayUserPrincipal principal,
            @Valid @RequestBody ChamberRequest request) {
        return ResponseEntity.ok(doctorSlotService.registerChamber(principal.getUserId(), request));
    }

    /**
     * Step 4: Query all weekly consultation slots for authenticated doctor.
     */
    @GetMapping("/slots")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<SlotResponse>> getSlots(@AuthenticationPrincipal GatewayUserPrincipal principal) {
        return ResponseEntity.ok(doctorSlotService.getSlotsForDoctor(principal.getUserId()));
    }

    /**
     * Step 5: Generate a new weekly recurring slot in MongoDB.
     */
    @PostMapping("/slots/generate")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<SlotResponse> generateSlot(
            @AuthenticationPrincipal GatewayUserPrincipal principal,
            @Valid @RequestBody SlotGenerationRequest request) {
        return ResponseEntity.ok(doctorSlotService.generateSlot(principal.getUserId(), request));
    }

    /**
     * Step 6: Delete a slot from MongoDB.
     */
    @DeleteMapping("/slots/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void> deleteSlot(
            @AuthenticationPrincipal GatewayUserPrincipal principal,
            @PathVariable String id) {
        doctorSlotService.deleteSlot(principal.getUserId(), id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Step 7: Internal inter-service endpoint: Retrieve slot details by MongoDB String ID.
     */
    @GetMapping("/slots/internal/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<SlotResponse> getSlotById(@PathVariable String id) {
        return ResponseEntity.ok(doctorSlotService.getSlotById(id));
    }

    /**
     * Step 8: Internal inter-service endpoint: Book/lock slot with optimistic concurrency check.
     */
    @PutMapping("/slots/internal/{id}/book")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<Void> bookSlot(@PathVariable String id, @RequestParam(required = false) Integer version) {
        doctorSlotService.bookSlot(id, version);
        return ResponseEntity.ok().build();
    }

    /**
     * Step 9: Internal inter-service endpoint: Release booked slot.
     */
    @PutMapping("/slots/internal/{id}/release")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<Void> releaseSlot(@PathVariable String id) {
        doctorSlotService.releaseSlot(id);
        return ResponseEntity.ok().build();
    }
}
