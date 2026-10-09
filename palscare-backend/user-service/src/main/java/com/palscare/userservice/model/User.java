package com.palscare.userservice.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Step 1: User Document Entity for MongoDB.
 * Represents registered users (both DOCTOR and PATIENT).
 * Backed by the 'users' MongoDB collection.
 */
@Document(collection = "users")
@CompoundIndexes({
    // Step 2: Ensure unique email per user type (e.g. same email cannot register twice as PATIENT)
    @CompoundIndex(name = "email_userType_idx", def = "{'email': 1, 'userType': 1}", unique = true),
    // Step 3: Ensure unique phone number per user type (sparse allows multiple users without phone)
    @CompoundIndex(name = "phone_userType_idx", def = "{'phone': 1, 'userType': 1}", unique = true, sparse = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    /**
     * Step 4: Primary Document Identifier.
     * Uses oktaUid (UUID string) as the document ID in MongoDB.
     */
    @Id
    private String oktaUid;

    /**
     * Step 5: Email address for authentication and notifications.
     */
    private String email;

    /**
     * Step 6: Contact phone number.
     */
    private String phone;

    /**
     * Step 7: BCrypt hashed password for secure login.
     */
    private String password;

    /**
     * Step 8: Role designation (PATIENT, DOCTOR, or ADMIN).
     */
    private UserType userType;

    /**
     * Step 9: Timestamp when the user account was created.
     */
    private LocalDateTime createdAt;

    /**
     * Step 10: Lifecycle helper method to set initial default values before persistence.
     */
    public void initializeDefaults() {
        if (this.oktaUid == null || this.oktaUid.trim().isEmpty()) {
            this.oktaUid = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
