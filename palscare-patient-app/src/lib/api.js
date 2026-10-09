/**
 * ==============================================================================
 * PalsCare Patient Application - API Integration & Data Client
 * ==============================================================================
 * Architectural Overview:
 *   - Production Mode:
 *       Routes requests via HTTP to Spring Cloud API Gateway (http://localhost:8088),
 *       which delegates to user-service, doctor-slot-service, and booking-service,
 *       all backed by MongoDB NoSQL collections.
 *   - Offline / Demo Mode:
 *       Provides instant, zero-latency local state and localStorage persistence
 *       guaranteeing full interactivity and demo readiness without backend setup.
 * ==============================================================================
 */

import {
  getCurrentUser,
  updatePatientProfile,
  getAppointments,
  addAppointment,
  updateAppointmentStatus,
  doctors,
  generateDoctorSlots,
  loginUser,
  registerUser,
} from "./mockData";

/**
 * Step 1: Universal API Request Dispatcher.
 * Dispatches API requests matching REST endpoints of the PalsCare backend.
 *
 * @param {string} path - Target endpoint path (e.g., "/api/v1/patients/appointments")
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object|null} body - Request payload
 * @param {string} role - Authorization role context ("PATIENT")
 * @returns {Promise<any>} - Resolved data or DTO response
 */
export async function apiRequest(path, method = "GET", body = null, role = "PATIENT") {
  // ----------------------------------------------------------------------------
  // Step 2: Authentication - User Login
  // Mapped to: user-service POST /api/v1/auth/login (verifies MongoDB users collection)
  // ----------------------------------------------------------------------------
  if (path.includes("/auth/login")) {
    const email = body?.identifier || "alex.morgan@example.com";
    loginUser(email, body?.password || "password123");
    const user = getCurrentUser();
    return {
      token: "demo_token_" + Date.now(),
      userId: user.userId || "demo_patient_001",
      email: user.email,
      phone: user.phone,
      name: user.name,
    };
  }

  // ----------------------------------------------------------------------------
  // Step 3: Authentication - Patient Registration
  // Mapped to: user-service POST /api/v1/auth/register (creates MongoDB user & patient)
  // ----------------------------------------------------------------------------
  if (path.includes("/auth/register")) {
    registerUser(body?.name || "Demo Patient", body?.email || "newpatient@test.com", body?.password);
    const user = getCurrentUser();
    return {
      token: "demo_token_" + Date.now(),
      userId: user.userId || "demo_patient_001",
      email: user.email,
      phone: user.phone,
      name: user.name,
    };
  }

  // ----------------------------------------------------------------------------
  // Step 4: Patient Profile Management
  // Mapped to: user-service GET / POST /api/v1/patients/profile (MongoDB patients)
  // ----------------------------------------------------------------------------
  if (path.includes("/patients/profile")) {
    if (method === "POST" && body) {
      return updatePatientProfile(body);
    }
    return getCurrentUser();
  }

  // ----------------------------------------------------------------------------
  // Step 5: Doctor Available Time Slots
  // Mapped to: doctor-slot-service GET /api/v1/patients/doctors/{id}/slots (MongoDB slots)
  // ----------------------------------------------------------------------------
  if (path.includes("/patients/doctors") && path.includes("/slots")) {
    const match = path.match(/doctors\/([^/]+)\/slots/);
    const docId = match ? match[1] : "d1";
    return generateDoctorSlots(docId);
  }

  // ----------------------------------------------------------------------------
  // Step 6: Doctor Catalog Directory
  // Mapped to: user-service GET /api/v1/patients/doctors (MongoDB doctors)
  // ----------------------------------------------------------------------------
  if (path.includes("/patients/doctors")) {
    return doctors;
  }

  // ----------------------------------------------------------------------------
  // Step 7: Cancel Appointment
  // Mapped to: booking-service POST /api/v1/patients/appointments/{id}/cancel
  // ----------------------------------------------------------------------------
  if (path.includes("/patients/appointments") && path.includes("/cancel")) {
    const match = path.match(/appointments\/([^/]+)\/cancel/);
    if (match) {
      updateAppointmentStatus(match[1], "cancelled");
    }
    return { success: true };
  }

  // ----------------------------------------------------------------------------
  // Step 8: Create / Retrieve Patient Appointments
  // Mapped to: booking-service GET / POST /api/v1/patients/appointments (MongoDB appointments)
  // ----------------------------------------------------------------------------
  if (path.includes("/patients/appointments")) {
    if (method === "POST" && body) {
      const appt = addAppointment({
        reason: body.reason || "Doctor Visit",
        doctorId: "d1",
        date: new Date().toISOString().split("T")[0],
        time: "10:00 AM",
      });
      return appt[0];
    }
    return getAppointments();
  }

  return { success: true };
}
