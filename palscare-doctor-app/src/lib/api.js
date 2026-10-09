/**
 * PalsCare Doctor Mock API Client (Demo Mode)
 * Replaced all external network fetch calls with local demo responses.
 */
import {
  getCurrentDoctor,
  updateDoctorProfile,
  getAppointments,
  getChambers,
  addChamber,
} from "./mockData";

export async function apiRequest(path, method = "GET", body = null, role = "DOCTOR") {
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

  if (path.includes("/doctors/profile")) {
    return getCurrentDoctor();
  }

  if (path.includes("/doctors/onboarding")) {
    if (method === "POST" && body) {
      return updateDoctorProfile(body);
    }
    return getCurrentDoctor();
  }

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

  if (path.includes("/doctors/chambers")) {
    if (method === "POST" && body) {
      return addChamber(body.name, body.address);
    }
    return getChambers();
  }

  if (path.includes("/appointments/doctor")) {
    return getAppointments();
  }

  return { success: true };
}
