package com.palscare.doctorslotservice.repository;

import com.palscare.doctorslotservice.model.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findByDoctorId(Long doctorId);
    List<Slot> findByDoctorIdAndIsBooked(Long doctorId, Boolean isBooked);
    List<Slot> findByDoctorIdAndSlotDay(Long doctorId, String slotDay);
}
