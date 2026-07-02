package com.palscare.doctorslotservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId; // Logical reference to user-service Doctor ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chamber_id")
    private Chamber chamber; // Null indicates Video Consult

    @Column(name = "slot_day", nullable = false, length = 20)
    private String slotDay; // e.g. 'Monday', 'Tuesday'

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "slot_mode", nullable = false, length = 20)
    private SlotMode slotMode;

    @Column(name = "is_booked")
    private Boolean isBooked;

    @Version
    private Integer version; // Optimistic locking tag

    @PrePersist
    protected void onCreate() {
        if (isBooked == null) {
            isBooked = false;
        }
    }
}
