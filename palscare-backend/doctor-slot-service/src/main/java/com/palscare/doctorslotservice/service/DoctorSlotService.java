package com.palscare.doctorslotservice.service;

import com.palscare.doctorslotservice.dto.*;
import com.palscare.doctorslotservice.model.*;
import com.palscare.doctorslotservice.repository.ChamberRepository;
import com.palscare.doctorslotservice.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Step 1: Doctor Slot Service business logic layer.
 * Manages chamber clinics and consultation booking slots backed by MongoDB.
 */
@Service
@RequiredArgsConstructor
public class DoctorSlotService {

    private final ChamberRepository chamberRepository;
    private final SlotRepository slotRepository;
    private final RestTemplate restTemplate;

    @Value("${palscare.services.user-service.url}")
    private String userServiceUrl;

    /**
     * Step 2: Resolve doctor's internal MongoDB String ID by calling user-service.
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
     * Step 3: Register a new physical clinic/chamber in MongoDB.
     */
    public ChamberResponse registerChamber(String oktaUid, ChamberRequest request) {
        String doctorId = getDoctorIdFromUserService(oktaUid);

        Chamber chamber = Chamber.builder()
                .id(UUID.randomUUID().toString())
                .doctorId(doctorId)
                .name(request.getName())
                .address(request.getAddress())
                .createdAt(LocalDateTime.now())
                .build();

        Chamber saved = chamberRepository.save(chamber);
        return mapToChamberResponse(saved);
    }

    /**
     * Step 4: Fetch all chambers registered by the doctor from MongoDB.
     */
    public List<ChamberResponse> getChambers(String oktaUid) {
        String doctorId = getDoctorIdFromUserService(oktaUid);
        return chamberRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToChamberResponse)
                .collect(Collectors.toList());
    }

    /**
     * Step 5: Generate a new bookable consultation slot in MongoDB.
     */
    public SlotResponse generateSlot(String oktaUid, SlotGenerationRequest request) {
        String doctorId = getDoctorIdFromUserService(oktaUid);

        Chamber chamber = null;
        if (request.getSlotMode() == SlotMode.CHAMBER) {
            if (request.getChamberId() == null || request.getChamberId().trim().isEmpty()) {
                throw new IllegalArgumentException("Chamber ID is required for CHAMBER slot mode");
            }
            chamber = chamberRepository.findById(request.getChamberId())
                    .orElseThrow(() -> new IllegalArgumentException("Chamber not found with ID: " + request.getChamberId()));
            if (!chamber.getDoctorId().equals(doctorId)) {
                throw new IllegalArgumentException("Chamber does not belong to this doctor");
            }
        }

        // Check for duplicate slot in MongoDB
        if (slotRepository.existsByDoctorIdAndSlotDayAndStartTime(doctorId, request.getSlotDay(), request.getStartTime())) {
            throw new IllegalArgumentException("A slot already exists for " + request.getSlotDay() + " at " + request.getStartTime());
        }

        LocalTime endTime = request.getEndTime() != null ? request.getEndTime() : request.getStartTime().plusMinutes(30);

        Slot slot = Slot.builder()
                .id(UUID.randomUUID().toString())
                .doctorId(doctorId)
                .chamber(chamber)
                .slotDay(request.getSlotDay())
                .startTime(request.getStartTime())
                .endTime(endTime)
                .slotMode(request.getSlotMode())
                .isBooked(false)
                .build();

        Slot saved = slotRepository.save(slot);
        return mapToSlotResponse(saved);
    }

    /**
     * Step 6: Query all slots created by the authenticated doctor from MongoDB.
     */
    public List<SlotResponse> getSlotsForDoctor(String oktaUid) {
        String doctorId = getDoctorIdFromUserService(oktaUid);
        return slotRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToSlotResponse)
                .collect(Collectors.toList());
    }

    /**
     * Step 7: Query available (unbooked) slots for a specific doctor from MongoDB.
     */
    public List<SlotResponse> getAvailableSlotsForDoctor(String doctorId) {
        return slotRepository.findByDoctorIdAndIsBooked(doctorId, false).stream()
                .map(this::mapToSlotResponse)
                .collect(Collectors.toList());
    }

    /**
     * Step 8: Delete an unbooked consultation slot from MongoDB.
     */
    public void deleteSlot(String oktaUid, String slotId) {
        String doctorId = getDoctorIdFromUserService(oktaUid);
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found with ID: " + slotId));

        if (!slot.getDoctorId().equals(doctorId)) {
            throw new IllegalArgumentException("Slot does not belong to this doctor");
        }

        if (Boolean.TRUE.equals(slot.getIsBooked())) {
            throw new IllegalStateException("Cannot delete a slot that is already booked");
        }

        slotRepository.delete(slot);
    }

    /**
     * Step 9: Query a single slot by its unique MongoDB String ID.
     */
    public SlotResponse getSlotById(String slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found with ID: " + slotId));
        return mapToSlotResponse(slot);
    }

    /**
     * Step 10: Reserve/book a slot using optimistic locking in MongoDB.
     */
    public void bookSlot(String slotId, Integer version) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found with ID: " + slotId));

        if (Boolean.TRUE.equals(slot.getIsBooked())) {
            throw new IllegalStateException("Slot is already booked");
        }

        if (version != null && slot.getVersion() != null && !slot.getVersion().equals(version)) {
            throw new IllegalStateException("Slot version conflict - slot was recently modified");
        }

        slot.setIsBooked(true);
        slotRepository.save(slot);
    }

    /**
     * Step 11: Release a booked slot back to available state in MongoDB.
     */
    public void releaseSlot(String slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found with ID: " + slotId));
        slot.setIsBooked(false);
        slotRepository.save(slot);
    }

    /**
     * Step 12: Transform MongoDB Chamber document to response DTO.
     */
    private ChamberResponse mapToChamberResponse(Chamber chamber) {
        return ChamberResponse.builder()
                .id(chamber.getId())
                .doctorId(chamber.getDoctorId())
                .name(chamber.getName())
                .address(chamber.getAddress())
                .build();
    }

    /**
     * Step 13: Transform MongoDB Slot document to response DTO.
     */
    private SlotResponse mapToSlotResponse(Slot slot) {
        String chamberId = slot.getChamber() != null ? slot.getChamber().getId() : null;
        String chamberName = slot.getChamber() != null ? slot.getChamber().getName() : null;

        return SlotResponse.builder()
                .id(slot.getId())
                .doctorId(slot.getDoctorId())
                .chamberId(chamberId)
                .chamberName(chamberName)
                .slotDay(slot.getSlotDay())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .slotMode(slot.getSlotMode())
                .isBooked(slot.getIsBooked())
                .version(slot.getVersion())
                .build();
    }
}
