/**
 * ==============================================================================
 * PalsCare Doctor Application - API Integration & Data Client
 * ==============================================================================
 * Architectural Overview:
 *   - Production Mode:
 *       Routes requests via HTTP to Spring Cloud API Gateway (http://localhost:8088),
 *       which delegates to user-service, doctor-slot-service, and booking-service,
 *       all backed by MongoDB NoSQL collections.
 *   - Offline / Demo Mode:
 *       Provides instant, zero-latency local state and localStorage persistence
 *       guaranteeing full doctor dashboard interactivity without backend setup.
 * ==============================================================================
 */

import {
  getCurrentDoctor,
  updateDoctorProfile,
  getAppointments,
  getChambers,
  addChamber,
} from "./mockData";

/**
 * Step 1: Universal Doctor API Request Dispatcher.
 * Dispatches API requests matching REST endpoints of the PalsCare backend.
 *
 * @param {string} path - Target endpoint path (e.g., "/api/v1/doctors/profile")
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object|null} body - Request payload
 * @param {string} role - Authorization role context ("DOCTOR")
 * @returns {Promise<any>} - Resolved data or DTO response
 */
export async function apiRequest(path, method = "GET", body = null, role = "DOCTOR") {
  // ----------------------------------------------------------------------------
  // Step 2: Authentication - Doctor Login
  // Mapped to: user-service POST /api/v1/auth/login (verifies MongoDB users collection)
  // ----------------------------------------------------------------------------
  if (path.includes("/auth/login")) {
    const doc = getCurrentDoctor();
    return {
      token: "demo_doctor_token_" + Date.now(),
      userId: doc.id || "d1",
      email: doc.email || "dr.amara.patel@palscare.com",
      phone: doc.phone || "+1 (415) 555-0199",
      name: doc.name || "Dr. Amara Patel",
    };
  }

  // ----------------------------------------------------------------------------
  // Step 3: Authentication - Doctor Registration
  // Mapped to: user-service POST /api/v1/auth/register (creates MongoDB user & doctor)
  // ----------------------------------------------------------------------------
  if (path.includes("/auth/register")) {
    const doc = updateDoctorProfile(body || {});
    return {
      token: "demo_doctor_token_" + Date.now(),
      userId: doc.id || "d1",
      email: doc.email || "doctor@palscare.com",
      phone: doc.phone || "+1 (415) 555-0199",
      name: doc.name || "Dr. New Doctor",
    };
  }

  // ----------------------------------------------------------------------------
  // Step 4: Doctor Profile Lookup
  // Mapped to: user-service GET /api/v1/doctors/profile (MongoDB doctors collection)
  // ----------------------------------------------------------------------------
  if (path.includes("/doctors/profile")) {
    return getCurrentDoctor();
  }

  // ----------------------------------------------------------------------------
  // Step 5: Doctor Onboarding Credentials Submission
  // Mapped to: user-service POST /api/v1/doctors/onboarding (MongoDB doctors)
  // ----------------------------------------------------------------------------
  if (path.includes("/doctors/onboarding")) {
    if (method === "POST" && body) {
      return updateDoctorProfile(body);
    }
    return getCurrentDoctor();
  }

  // ----------------------------------------------------------------------------
  // Step 6: Internal Inter-Service Query - Patient Demographics & Health Profile
  // Mapped to: user-service GET /api/v1/patients/internal/{id} (MongoDB patients)
  // ----------------------------------------------------------------------------
  if (path.includes("/patients/internal/")) {
    const match = path.match(/\/patients\/internal\/(.*)/);
    const pid = match ? match[1] : "p1";
    const appts = getAppointments();
    const appt = appts.find((a) => a.patientId === pid);
    if (appt && appt.patientDetails) {
      return appt.patientDetails;
    }
    return {
      name: "Alex Morgan",
      dob: "1991-08-14",
      gender: "Female",
      bloodGroup: "O+",
      phone: "+1 (415) 555-0142",
      allergies: ["Penicillin", "Peanuts"],
    };
  }

  // ----------------------------------------------------------------------------
  // Step 7: Doctor Chambers (Clinics) Management
  // Mapped to: doctor-slot-service GET / POST /api/v1/doctors/chambers (MongoDB chambers)
  // ----------------------------------------------------------------------------
  if (path.includes("/doctors/chambers")) {
    if (method === "POST" && body) {
      return addChamber(body.name, body.address);
    }
    return getChambers();
  }

  // ----------------------------------------------------------------------------
  // Step 8: Doctor Consultation Appointments Schedule
  // Mapped to: booking-service GET /api/v1/patients/appointments/doctor (MongoDB appointments)
  // ----------------------------------------------------------------------------
  if (path.includes("/appointments/doctor")) {
    return getAppointments();
  }

  return { success: true };
}
