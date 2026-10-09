package com.palscare.doctorslotservice.repository;

import com.palscare.doctorslotservice.model.Chamber;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Step 1: MongoDB Repository for Chamber Document collection.
 * Manages database persistence for doctor clinics and practice locations in MongoDB.
 */
@Repository
public interface ChamberRepository extends MongoRepository<Chamber, String> {

    /**
     * Step 2: Fetch all chambers registered by a specific doctor.
     * @param doctorId Internal String ID of the doctor.
     * @return List of matching Chamber documents.
     */
    List<Chamber> findByDoctorId(String doctorId);
}
