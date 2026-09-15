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
//@Table(name = "users", uniqueConstraints = {
//    @UniqueConstraint(columnNames = {"email", "user_type"}),
//    @UniqueConstraint(columnNames = {"phone", "user_type"})
//})

// for mongodb setup
//======================
@Document(collection = "users")
@CompoundIndexes({
        @CompoundIndex(name = "email_userType_idx", def = "{'email': 1, 'userType': 1}", unique = true),
        @CompoundIndex(name = "phone_userType_idx", def = "{'phone': 1, 'userType': 1}", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class  User {

    @Id
//    @Column(name = "okta_uid", length = 128)
    private String oktaUid;

//    @Column(nullable = false, length = 100)
    private String email;

//    @Column(length = 20)
    private String phone;

//    @Column(length = 255)
    private String password;

//    @Enumerated(EnumType.STRING)
//    @Column(name = "user_type", nullable = false, length = 20)
    private UserType userType;

//    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

//    @PrePersist
//    protected void onCreate() {
//        createdAt = LocalDateTime.now();
//        if (oktaUid == null) {
//            oktaUid = java.util.UUID.randomUUID().toString();
//        }
//    }

    public void initialize() {

        if (oktaUid == null) {
            oktaUid = UUID.randomUUID().toString();
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
