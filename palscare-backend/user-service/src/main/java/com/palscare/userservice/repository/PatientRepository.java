//package com.palscare.userservice.repository;
//
//import com.palscare.userservice.model.Patient;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//import java.util.Optional;
//
//@Repository
//public interface PatientRepository extends JpaRepository<Patient, Long> {
//    Optional<Patient> findByUserOktaUid(String oktaUid);
//}


package com.palscare.userservice.repository;

import com.palscare.userservice.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends MongoRepository<Patient, String> {

    Optional<Patient> findByUserUid(String userUid);

}