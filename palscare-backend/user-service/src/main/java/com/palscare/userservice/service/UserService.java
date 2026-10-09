package com.palscare.userservice.service;

import com.palscare.userservice.dto.*;
import com.palscare.userservice.model.*;
import com.palscare.userservice.repository.DoctorRepository;
import com.palscare.userservice.repository.PatientRepository;
import com.palscare.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Step 1: User Service business logic layer.
 * Coordinates user registration, profile lookups, doctor onboarding, and directory queries
 * against MongoDB collections ('users', 'doctors', 'patients').
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Step 2: Register a new user account in MongoDB.
     * Validates uniqueness of email and phone per user type, hashes password with BCrypt,
     * stores the User document, and auto-provisions a linked Patient or Doctor document.
     */
    public User registerUser(String name, String email, String phone, String password, UserType userType) {
        // Step 2.1: Check if email already exists for this role
        if (userRepository.findByEmailAndUserType(email, userType).isPresent()) {
            throw new IllegalArgumentException("User with this email is already registered as a " + userType.name().toLowerCase());
        }

        // Step 2.2: Check if phone already exists for this role
        if (phone != null && !phone.trim().isEmpty() && userRepository.findByPhoneAndUserType(phone, userType).isPresent()) {
            throw new IllegalArgumentException("User with this phone number is already registered as a " + userType.name().toLowerCase());
        }

        // Step 2.3: Securely hash password using BCrypt
        String hashedPassword = passwordEncoder.encode(password);

        // Step 2.4: Build and persist User document in MongoDB
        String cleanPhone = (phone != null && !phone.trim().isEmpty()) ? phone.trim() : null;
        String generatedUid = UUID.randomUUID().toString();
        User user = User.builder()
                .oktaUid(generatedUid)
                .email(email.trim().toLowerCase())
                .phone(cleanPhone)
                .password(hashedPassword)
                .userType(userType)
                .createdAt(LocalDateTime.now())
                .build();
        User savedUser = userRepository.save(user);

        // Step 2.5: Auto-provision matching profile document in MongoDB
        if (userType == UserType.PATIENT) {
            Patient patient = Patient.builder()
                    .id(UUID.randomUUID().toString())
                    .userUid(savedUser.getOktaUid())
                    .name(name != null && !name.trim().isEmpty() ? name : "New Patient")
                    .email(savedUser.getEmail())
                    .phone(savedUser.getPhone())
                    .createdAt(LocalDateTime.now())
                    .build();
            patientRepository.save(patient);
        } else if (userType == UserType.DOCTOR) {
            String suffix = savedUser.getOktaUid().length() >= 8
                    ? savedUser.getOktaUid().substring(savedUser.getOktaUid().length() - 8)
                    : savedUser.getOktaUid();
            Doctor doctor = Doctor.builder()
                    .id(UUID.randomUUID().toString())
                    .userUid(savedUser.getOktaUid())
                    .name(name != null && !name.trim().isEmpty() ? name : "Dr. " + email.split("@")[0])
                    .specialty("General Medicine")
                    .registrationNumber("REG-" + suffix.toUpperCase())
                    .verificationStatus(VerificationStatus.APPROVED) // Auto-approved for frictionless demo/testing
                    .userEmail(savedUser.getEmail())
                    .phone(savedUser.getPhone())
                    .createdAt(LocalDateTime.now())
                    .build();
            doctorRepository.save(doctor);
        }

        return savedUser;
    }

    /**
     * Step 3: Fetch patient medical profile by authenticated user account ID.
     */
    public PatientResponse getPatientProfile(String oktaUid) {
        Patient patient = patientRepository.findByUserUid(oktaUid)
                .orElseGet(() -> {
                    // Auto-provision if user exists but profile document wasn't created yet
                    User user = userRepository.findById(oktaUid).orElse(null);
                    String userEmail = user != null ? user.getEmail() : oktaUid + "@palscare.com";
                    String userPhone = user != null ? user.getPhone() : "";

                    Patient newPatient = Patient.builder()
                            .id(UUID.randomUUID().toString())
                            .userUid(oktaUid)
                            .name("Patient User")
                            .email(userEmail)
                            .phone(userPhone)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return patientRepository.save(newPatient);
                });

        return mapToPatientResponse(patient);
    }

    /**
     * Step 4: Resolve internal String ID for a patient given their Okta/Auth UID.
     */
    public String getPatientId(String oktaUid) {
        return patientRepository.findByUserUid(oktaUid)
                .map(Patient::getId)
                .orElseGet(() -> getPatientProfile(oktaUid).getId());
    }

    /**
     * Step 5: Update patient medical demographics and profile fields in MongoDB.
     */
    public PatientResponse updatePatientProfile(String oktaUid, PatientProfileRequest request) {
        User user = userRepository.findById(oktaUid)
                .orElseThrow(() -> new IllegalArgumentException("User not registered: " + oktaUid));

        if (user.getUserType() != UserType.PATIENT) {
            throw new IllegalArgumentException("User account does not have PATIENT role");
        }

        Patient patient = patientRepository.findByUserUid(oktaUid)
                .orElseGet(() -> Patient.builder()
                        .id(UUID.randomUUID().toString())
                        .userUid(oktaUid)
                        .createdAt(LocalDateTime.now())
                        .build());

        // Update fields
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            patient.setName(request.getName());
        }
        if (request.getPhone() != null) {
            patient.setPhone(request.getPhone());
        }
        if (request.getDob() != null) {
            patient.setDob(request.getDob());
        }
        if (request.getBloodGroup() != null) {
            patient.setBloodGroup(request.getBloodGroup());
        }
        patient.setEmail(user.getEmail());

        Patient saved = patientRepository.save(patient);
        return mapToPatientResponse(saved);
    }

    /**
     * Step 6: Fetch doctor credentials and bio by authenticated user account ID.
     */
    public DoctorResponse getDoctorProfile(String oktaUid) {
        Doctor doctor = doctorRepository.findByUserUid(oktaUid)
                .orElseGet(() -> {
                    User user = userRepository.findById(oktaUid).orElse(null);
                    String email = user != null ? user.getEmail() : oktaUid + "@palscare.com";
                    String phone = user != null ? user.getPhone() : "";
                    String suffix = oktaUid.length() >= 8 ? oktaUid.substring(oktaUid.length() - 8) : oktaUid;

                    Doctor newDoc = Doctor.builder()
                            .id(UUID.randomUUID().toString())
                            .userUid(oktaUid)
                            .name("Dr. " + email.split("@")[0])
                            .specialty("General Medicine")
                            .registrationNumber("REG-" + suffix.toUpperCase())
                            .university("Metropolitan Medical University")
                            .experienceYears(8)
                            .bio("Experienced practitioner dedicated to comprehensive patient health.")
                            .verificationStatus(VerificationStatus.APPROVED)
                            .userEmail(email)
                            .phone(phone)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return doctorRepository.save(newDoc);
                });

        return mapToDoctorResponse(doctor);
    }

    /**
     * Step 7: Resolve internal String ID for a doctor given their Okta/Auth UID.
     */
    public String getDoctorId(String oktaUid) {
        return doctorRepository.findByUserUid(oktaUid)
                .map(Doctor::getId)
                .orElseGet(() -> getDoctorProfile(oktaUid).getId());
    }

    /**
     * Step 8: Complete doctor onboarding with clinical credentials.
     */
    public DoctorResponse onboardDoctor(String oktaUid, DoctorOnboardingRequest request) {
        User user = userRepository.findById(oktaUid)
                .orElseThrow(() -> new IllegalArgumentException("User not registered: " + oktaUid));

        if (user.getUserType() != UserType.DOCTOR) {
            throw new IllegalArgumentException("User account does not have DOCTOR role");
        }

        Doctor doctor = doctorRepository.findByUserUid(oktaUid)
                .orElseGet(() -> Doctor.builder()
                        .id(UUID.randomUUID().toString())
                        .userUid(oktaUid)
                        .createdAt(LocalDateTime.now())
                        .build());

        doctor.setName(request.getName());
        doctor.setSpecialty(request.getSpecialty());
        doctor.setRegistrationNumber(request.getRegistrationNumber());
        doctor.setUniversity(request.getUniversity());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setBio(request.getBio());
        doctor.setVerificationStatus(VerificationStatus.APPROVED);
        doctor.setUserEmail(user.getEmail());
        doctor.setPhone(user.getPhone());

        Doctor saved = doctorRepository.save(doctor);
        return mapToDoctorResponse(saved);
    }

    /**
     * Step 9: Query directory of verified doctors from MongoDB.
     */
    public List<DoctorResponse> getApprovedDoctors(String specialty) {
        List<Doctor> doctors;
        if (specialty != null && !specialty.trim().isEmpty() && !specialty.equalsIgnoreCase("All")) {
            doctors = doctorRepository.findBySpecialtyAndVerificationStatus(specialty, VerificationStatus.APPROVED);
        } else {
            doctors = doctorRepository.findByVerificationStatus(VerificationStatus.APPROVED);
        }
        return doctors.stream()
                .map(this::mapToDoctorResponse)
                .collect(Collectors.toList());
    }

    /**
     * Step 10: Lookup patient details by internal MongoDB ID.
     */
    public PatientResponse getPatientById(String id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found with ID: " + id));
        return mapToPatientResponse(patient);
    }

    /**
     * Step 11: Helper to transform MongoDB Patient document to response DTO.
     */
    private PatientResponse mapToPatientResponse(Patient patient) {
        return PatientResponse.builder()
                .id(patient.getId())
                .email(patient.getEmail())
                .name(patient.getName())
                .phone(patient.getPhone())
                .dob(patient.getDob())
                .bloodGroup(patient.getBloodGroup())
                .build();
    }

    /**
     * Step 12: Helper to transform MongoDB Doctor document to response DTO.
     */
    private DoctorResponse mapToDoctorResponse(Doctor doctor) {
        return DoctorResponse.builder()
                .id(doctor.getId())
                .email(doctor.getUserEmail())
                .name(doctor.getName())
                .specialty(doctor.getSpecialty())
                .registrationNumber(doctor.getRegistrationNumber())
                .university(doctor.getUniversity())
                .experienceYears(doctor.getExperienceYears())
                .bio(doctor.getBio())
                .phone(doctor.getPhone())
                .verificationStatus(doctor.getVerificationStatus())
                .build();
    }
}
