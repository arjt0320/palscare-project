package com.palscare.userservice.service;

import com.palscare.userservice.dto.*;
import com.palscare.userservice.model.*;
import com.palscare.userservice.repository.DoctorRepository;
import com.palscare.userservice.repository.PatientRepository;
import com.palscare.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Transactional
    public User registerUser(String oktaUid, String email, UserType userType) {
        if (userRepository.existsById(oktaUid)) {
            throw new IllegalArgumentException("User with UID already exists");
        }
        User user = User.builder()
                .oktaUid(oktaUid)
                .email(email)
                .userType(userType)
                .build();
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientProfile(String oktaUid) {
        Patient patient = patientRepository.findByUserOktaUid(oktaUid)
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));
        return mapToPatientResponse(patient);
    }

    @Transactional(readOnly = true)
    public Long getPatientId(String oktaUid) {
        return patientRepository.findByUserOktaUid(oktaUid)
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"))
                .getId();
    }

    @Transactional
    public PatientResponse updatePatientProfile(String oktaUid, PatientProfileRequest request) {
        User user = userRepository.findById(oktaUid)
                .orElseThrow(() -> new IllegalArgumentException("User not registered"));
        
        if (user.getUserType() != UserType.PATIENT) {
            throw new IllegalArgumentException("User is not a patient");
        }

        Patient patient = patientRepository.findByUserOktaUid(oktaUid)
                .orElse(new Patient());

        patient.setUser(user);
        patient.setName(request.getName());
        patient.setPhone(request.getPhone());
        patient.setDob(request.getDob());
        patient.setBloodGroup(request.getBloodGroup());

        Patient saved = patientRepository.save(patient);
        return mapToPatientResponse(saved);
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorProfile(String oktaUid) {
        Doctor doctor = doctorRepository.findByUserOktaUid(oktaUid)
                .orElseThrow(() -> new IllegalArgumentException("Doctor profile not found"));
        return mapToDoctorResponse(doctor);
    }

    @Transactional(readOnly = true)
    public Long getDoctorId(String oktaUid) {
        return doctorRepository.findByUserOktaUid(oktaUid)
                .orElseThrow(() -> new IllegalArgumentException("Doctor profile not found"))
                .getId();
    }

    @Transactional
    public DoctorResponse onboardDoctor(String oktaUid, DoctorOnboardingRequest request) {
        User user = userRepository.findById(oktaUid)
                .orElseThrow(() -> new IllegalArgumentException("User not registered"));

        if (user.getUserType() != UserType.DOCTOR) {
            throw new IllegalArgumentException("User is not a doctor");
        }

        Doctor doctor = doctorRepository.findByUserOktaUid(oktaUid)
                .orElse(new Doctor());

        doctor.setUser(user);
        doctor.setName(request.getName());
        doctor.setSpecialty(request.getSpecialty());
        doctor.setRegistrationNumber(request.getRegistrationNumber());
        doctor.setUniversity(request.getUniversity());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setBio(request.getBio());
        doctor.setVerificationStatus(VerificationStatus.APPROVED);

        Doctor saved = doctorRepository.save(doctor);
        return mapToDoctorResponse(saved);
    }

    private PatientResponse mapToPatientResponse(Patient patient) {
        return PatientResponse.builder()
                .id(patient.getId())
                .email(patient.getUser().getEmail())
                .name(patient.getName())
                .phone(patient.getPhone())
                .dob(patient.getDob())
                .bloodGroup(patient.getBloodGroup())
                .build();
    }

    private DoctorResponse mapToDoctorResponse(Doctor doctor) {
        return DoctorResponse.builder()
                .id(doctor.getId())
                .email(doctor.getUser().getEmail())
                .name(doctor.getName())
                .specialty(doctor.getSpecialty())
                .registrationNumber(doctor.getRegistrationNumber())
                .university(doctor.getUniversity())
                .experienceYears(doctor.getExperienceYears())
                .bio(doctor.getBio())
                .verificationStatus(doctor.getVerificationStatus())
                .build();
    }

    @Transactional(readOnly = true)
    public List<DoctorResponse> getApprovedDoctors(String specialty) {
        List<Doctor> doctors;
        if (specialty != null && !specialty.trim().isEmpty()) {
            doctors = doctorRepository.findBySpecialtyAndVerificationStatus(specialty, VerificationStatus.APPROVED);
        } else {
            doctors = doctorRepository.findByVerificationStatus(VerificationStatus.APPROVED);
        }
        return doctors.stream()
                .map(this::mapToDoctorResponse)
                .collect(Collectors.toList());
    }
}
