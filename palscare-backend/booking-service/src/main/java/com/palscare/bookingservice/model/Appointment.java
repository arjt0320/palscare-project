package com.palscare.bookingservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId; // Logical reference to user-service Patient ID

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId; // Logical reference to user-service Doctor ID

    @Column(name = "slot_id", unique = true, nullable = false)
    private Long slotId; // Logical reference to doctor-slot-service Slot ID

    @Column(name = "booking_date", updatable = false)
    private LocalDateTime bookingDate;

    @Column(name = "appointment_datetime", nullable = false)
    private LocalDateTime appointmentDatetime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AppointmentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "consultation_mode", nullable = false, length = 20)
    private ConsultationMode consultationMode;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @PrePersist
    protected void onCreate() {
        bookingDate = LocalDateTime.now();
        if (status == null) {
            status = AppointmentStatus.BOOKED;
        }
    }
}
