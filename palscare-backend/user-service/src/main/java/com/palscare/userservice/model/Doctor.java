package com.palscare.userservice.model;

//import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.UUID;


//@Entity
//@Table(name = "doctors")

@Document(collection = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    //@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

//    @OneToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_uid", referencedColumnName = "okta_uid", nullable = false)
    
    @Indexed(unique = true)
    private User user;

    //@Column(nullable = false, length = 100)
    private String name;

    //@Column(nullable = false, length = 50)
    private String specialty;

    //@Column(name = "registration_number", unique = true, nullable = false, length = 50)
    @Indexed(unique = true)
    private String registrationNumber;

    //@Column(length = 150)
    private String university;

    //@Column(name = "experience_years")
    private Integer experienceYears;

    //@Column(columnDefinition = "TEXT")
    private String bio;

//    @Enumerated(EnumType.STRING)
    //@Column(name = "verification_status", length = 20)
    private VerificationStatus verificationStatus;

    //@Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

//    @PrePersist
//    protected void onCreate() {
//        createdAt = LocalDateTime.now();
//        if (verificationStatus == null) {
//            verificationStatus = VerificationStatus.PENDING;
//        }
//    }

    public void initialize() {

        doctor.setCreatedAt(LocalDateTime.now());

        if (doctor.getVerificationStatus() == null) {
            doctor.setVerificationStatus(VerificationStatus.PENDING);
        }
    }
}
