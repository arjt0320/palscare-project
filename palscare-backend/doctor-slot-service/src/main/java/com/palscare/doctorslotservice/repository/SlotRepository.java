package com.palscare.doctorslotservice.repository;

import com.palscare.doctorslotservice.model.Slot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

/**
 * Step 1: MongoDB Repository for Slot Document collection.
 * Manages storage, queries, and optimistic locking updates for doctor consultation slots.
 */
@Repository
public interface SlotRepository extends MongoRepository<Slot, String> {

    /**
     * Step 2: Fetch all schedule slots configured by a specific doctor.
     * @param doctorId Internal String ID of the doctor.
     * @return List of Slot documents.
     */
    List<Slot> findByDoctorId(String doctorId);

    /**
     * Step 3: Fetch active (unbooked) slots available for patient booking.
     * @param doctorId Internal String ID of the doctor.
     * @param isBooked Boolean flag (false for open slots).
     * @return List of available Slot documents.
     */
    List<Slot> findByDoctorIdAndIsBooked(String doctorId, Boolean isBooked);

    /**
     * Step 4: Fetch slots for a specific day of the week.
     * @param doctorId Internal String ID of the doctor.
     * @param slotDay Day string (e.g. "Monday").
     * @return List of Slot documents.
     */
    List<Slot> findByDoctorIdAndSlotDay(String doctorId, String slotDay);

    /**
     * Step 5: Check if a duplicate slot already exists for doctor at same day and time.
     * @param doctorId Doctor String ID.
     * @param slotDay Day string.
     * @param startTime Starting time.
     * @return True if a slot already exists.
     */
    boolean existsByDoctorIdAndSlotDayAndStartTime(String doctorId, String slotDay, LocalTime startTime);
}
