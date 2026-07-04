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
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(String name, String email, String phone, String password, UserType userType) {
        if (userRepository.findByEmailAndUserType(email, userType).isPresent()) {
            throw new IllegalArgumentException("User with this email is already registered as a " + userType.name().toLowerCase());
        }
        if (phone != null && !phone.trim().isEmpty() && userRepository.findByPhoneAndUserType(phone, userType).isPresent()) {
            throw new IllegalArgumentException("User with this phone number is already registered as a " + userType.name().toLowerCase());
        }

        String hashedPassword = passwordEncoder.encode(password);

        User user = User.builder()
                .email(email)
                .phone(phone)
                .password(hashedPassword)
                .userType(userType)
                .build();
        User savedUser = userRepository.save(user);

        if (userType == UserType.PATIENT) {
            Patient patient = Patient.builder()
                    .user(savedUser)
                    .name(name)
                    .phone(phone)
                    .build();
            patientRepository.save(patient);
        } else if (userType == UserType.DOCTOR) {
            Doctor doctor = Doctor.builder()
                    .user(savedUser)
                    .name(name)
                    .specialty("General Practice")
                    .registrationNumber("REG-" + savedUser.getOktaUid().substring(Math.max(0, savedUser.getOktaUid().length() - 8)))
                    .verificationStatus(VerificationStatus.PENDING)
                    .build();
            doctorRepository.save(doctor);
        }

        return savedUser;
    }

    @Transactional
    public PatientResponse getPatientProfile(String oktaUid) {
        Patient patient = patientRepository.findByUserOktaUid(oktaUid)
                .orElseGet(() -> {
                    User user = userRepository.findById(oktaUid)
                            .orElseGet(() -> {
                                User newUser = User.builder()
                                        .oktaUid(oktaUid)
                                        .email(oktaUid + "@test.com")
                                        .userType(UserType.PATIENT)
                                        .build();
                                return userRepository.save(newUser);
                            });
                    Patient p = Patient.builder()
                            .user(user)
                            .name("New Patient")
                            .build();
                    return patientRepository.save(p);
                });
        return mapToPatientResponse(patient);
    }

    @Transactional
    public Long getPatientId(String oktaUid) {
        return patientRepository.findByUserOktaUid(oktaUid)
                .orElseGet(() -> {
                    User user = userRepository.findById(oktaUid)
                            .orElseGet(() -> {
                                User newUser = User.builder()
                                        .oktaUid(oktaUid)
                                        .email(oktaUid + "@test.com")
                                        .userType(UserType.PATIENT)
                                        .build();
                                return userRepository.save(newUser);
                            });
                    Patient p = Patient.builder()
                            .user(user)
                            .name("New Patient")
                            .build();
                    return patientRepository.save(p);
                })
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

    @Transactional
    public DoctorResponse getDoctorProfile(String oktaUid) {
        Doctor doctor = doctorRepository.findByUserOktaUid(oktaUid)
                .orElseGet(() -> {
                    User user = userRepository.findById(oktaUid)
                            .orElseGet(() -> {
                                User newUser = User.builder()
                                        .oktaUid(oktaUid)
                                        .email(oktaUid + "@test.com")
                                        .userType(UserType.DOCTOR)
                                        .build();
                                return userRepository.save(newUser);
                            });
                    Doctor d = Doctor.builder()
                            .user(user)
                            .name("New Doctor")
                            .specialty("General Practice")
                            .registrationNumber("REG-" + oktaUid.substring(Math.max(0, oktaUid.length() - 8)))
                            .verificationStatus(VerificationStatus.PENDING)
                            .build();
                    return doctorRepository.save(d);
                });
        return mapToDoctorResponse(doctor);
    }

    @Transactional
    public Long getDoctorId(String oktaUid) {
        return doctorRepository.findByUserOktaUid(oktaUid)
                .orElseGet(() -> {
                    User user = userRepository.findById(oktaUid)
                            .orElseGet(() -> {
                                User newUser = User.builder()
                                        .oktaUid(oktaUid)
                                        .email(oktaUid + "@test.com")
                                        .userType(UserType.DOCTOR)
                                        .build();
                                return userRepository.save(newUser);
                            });
                    Doctor d = Doctor.builder()
                            .user(user)
                            .name("New Doctor")
                            .specialty("General Practice")
                            .registrationNumber("REG-" + oktaUid.substring(Math.max(0, oktaUid.length() - 8)))
                            .verificationStatus(VerificationStatus.PENDING)
                            .build();
                    return doctorRepository.save(d);
                })
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
                .phone(patient.getPhone() != null ? patient.getPhone() : patient.getUser().getPhone())
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
                .phone(doctor.getUser().getPhone())
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
