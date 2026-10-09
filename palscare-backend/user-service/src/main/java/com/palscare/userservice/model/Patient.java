//package com.palscare.userservice.model;
//
//import jakarta.persistence.*;
//import lombok.*;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "patients")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class Patient {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @OneToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_uid", referencedColumnName = "okta_uid", nullable = false)
//    private User user;
//
//    @Column(nullable = false, length = 100)
//    private String name;
//
//    @Column(length = 20)
//    private String phone;
//
//    private LocalDate dob;
//
//    @Column(name = "blood_group", length = 5)
//    private String bloodGroup;
//
//    @Column(name = "created_at", updatable = false)
//    private LocalDateTime createdAt;
//
//    @PrePersist
//    protected void onCreate() {
//        createdAt = LocalDateTime.now();
//    }
//}


package com.palscare.userservice.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userUid;

    private String name;

    private String phone;

    private LocalDate dob;

    private String bloodGroup;

    private LocalDateTime createdAt;
}