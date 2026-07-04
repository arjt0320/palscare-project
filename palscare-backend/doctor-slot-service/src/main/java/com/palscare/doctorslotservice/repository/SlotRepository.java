package com.palscare.doctorslotservice.repository;

import com.palscare.doctorslotservice.model.Slot;
import com.palscare.doctorslotservice.model.Chamber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findByDoctorId(Long doctorId);
    List<Slot> findByDoctorIdAndIsBooked(Long doctorId, Boolean isBooked);
    List<Slot> findByDoctorIdAndSlotDay(Long doctorId, String slotDay);

    @Query("SELECT COUNT(s) > 0 FROM Slot s WHERE s.doctorId = :doctorId AND s.slotDay = :slotDay AND s.startTime = :startTime AND (s.chamber = :chamber OR (s.chamber IS NULL AND :chamber IS NULL))")
    boolean existsDuplicateSlot(
            @Param("doctorId") Long doctorId,
            @Param("slotDay") String slotDay,
            @Param("startTime") LocalTime startTime,
            @Param("chamber") Chamber chamber
    );
}
