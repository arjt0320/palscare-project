package com.palscare.bookingservice.repository;

import com.palscare.bookingservice.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Step 1: MongoDB Repository for Appointment Document collection.
 * Manages queries and storage for patient-doctor appointments in MongoDB.
 */
@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    /**
     * Step 2: Fetch all appointments for a patient.
     * @param patientId Patient's String ID.
     * @return List of Appointment documents.
     */
    List<Appointment> findByPatientId(String patientId);

    /**
     * Step 3: Fetch all appointments scheduled with a doctor.
     * @param doctorId Doctor's String ID.
     * @return List of Appointment documents.
     */
    List<Appointment> findByDoctorId(String doctorId);

    /**
     * Step 4: Query appointment associated with a specific slot.
     * @param slotId Slot's String ID.
     * @return Optional containing the Appointment document.
     */
    Optional<Appointment> findBySlotId(String slotId);
}
