package com.palscare.doctorslotservice.controller;

import com.palscare.doctorslotservice.dto.SlotResponse;
import com.palscare.doctorslotservice.service.DoctorSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Step 1: Patient Slot Controller REST endpoints.
 * Enables patients to browse available booking slots for doctors in MongoDB.
 */
@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientSlotController {

    private final DoctorSlotService doctorSlotService;

    /**
     * Step 2: Fetch unbooked slots available for booking with a specific doctor.
     * @param id The internal MongoDB String ID of the doctor.
     * @return List of available SlotResponse DTOs.
     */
    @GetMapping("/doctors/{id}/slots")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<SlotResponse>> getAvailableSlots(@PathVariable String id) {
        return ResponseEntity.ok(doctorSlotService.getAvailableSlotsForDoctor(id));
    }
}
