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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorSlotService {

    private final ChamberRepository chamberRepository;
    private final SlotRepository slotRepository;
    private final RestTemplate restTemplate;

    @Value("${palscare.services.user-service.url}")
    private String userServiceUrl;

    private Long getDoctorIdFromUserService(String oktaUid) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", oktaUid);
        headers.set("X-User-Role", "DOCTOR");
        headers.set("X-User-Email", "");

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<Long> response = restTemplate.exchange(
                    userServiceUrl + "/api/v1/doctors/internal/id",
                    HttpMethod.GET,
                    entity,
                    Long.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to resolve doctor internal ID from user-service: " + e.getMessage());
        }
    }

    @Transactional
    public ChamberResponse registerChamber(String oktaUid, ChamberRequest request) {
        Long doctorId = getDoctorIdFromUserService(oktaUid);

        Chamber chamber = Chamber.builder()
                .doctorId(doctorId)
                .name(request.getName())
                .address(request.getAddress())
                .build();

        Chamber saved = chamberRepository.save(chamber);
        return mapToChamberResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ChamberResponse> getChambers(String oktaUid) {
        Long doctorId = getDoctorIdFromUserService(oktaUid);
        return chamberRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToChamberResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SlotResponse generateSlot(String oktaUid, SlotGenerationRequest request) {
        Long doctorId = getDoctorIdFromUserService(oktaUid);

        Chamber chamber = null;
        if (request.getSlotMode() == SlotMode.CHAMBER) {
            if (request.getChamberId() == null) {
                throw new IllegalArgumentException("Chamber ID is required for CHAMBER slot mode");
            }
            chamber = chamberRepository.findById(request.getChamberId())
                    .orElseThrow(() -> new IllegalArgumentException("Chamber not found"));
            if (!chamber.getDoctorId().equals(doctorId)) {
                throw new IllegalArgumentException("Chamber does not belong to this doctor");
            }
        }

        if (slotRepository.existsDuplicateSlot(doctorId, request.getSlotDay(), request.getStartTime(), chamber)) {
            throw new IllegalArgumentException("Slot already exists for the specified day, time, and chamber/mode");
        }

        Slot slot = Slot.builder()
                .doctorId(doctorId)
                .chamber(chamber)
                .slotDay(request.getSlotDay())
                .startTime(request.getStartTime())
                .slotMode(request.getSlotMode())
                .isBooked(false)
                .build();

        Slot saved = slotRepository.save(slot);
        return mapToSlotResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getSlotsForDoctor(String oktaUid) {
        Long doctorId = getDoctorIdFromUserService(oktaUid);
        return slotRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToSlotResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getAvailableSlotsForDoctor(Long doctorId) {
        return slotRepository.findByDoctorIdAndIsBooked(doctorId, false).stream()
                .map(this::mapToSlotResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSlot(String oktaUid, Long slotId) {
        Long doctorId = getDoctorIdFromUserService(oktaUid);
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));

        if (!slot.getDoctorId().equals(doctorId)) {
            throw new IllegalArgumentException("Slot does not belong to this doctor");
        }

        if (Boolean.TRUE.equals(slot.getIsBooked())) {
            throw new IllegalStateException("Cannot delete a slot that is already booked");
        }

        slotRepository.delete(slot);
    }

    private ChamberResponse mapToChamberResponse(Chamber chamber) {
        return ChamberResponse.builder()
                .id(chamber.getId())
                .doctorId(chamber.getDoctorId())
                .name(chamber.getName())
                .address(chamber.getAddress())
                .build();
    }

    private SlotResponse mapToSlotResponse(Slot slot) {
        return SlotResponse.builder()
                .id(slot.getId())
                .doctorId(slot.getDoctorId())
                .chamberId(slot.getChamber() != null ? slot.getChamber().getId() : null)
                .slotDay(slot.getSlotDay())
                .startTime(slot.getStartTime())
                .slotMode(slot.getSlotMode())
                .isBooked(slot.getIsBooked())
                .version(slot.getVersion())
                .build();
    }

    @Transactional(readOnly = true)
    public SlotResponse getSlotById(Long slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));
        return mapToSlotResponse(slot);
    }

    @Transactional
    public void bookSlot(Long slotId, Integer version) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));
        if (Boolean.TRUE.equals(slot.getIsBooked())) {
            throw new IllegalStateException("Slot is already booked");
        }
        if (!slot.getVersion().equals(version)) {
            throw new IllegalStateException("Slot version mismatch");
        }
        slot.setIsBooked(true);
        slotRepository.save(slot);
    }

    @Transactional
    public void releaseSlot(Long slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));
        slot.setIsBooked(false);
        slotRepository.save(slot);
    }
}
