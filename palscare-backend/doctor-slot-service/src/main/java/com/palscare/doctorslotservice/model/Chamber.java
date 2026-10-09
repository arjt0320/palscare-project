package com.palscare.doctorslotservice.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Step 1: Chamber Document Entity for MongoDB.
 * Represents a physical consultation clinic/chamber where a doctor practices.
 * Backed by the 'chambers' collection in MongoDB.
 */
@Document(collection = "chambers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chamber {

    /**
     * Step 2: Primary document ID in MongoDB.
     */
    @Id
    private String id;

    /**
     * Step 3: Reference to the doctor's internal String ID from user-service.
     */
    @Indexed
    private String doctorId;

    /**
     * Step 4: Display name of the chamber or clinic.
     */
    private String name;

    /**
     * Step 5: Physical address / suite location of the clinic.
     */
    private String address;

    /**
     * Step 6: Registration timestamp.
     */
    private LocalDateTime createdAt;

    /**
     * Step 7: Lifecycle initialization helper.
     */
    public void initializeDefaults() {
        if (this.id == null || this.id.trim().isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
