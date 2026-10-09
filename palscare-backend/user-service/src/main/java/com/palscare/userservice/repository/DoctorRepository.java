package com.palscare.userservice.repository;

import com.palscare.userservice.model.Doctor;
import com.palscare.userservice.model.VerificationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Step 1: MongoDB Repository for Doctor Document collection.
 * Manages persistence and query operations on 'doctors' documents.
 */
@Repository
public interface DoctorRepository extends MongoRepository<Doctor, String> {

    /**
     * Step 2: Retrieve doctor profile associated with a user's unique Okta/Auth UID.
     * @param userUid Unique string ID of the authentication user account.
     * @return Optional containing Doctor document if found.
     */
    Optional<Doctor> findByUserUid(String userUid);

    /**
     * Step 3: Fetch all doctors matching a specific credential verification status.
     * Used to list verified/approved practitioners.
     * @param verificationStatus The verification status (e.g., APPROVED).
     * @return List of matching Doctor documents.
     */
    List<Doctor> findByVerificationStatus(VerificationStatus verificationStatus);

    /**
     * Step 4: Fetch doctors filtered by clinical specialty and verification status.
     * @param specialty Medical specialty string.
     * @param verificationStatus The verification status (e.g., APPROVED).
     * @return List of matching Doctor documents.
     */
    List<Doctor> findBySpecialtyAndVerificationStatus(String specialty, VerificationStatus verificationStatus);
}