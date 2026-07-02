package com.palscare.userservice.repository;

import com.palscare.userservice.model.Doctor;
import com.palscare.userservice.model.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserOktaUid(String oktaUid);
    List<Doctor> findByVerificationStatus(VerificationStatus status);
    List<Doctor> findBySpecialtyAndVerificationStatus(String specialty, VerificationStatus status);
}
