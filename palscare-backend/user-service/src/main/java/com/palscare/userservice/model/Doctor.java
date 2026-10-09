package com.palscare.userservice.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Step 1: Doctor Profile Document Entity for MongoDB.
 * Represents medical practitioners registered on the PalsCare platform.
 * Stored in the 'doctors' MongoDB collection.
 */
@Document(collection = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    /**
     * Step 2: Primary Document Identifier.
     * Unique String ID (UUID or MongoDB ObjectId hex string).
     */
    @Id
    private String id;

    /**
     * Step 3: Reference link to the User document's oktaUid.
     * Enforced unique so one user account corresponds to one doctor profile.
     */
    @Indexed(unique = true)
    private String userUid;

    /**
     * Step 4: Full legal/display name of the doctor.
     */
    private String name;

    /**
     * Step 5: Medical specialty (e.g., "Cardiology", "Dermatology", "Pediatrics").
     */
    @Indexed
    private String specialty;

    /**
     * Step 6: Medical license/registration registration number with regulatory authority.
     */
    @Indexed(unique = true)
    private String registrationNumber;

    /**
     * Step 7: Alma mater or medical school attended.
     */
    private String university;

    /**
     * Step 8: Total years of clinical practice experience.
     */
    private Integer experienceYears;

    /**
     * Step 9: Clinical biography and professional summary.
     */
    private String bio;

    /**
     * Step 10: Current credential verification status (PENDING, APPROVED, REJECTED).
     */
    @Indexed
    private VerificationStatus verificationStatus;

    /**
     * Step 11: Contact email copied/cached from User for fast NoSQL queries.
     */
    private String userEmail;

    /**
     * Step 12: Contact phone copied/cached from User for fast NoSQL queries.
     */
    private String phone;

    /**
     * Step 13: Timestamp when this doctor profile was first generated.
     */
    private LocalDateTime createdAt;

    /**
     * Step 14: Lifecycle helper to initialize mandatory fields before saving.
     */
    public void initializeDefaults() {
        if (this.id == null || this.id.trim().isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.verificationStatus == null) {
            this.verificationStatus = VerificationStatus.PENDING;
        }
    }
}
