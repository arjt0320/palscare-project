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

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorSlotController {

    private final DoctorSlotService doctorSlotService;

    @GetMapping("/chambers")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<ChamberResponse>> getChambers(@AuthenticationPrincipal GatewayUserPrincipal principal) {
        return ResponseEntity.ok(doctorSlotService.getChambers(principal.getUserId()));
    }

    @PostMapping("/chambers")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ChamberResponse> registerChamber(
            @AuthenticationPrincipal GatewayUserPrincipal principal,
            @Valid @RequestBody ChamberRequest request) {
        return ResponseEntity.ok(doctorSlotService.registerChamber(principal.getUserId(), request));
    }

    @GetMapping("/slots")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<SlotResponse>> getSlots(@AuthenticationPrincipal GatewayUserPrincipal principal) {
        return ResponseEntity.ok(doctorSlotService.getSlotsForDoctor(principal.getUserId()));
    }

    @PostMapping("/slots/generate")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<SlotResponse> generateSlot(
            @AuthenticationPrincipal GatewayUserPrincipal principal,
            @Valid @RequestBody SlotGenerationRequest request) {
        return ResponseEntity.ok(doctorSlotService.generateSlot(principal.getUserId(), request));
    }

    @DeleteMapping("/slots/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void> deleteSlot(
            @AuthenticationPrincipal GatewayUserPrincipal principal,
            @PathVariable Long id) {
        doctorSlotService.deleteSlot(principal.getUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/slots/internal/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<SlotResponse> getSlotById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorSlotService.getSlotById(id));
    }

    @PutMapping("/slots/internal/{id}/book")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<Void> bookSlot(@PathVariable Long id, @RequestParam Integer version) {
        doctorSlotService.bookSlot(id, version);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/slots/internal/{id}/release")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<Void> releaseSlot(@PathVariable Long id) {
        doctorSlotService.releaseSlot(id);
        return ResponseEntity.ok().build();
    }
}
