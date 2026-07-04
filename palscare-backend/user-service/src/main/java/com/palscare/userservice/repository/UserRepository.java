package com.palscare.userservice.repository;

import com.palscare.userservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailOrPhone(String email, String phone);
    Optional<User> findByEmailAndUserType(String email, com.palscare.userservice.model.UserType userType);
    Optional<User> findByPhoneAndUserType(String phone, com.palscare.userservice.model.UserType userType);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE (u.email = :identifier OR u.phone = :identifier) AND u.userType = :userType")
    Optional<User> findByIdentifierAndUserType(
        @org.springframework.data.repository.query.Param("identifier") String identifier,
        @org.springframework.data.repository.query.Param("userType") com.palscare.userservice.model.UserType userType
    );
}
