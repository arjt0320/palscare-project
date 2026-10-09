package com.palscare.userservice.repository;

import com.palscare.userservice.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Step 1: MongoDB Repository for Patient Document collection.
 * Manages persistence and query operations on 'patients' documents.
 */
@Repository
public interface PatientRepository extends MongoRepository<Patient, String> {

    /**
     * Step 2: Retrieve patient medical profile by authenticated user account ID.
     * @param userUid Unique string ID of the authentication user account.
     * @return Optional containing Patient document if found.
     */
    Optional<Patient> findByUserUid(String userUid);
}