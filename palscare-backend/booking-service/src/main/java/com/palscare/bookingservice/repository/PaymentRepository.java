package com.palscare.bookingservice.repository;

import com.palscare.bookingservice.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Step 1: MongoDB Repository for Payment Document collection.
 * Manages queries and storage for billing and transaction records in MongoDB.
 */
@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    /**
     * Step 2: Query payment record associated with an appointment.
     * @param appointmentId Unique String ID of the appointment.
     * @return Optional containing the Payment document.
     */
    Optional<Payment> findByAppointmentId(String appointmentId);

    /**
     * Step 3: Query payment record by payment gateway transaction ID.
     * @param transactionId Unique gateway transaction ID.
     * @return Optional containing the Payment document.
     */
    Optional<Payment> findByTransactionId(String transactionId);
}
