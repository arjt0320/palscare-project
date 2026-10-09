/**
 * PalsCare Mock API Client (Demo Mode)
 * Replaced all external network fetch calls with local demo responses.
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

export async function apiRequest(path, method = "GET", body = null, role = "PATIENT") {
  // Simulate instant client response without network calls
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

  if (path.includes("/patients/profile")) {
    if (method === "POST" && body) {
      return updatePatientProfile(body);
    }
    return getCurrentUser();
  }

  if (path.includes("/patients/doctors") && path.includes("/slots")) {
    const match = path.match(/doctors\/([^/]+)\/slots/);
    const docId = match ? match[1] : "d1";
    return generateDoctorSlots(docId);
  }

  if (path.includes("/patients/doctors")) {
    return doctors;
  }

  if (path.includes("/patients/appointments") && path.includes("/cancel")) {
    const match = path.match(/appointments\/([^/]+)\/cancel/);
    if (match) {
      updateAppointmentStatus(match[1], "cancelled");
    }
    return { success: true };
  }

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
