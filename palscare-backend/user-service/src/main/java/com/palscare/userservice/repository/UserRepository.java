package com.palscare.userservice.repository;

import com.palscare.userservice.model.User;
import com.palscare.userservice.model.UserType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Step 1: MongoDB Repository for User Document collection.
 * Provides out-of-the-box CRUD operations and custom query methods against MongoDB.
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Step 2: Query user by exact email match.
     * @param email User email string.
     * @return Optional containing matched User, if present.
     */
    Optional<User> findByEmail(String email);

    /**
     * Step 3: Query user by either email or phone number match.
     * @param email Candidate email.
     * @param phone Candidate phone.
     * @return Optional User document.
     */
    Optional<User> findByEmailOrPhone(String email, String phone);

    /**
     * Step 4: Query user by unique combination of email and user role.
     * @param email User email.
     * @param userType Role (PATIENT or DOCTOR).
     * @return Optional User document.
     */
    Optional<User> findByEmailAndUserType(String email, UserType userType);

    /**
     * Step 5: Query user by unique combination of phone and user role.
     * @param phone User phone number.
     * @param userType Role (PATIENT or DOCTOR).
     * @return Optional User document.
     */
    Optional<User> findByPhoneAndUserType(String phone, UserType userType);

    /**
     * Step 6: Query user by identifier (which can match either email or phone) and user role.
     * Uses MongoDB JSON query syntax.
     * @param identifier Either email or phone number.
     * @param userType Role of the account.
     * @return Optional User document.
     */
    @Query("{ '$or': [ {'email': ?0}, {'phone': ?0} ], 'userType': ?1 }")
    Optional<User> findByIdentifierAndUserType(String identifier, UserType userType);
}