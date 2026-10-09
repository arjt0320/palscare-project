package com.palscare.doctorslotservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Step 1: Chamber Response DTO.
 * Returned when doctor queries or creates consultation chambers in MongoDB.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChamberResponse {
    /** Step 2: Unique String ID generated in MongoDB */
    private String id;

    /** Step 3: Reference doctor String ID */
    private String doctorId;

    /** Step 4: Clinic / chamber name */
    private String name;

    /** Step 5: Clinic location / physical address */
    private String address;
}
