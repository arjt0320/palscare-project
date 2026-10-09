package com.palscare.userservice.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Step 1: Patient Profile Document Entity for MongoDB.
 * Represents patients registered on the PalsCare platform.
 * Backed by the 'patients' MongoDB collection.
 */
@Document(collection = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    /**
     * Step 2: Primary Document Identifier.
     * Unique String ID (UUID or MongoDB ObjectId hex string).
     */
    @Id
    private String id;

    /**
     * Step 3: Reference link to the User document's oktaUid.
     * Enforces one patient profile per user account.
     */
    @Indexed(unique = true)
    private String userUid;

    /**
     * Step 4: Patient's full name.
     */
    private String name;

    /**
     * Step 5: Contact email copied/cached from User for fast NoSQL queries.
     */
    private String email;

    /**
     * Step 6: Contact phone number.
     */
    private String phone;

    /**
     * Step 7: Date of birth for medical age and dosage calculations.
     */
    private LocalDate dob;

    /**
     * Step 8: Blood group (e.g. "O+", "A+", "B+", "AB-").
     */
    private String bloodGroup;

    /**
     * Step 9: Creation timestamp.
     */
    private LocalDateTime createdAt;

    /**
     * Step 10: Lifecycle helper to initialize mandatory fields before saving.
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