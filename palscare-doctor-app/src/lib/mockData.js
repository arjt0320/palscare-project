import doc1 from "@/assets/doctor-1.jpg";
import doc2 from "@/assets/doctor-2.jpg";
import doc3 from "@/assets/doctor-3.jpg";
import doc4 from "@/assets/doctor-4.jpg";

const isBrowser = typeof window !== "undefined";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function timeToMinutes(time) {
  const match = String(time || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export const specialties = [
  { label: "General Practice", emoji: "🩺" },
  { label: "Cardiology", emoji: "❤️" },
  { label: "Dermatology", emoji: "✨" },
  { label: "Pediatrics", emoji: "🧸" },
  { label: "Neurology", emoji: "🧠" },
  { label: "Dentistry", emoji: "🦷" },
  { label: "Psychiatry", emoji: "🌿" },
];

export const defaultDoctor = {
  id: "d1",
  name: "Dr. Amara Patel",
  initials: "AP",
  email: "dr.amara.patel@palscare.com",
  phone: "+1 (415) 555-0199",
  specialty: "General Practice",
  registrationNumber: "MED-REG-84920",
  university: "Johns Hopkins School of Medicine",
  experience: "8",
  experienceYears: 8,
  rating: 4.9,
  reviews: 218,
  feeUsd: 60,
  clinic: "Riverside Family Clinic",
  about: "Board-certified family physician with over 8 years of clinical experience in preventive medicine, chronic care management, and empathetic outpatient treatment.",
  verificationStatus: "APPROVED",
  chambers: [
    { id: "ch1", name: "Riverside Family Chamber", address: "Suite 400, Riverside Medical Plaza, 100 Bayview St" },
    { id: "ch2", name: "Downtown Health Hub", address: "742 Evergreen Terrace, Downtown Medical Building" },
  ],
  certifications: [
    { title: "Board Certification in Family Medicine", issuer: "ABFM - American Board of Family Medicine", date: "2020" },
    { title: "Advanced Cardiovascular Life Support (ACLS)", issuer: "American Heart Association", date: "2023" },
    { title: "Comprehensive Adolescent Care Fellowship", issuer: "Johns Hopkins Hospital", date: "2021" },
  ],
};

export const defaultChambers = [
  { id: "ch1", name: "Riverside Family Chamber", address: "Suite 400, Riverside Medical Plaza, 100 Bayview St" },
  { id: "ch2", name: "Downtown Health Hub", address: "742 Evergreen Terrace, Downtown Medical Building" },
];

// LocalStorage Keys
const CURRENT_DOCTOR_KEY = "palscare-current-doctor";
const REGISTERED_DOCTORS_KEY = "palscare-registered-doctors";
const DOCTOR_CHAMBERS_KEY = "palscare-doctor-chambers";
const DOCTOR_SLOTS_KEY_PREFIX = "palscare-doctor-slots-";
const APPOINTMENTS_KEY = "health-buddy-appointments";
const MEDICAL_HISTORY_KEY = "palscare-medical-history";
const PRESCRIPTIONS_KEY = "palscare-prescriptions";

export function initDemoDoctorSession() {
  if (!isBrowser) return;
  const curr = window.localStorage.getItem(CURRENT_DOCTOR_KEY);
  if (!curr) {
    window.localStorage.setItem(CURRENT_DOCTOR_KEY, JSON.stringify(defaultDoctor));
    window.localStorage.setItem("palscare-token", "demo_doctor_token_98765");
    window.localStorage.setItem("palscare-current-user", JSON.stringify({
      userId: defaultDoctor.id,
      email: defaultDoctor.email,
      phone: defaultDoctor.phone,
      name: defaultDoctor.name,
      role: "DOCTOR",
    }));
  }

  const chambers = window.localStorage.getItem(DOCTOR_CHAMBERS_KEY);
  if (!chambers) {
    window.localStorage.setItem(DOCTOR_CHAMBERS_KEY, JSON.stringify(defaultChambers));
  }
}

if (isBrowser) {
  initDemoDoctorSession();
}

export function getCurrentDoctor() {
  if (!isBrowser) return defaultDoctor;
  const curr = window.localStorage.getItem(CURRENT_DOCTOR_KEY);
  if (!curr) return defaultDoctor;
  return safeParse(curr, defaultDoctor);
}

export function logoutDoctor() {
  if (isBrowser) {
    window.localStorage.removeItem(CURRENT_DOCTOR_KEY);
    window.localStorage.removeItem("palscare-current-user");
    window.localStorage.removeItem("palscare-token");
    window.localStorage.setItem("palscare-doctor-logged-out", "true");
  }
}

export function updateDoctorProfile(profileData) {
  if (!isBrowser) return profileData;
  const current = getCurrentDoctor();
  const updated = {
    ...current,
    ...profileData,
    initials: (profileData.name || current.name || "AP")
      .replace("Dr. ", "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
  };

  window.localStorage.setItem(CURRENT_DOCTOR_KEY, JSON.stringify(updated));

  const registeredOnlyStr = window.localStorage.getItem(REGISTERED_DOCTORS_KEY) || "[]";
  const registeredOnly = safeParse(registeredOnlyStr, []);
  const nextList = registeredOnly.map((d) => (d.id === updated.id ? updated : d));
  window.localStorage.setItem(REGISTERED_DOCTORS_KEY, JSON.stringify(nextList));

  return updated;
}

// Demo Appointments for Doctor Portal
function getSeedDoctorAppointments() {
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const inTwoDays = new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];

  return [
    {
      id: "a1",
      patientId: "p1",
      patientName: "Alex Morgan",
      patientDetails: {
        name: "Alex Morgan",
        dob: "1991-08-14",
        gender: "Female",
        bloodGroup: "O+",
        phone: "+1 (415) 555-0142",
        allergies: ["Penicillin", "Peanuts"],
      },
      doctorId: "d1",
      date: todayStr,
      time: "04:30 PM",
      appointmentDatetime: `${todayStr}T16:30:00`,
      mode: "telemedicine",
      consultationMode: "VIDEO",
      status: "upcoming",
      reason: "Annual health check-up & prescription refill",
    },
    {
      id: "a2",
      patientId: "p2",
      patientName: "Liam Johnson",
      patientDetails: {
        name: "Liam Johnson",
        dob: "1985-03-22",
        gender: "Male",
        bloodGroup: "A+",
        phone: "+1 (415) 555-0182",
        allergies: ["Aspirin"],
      },
      doctorId: "d1",
      date: tomorrow,
      time: "10:00 AM",
      appointmentDatetime: `${tomorrow}T10:00:00`,
      mode: "in-person",
      consultationMode: "CHAMBER",
      status: "upcoming",
      reason: "Hypertension follow-up & blood pressure check",
    },
    {
      id: "a3",
      patientId: "p3",
      patientName: "Emma Watson",
      patientDetails: {
        name: "Emma Watson",
        dob: "1994-11-09",
        gender: "Female",
        bloodGroup: "B+",
        phone: "+1 (415) 555-0211",
        allergies: [],
      },
      doctorId: "d1",
      date: inTwoDays,
      time: "02:00 PM",
      appointmentDatetime: `${inTwoDays}T14:00:00`,
      mode: "in-person",
      consultationMode: "CHAMBER",
      status: "upcoming",
      reason: "Seasonal allergy review & inhaler refill",
    },
    {
      id: "a4",
      patientId: "p4",
      patientName: "Robert Davis",
      patientDetails: {
        name: "Robert Davis",
        dob: "1978-06-14",
        gender: "Male",
        bloodGroup: "O-",
        phone: "+1 (415) 555-0319",
        allergies: ["Sulfa drugs"],
      },
      doctorId: "d1",
      date: "2026-05-20",
      time: "11:30 AM",
      appointmentDatetime: "2026-05-20T11:30:00",
      mode: "in-person",
      consultationMode: "CHAMBER",
      status: "completed",
      reason: "Routine diabetes checkup & fasting glucose review",
    },
    {
      id: "a5",
      patientId: "p5",
      patientName: "Sarah Miller",
      patientDetails: {
        name: "Sarah Miller",
        dob: "1990-09-02",
        gender: "Female",
        bloodGroup: "AB+",
        phone: "+1 (415) 555-0455",
        allergies: [],
      },
      doctorId: "d1",
      date: "2026-05-12",
      time: "03:15 PM",
      appointmentDatetime: "2026-05-12T15:15:00",
      mode: "telemedicine",
      consultationMode: "VIDEO",
      status: "completed",
      reason: "Follow-up consultation after acute bronchitis",
    },
  ];
}

export function getAppointments() {
  if (!isBrowser) return getSeedDoctorAppointments();
  const existing = window.localStorage.getItem(APPOINTMENTS_KEY);
  if (!existing) {
    const seed = getSeedDoctorAppointments();
    window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(seed));
    return seed;
  }
  const parsed = safeParse(existing, []);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    const seed = getSeedDoctorAppointments();
    window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(seed));
    return seed;
  }
  return parsed;
}

export function setAppointments(nextAppointments) {
  if (isBrowser) {
    window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(nextAppointments));
  }
  return nextAppointments;
}

export const appointments = getAppointments();

// Medical History & Diagnostic Reports
export const baseMedicalHistory = [
  {
    id: "m1",
    date: "2026-05-28",
    type: "lab",
    title: "Lipid Profile Panel",
    detail: "Total cholesterol: 218 mg/dL, LDL: 132 mg/dL. Elevated cardiac risk markers.",
    doctorId: "d1",
    reportFileUrl: true,
    reportFileName: "lipid_panel.pdf",
  },
  {
    id: "m2",
    date: "2026-04-15",
    type: "lab",
    title: "Complete Blood Count (CBC)",
    detail: "WBC 6.4, RBC 4.8, Platelets 142k. Mildly reduced platelet index.",
    doctorId: "d1",
    reportFileUrl: true,
    reportFileName: "cbc_report.pdf",
  },
  {
    id: "m3",
    date: "2026-03-10",
    type: "visit",
    title: "Annual Physical Vitals",
    detail: "BP 122/80, Pulse 72 bpm. General health evaluation within expected limits.",
    doctorId: "d1",
  },
  {
    id: "m4",
    date: "2026-01-20",
    type: "diagnosis",
    title: "Mild Seasonal Bronchitis",
    detail: "Dry cough, mild fever. Responded well to oral antibiotics and hydration.",
    doctorId: "d1",
  },
];

export function getMedicalHistory() {
  if (!isBrowser) return baseMedicalHistory;
  const existing = window.localStorage.getItem(MEDICAL_HISTORY_KEY);
  if (!existing) {
    window.localStorage.setItem(MEDICAL_HISTORY_KEY, JSON.stringify(baseMedicalHistory));
    return baseMedicalHistory;
  }
  return safeParse(existing, baseMedicalHistory);
}

export function addMedicalHistoryEntry(entry) {
  if (!isBrowser) return [];
  const current = getMedicalHistory();
  const next = [
    {
      id: `m_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      ...entry,
    },
    ...current,
  ];
  window.localStorage.setItem(MEDICAL_HISTORY_KEY, JSON.stringify(next));
  return next;
}

export const medicalHistory = getMedicalHistory();

// Prescriptions
const basePrescriptions = [
  {
    id: "p1",
    doctorId: "d1",
    date: "2026-05-28",
    title: "Seasonal allergies care",
    medications: [
      { name: "Cetirizine", dosage: "10 mg", frequency: "Once daily" },
      { name: "Fluticasone nasal spray", dosage: "50 mcg", frequency: "1 spray each nostril AM" },
    ],
    notes: "Take with water. Continue for 2 weeks or until pollen season abates.",
  },
];

export function getPrescriptions() {
  if (!isBrowser) return basePrescriptions;
  const stored = window.localStorage.getItem(PRESCRIPTIONS_KEY);
  if (!stored) {
    window.localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(basePrescriptions));
    return basePrescriptions;
  }
  return safeParse(stored, basePrescriptions);
}

export function addPrescription(prescriptionData) {
  if (!isBrowser) return;
  const current = getPrescriptions();
  const newPrescription = {
    id: `p_${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    ...prescriptionData,
  };
  const next = [newPrescription, ...current];
  window.localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(next));

  addMedicalHistoryEntry({
    type: "prescription",
    title: prescriptionData.title || "Prescription Order",
    detail: prescriptionData.notes || "New medication schedule added.",
    doctorId: prescriptionData.doctorId,
  });

  return newPrescription;
}

export const prescriptions = getPrescriptions();

// Doctor Chambers
export function getChambers() {
  if (!isBrowser) return defaultChambers;
  const stored = window.localStorage.getItem(DOCTOR_CHAMBERS_KEY);
  if (!stored) {
    window.localStorage.setItem(DOCTOR_CHAMBERS_KEY, JSON.stringify(defaultChambers));
    return defaultChambers;
  }
  return safeParse(stored, defaultChambers);
}

export function addChamber(name, address) {
  const current = getChambers();
  const newChamber = {
    id: `ch_${Date.now()}`,
    name,
    address,
  };
  const next = [...current, newChamber];
  if (isBrowser) {
    window.localStorage.setItem(DOCTOR_CHAMBERS_KEY, JSON.stringify(next));
  }
  return newChamber;
}

// Doctor Slots Management
export function getDoctorSlots(doctorId = "d1") {
  if (!isBrowser) return [];
  const key = `${DOCTOR_SLOTS_KEY_PREFIX}${doctorId}`;
  const existing = window.localStorage.getItem(key);
  if (!existing) {
    const defaultSlots = [
      { id: "s1", day: "Monday", time: "09:00 AM", mode: "chamber", chamberName: "Riverside Family Chamber", isBooked: false, patientName: "" },
      { id: "s2", day: "Monday", time: "10:30 AM", mode: "chamber", chamberName: "Riverside Family Chamber", isBooked: true, patientName: "Alex Morgan" },
      { id: "s3", day: "Tuesday", time: "02:00 PM", mode: "chamber", chamberName: "Downtown Health Hub", isBooked: false, patientName: "" },
      { id: "s4", day: "Wednesday", time: "11:00 AM", mode: "chamber", chamberName: "Riverside Family Chamber", isBooked: false, patientName: "" },
      { id: "s5", day: "Thursday", time: "04:30 PM", mode: "chamber", chamberName: "Riverside Family Chamber", isBooked: false, patientName: "" },
      { id: "s6", day: "Friday", time: "09:30 AM", mode: "chamber", chamberName: "Downtown Health Hub", isBooked: false, patientName: "" },
    ];
    window.localStorage.setItem(key, JSON.stringify(defaultSlots));
    return defaultSlots;
  }
  return safeParse(existing, []);
}

export function addDoctorSlot(doctorId, slot) {
  if (!isBrowser) return [];
  const current = getDoctorSlots(doctorId);
  const next = [
    ...current,
    {
      id: `s_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      isBooked: false,
      patientName: "",
      ...slot,
    },
  ];
  const key = `${DOCTOR_SLOTS_KEY_PREFIX}${doctorId}`;
  window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function removeDoctorSlot(doctorId, slotId) {
  if (!isBrowser) return [];
  const current = getDoctorSlots(doctorId);
  const next = current.filter((s) => s.id !== slotId);
  const key = `${DOCTOR_SLOTS_KEY_PREFIX}${doctorId}`;
  window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}

// Demo API Shims (100% offline, zero network requests)
export async function apiGetCurrentDoctor() {
  return getCurrentDoctor();
}

export async function apiLoginDoctor(email, password) {
  const doc = getCurrentDoctor();
  window.localStorage.removeItem("palscare-doctor-logged-out");
  window.localStorage.setItem("palscare-token", "demo_doctor_token_" + Date.now());
  return { success: true, doctor: doc };
}

export async function apiRegisterDoctor(doctorData) {
  const initials = (doctorData.name || "Dr. User")
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const newDoc = {
    ...defaultDoctor,
    ...doctorData,
    id: `d_${Date.now()}`,
    initials,
    verificationStatus: "APPROVED",
  };

  window.localStorage.setItem(CURRENT_DOCTOR_KEY, JSON.stringify(newDoc));
  window.localStorage.removeItem("palscare-doctor-logged-out");
  window.localStorage.setItem("palscare-token", "demo_doctor_token_" + Date.now());

  return { success: true, doctor: newDoc };
}

export async function apiGetDoctorAppointments() {
  return getAppointments();
}

export async function apiUpdateDoctorProfile(doctorData) {
  return updateDoctorProfile(doctorData);
}

export async function apiGetChambers() {
  return getChambers();
}

export async function apiAddChamber(name, address) {
  return addChamber(name, address);
}

export async function apiGetDoctorSlots(doctorId = "d1") {
  const current = getCurrentDoctor();
  const docId = current ? current.id : doctorId;
  const rawSlots = getDoctorSlots(docId);
  return rawSlots.map((s) => ({
    id: s.id,
    slotDay: s.day,
    startTime: s.time,
    slotMode: s.mode || "CHAMBER",
    chamber: { name: s.chamberName || "Clinic" },
    isBooked: s.isBooked,
    patientName: s.patientName || "",
  }));
}

export async function apiAddDoctorSlot(day, startTime, mode = "chamber", chamberId) {
  const current = getCurrentDoctor();
  const docId = current ? current.id : "d1";
  const chambers = getChambers();
  const chamber = chambers.find((c) => c.id === chamberId) || chambers[0];

  const newSlot = {
    day,
    time: startTime,
    mode: mode.toLowerCase(),
    chamberName: chamber ? chamber.name : "Clinic",
  };

  addDoctorSlot(docId, newSlot);
  return { success: true };
}

export async function apiRemoveDoctorSlot(slotId) {
  const current = getCurrentDoctor();
  const docId = current ? current.id : "d1";
  removeDoctorSlot(docId, slotId);
  return { success: true };
}

export async function apiRequest(path, method = "GET", body = null) {
  // Local fallback router for any internal requests
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

  if (path.includes("/doctors/profile")) {
    return getCurrentDoctor();
  }

  if (path.includes("/doctors/onboarding")) {
    return updateDoctorProfile(body || {});
  }

  return { success: true };
}