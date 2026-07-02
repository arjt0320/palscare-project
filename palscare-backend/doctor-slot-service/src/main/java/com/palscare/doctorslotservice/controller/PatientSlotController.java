package com.palscare.doctorslotservice.controller;

import com.palscare.doctorslotservice.dto.SlotResponse;
import com.palscare.doctorslotservice.service.DoctorSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientSlotController {

    private final DoctorSlotService doctorSlotService;

    @GetMapping("/doctors/{id}/slots")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<SlotResponse>> getAvailableSlots(@PathVariable Long id) {
        return ResponseEntity.ok(doctorSlotService.getAvailableSlotsForDoctor(id));
    }
}
