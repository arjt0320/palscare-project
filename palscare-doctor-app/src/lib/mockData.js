import doc1 from "@/assets/doctor-1.jpg";
import doc2 from "@/assets/doctor-2.jpg";
import doc3 from "@/assets/doctor-3.jpg";
import doc4 from "@/assets/doctor-4.jpg";

const isBrowser = typeof window !== "undefined";

function timeToMinutes(time) {
  const match = String(time || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return 0;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }
  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

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

const baseDoctors = [
  {
    id: "d1",
    name: "Dr. Amara Patel",
    specialty: "General Practice",
    photo: doc1,
    rating: 4.9,
    reviews: 218,
    experience: 8,
    clinic: "Riverside Family Clinic",
    distanceKm: 1.2,
    modes: ["in-person", "telemedicine"],
    feeUsd: 60,
    about: "Family medicine physician focused on preventive care and chronic disease management.",
    nextSlots: ["Today 4:30 PM", "Tomorrow 9:00 AM", "Tomorrow 11:30 AM"],
  },
  {
    id: "d2",
    name: "Dr. Julian Reyes",
    specialty: "Dermatology",
    photo: doc2,
    rating: 4.8,
    reviews: 164,
    experience: 11,
    clinic: "Bayview Skin & Aesthetics",
    distanceKm: 3.4,
    modes: ["in-person", "telemedicine"],
    feeUsd: 95,
    about: "Board-certified dermatologist specializing in acne, eczema, and skin cancer screening.",
    nextSlots: ["Tomorrow 10:00 AM", "Fri 2:00 PM", "Fri 4:30 PM"],
  },
  {
    id: "d3",
    name: "Dr. Mei Tanaka",
    specialty: "Pediatrics",
    photo: doc3,
    rating: 5.0,
    reviews: 312,
    experience: 9,
    clinic: "Little Steps Pediatric Center",
    distanceKm: 2.1,
    modes: ["in-person"],
    feeUsd: 75,
    about: "Gentle, child-first pediatric care from newborn through teen years.",
    nextSlots: ["Today 5:15 PM", "Tomorrow 8:30 AM"],
  },
  {
    id: "d4",
    name: "Dr. Henrik Olsen",
    specialty: "Cardiology",
    photo: doc4,
    rating: 4.7,
    reviews: 142,
    experience: 22,
    clinic: "Northshore Heart Institute",
    distanceKm: 5.8,
    modes: ["in-person", "telemedicine"],
    feeUsd: 140,
    about: "Senior cardiologist with deep experience in arrhythmia and preventive cardiology.",
    nextSlots: ["Fri 1:00 PM", "Mon 9:00 AM", "Mon 11:00 AM"],
  },
  {
    id: "d5",
    name: "Dr. Sofia Khan",
    specialty: "Psychiatry",
    photo: doc1,
    rating: 4.9,
    reviews: 91,
    experience: 12,
    clinic: "MindCare Wellness Center",
    distanceKm: 4.2,
    modes: ["telemedicine"],
    feeUsd: 110,
    about: "Mental health specialist offering supportive therapy and medication management.",
    nextSlots: ["Today 6:00 PM", "Tomorrow 12:00 PM"],
  },
  {
    id: "d6",
    name: "Dr. Ethan Brooks",
    specialty: "Dentistry",
    photo: doc2,
    rating: 4.8,
    reviews: 127,
    experience: 10,
    clinic: "Bright Smile Dental",
    distanceKm: 2.8,
    modes: ["in-person"],
    feeUsd: 80,
    about: "General dentist focused on preventive care, fillings, and smile restoration.",
    nextSlots: ["Tomorrow 9:30 AM", "Fri 3:00 PM"],
  },
];

const baseAppointments = [
  {
    id: "a1",
    doctorId: "d1",
    date: "2026-06-08",
    time: "4:30 PM",
    mode: "telemedicine",
    status: "upcoming",
    reason: "Annual check-up",
  },
  {
    id: "a2",
    doctorId: "d3",
    date: "2026-06-15",
    time: "10:00 AM",
    mode: "in-person",
    status: "upcoming",
    reason: "Vaccination",
  },
  {
    id: "a3",
    doctorId: "d2",
    date: "2026-05-12",
    time: "2:00 PM",
    mode: "in-person",
    status: "completed",
    reason: "Skin consultation",
  },
  {
    id: "a4",
    doctorId: "d4",
    date: "2026-04-22",
    time: "9:00 AM",
    mode: "in-person",
    status: "completed",
    reason: "ECG follow-up",
  },
  {
    id: "a5",
    doctorId: "d1",
    date: "2026-03-30",
    time: "11:00 AM",
    mode: "missed",
  },
];

const basePrescriptions = [
  {
    id: "p1",
    doctorId: "d1",
    date: "2026-05-28",
    title: "Seasonal allergies",
    medications: [
      { name: "Cetirizine", dosage: "10 mg", frequency: "Once daily" },
      { name: "Fluticasone nasal spray", dosage: "50 mcg", frequency: "1 spray each nostril, AM" },
    ],
    notes: "Take with water. Continue for 2 weeks.",
  },
  {
    id: "p2",
    doctorId: "d4",
    date: "2026-04-22",
    title: "Cardiac care",
    medications: [
      { name: "Atorvastatin", dosage: "20 mg", frequency: "Nightly" },
      { name: "Aspirin", dosage: "81 mg", frequency: "Once daily" },
    ],
  },
  {
    id: "p3",
    doctorId: "d2",
    date: "2026-05-12",
    title: "Eczema flare",
    medications: [{ name: "Hydrocortisone 1% cream", dosage: "Apply thin layer", frequency: "Twice daily, 7 days" }],
  },
];

const MEDICAL_HISTORY_KEY = "palscare-medical-history";

const baseMedicalHistory = [
  { id: "m1", date: "2026-05-28", type: "visit", title: "Annual physical", detail: "All vitals normal. BP 118/76.", doctorId: "d1" },
  { id: "m2", date: "2026-05-12", type: "diagnosis", title: "Mild atopic dermatitis", detail: "Localized to inner elbows.", doctorId: "d2" },
  { id: "m3", date: "2026-04-22", type: "lab", title: "Lipid panel", detail: "LDL 132 mg/dL (slightly elevated)", doctorId: "d4", reportFileUrl: "/reports/lipid_panel.pdf", reportFileName: "lipid_panel.pdf" },
  { id: "m4", date: "2026-02-10", type: "vaccination", title: "Influenza vaccine", detail: "Seasonal flu shot administered." },
  { id: "m5", date: "2025-11-04", type: "lab", title: "Complete blood count", detail: "All values within normal range.", reportFileUrl: "/reports/cbc_lab.pdf", reportFileName: "cbc_lab.pdf" },
  { id: "m6", date: "2025-09-18", type: "visit", title: "Telehealth — cold symptoms", detail: "Viral infection. Rest & fluids.", doctorId: "d1" },
];

function seedMedicalHistory() {
  if (!isBrowser) {
    return baseMedicalHistory;
  }
  const existing = window.localStorage.getItem(MEDICAL_HISTORY_KEY);
  if (!existing) {
    window.localStorage.setItem(MEDICAL_HISTORY_KEY, JSON.stringify(baseMedicalHistory));
    return baseMedicalHistory;
  }
  return safeParse(existing, baseMedicalHistory);
}

export function getMedicalHistory() {
  return seedMedicalHistory();
}

export function addMedicalHistoryEntry(entry) {
  if (!isBrowser) return [];
  const current = seedMedicalHistory();
  const next = [
    {
      id: `m_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      ...entry
    },
    ...current
  ];
  window.localStorage.setItem(MEDICAL_HISTORY_KEY, JSON.stringify(next));
  return next;
}

export const medicalHistory = new Proxy([], {
  get(target, prop) {
    const list = getMedicalHistory();
    if (prop === "length") {
      return list.length;
    }
    if (prop === "map") {
      return (...args) => list.map(...args);
    }
    if (prop === "forEach") {
      return (...args) => list.forEach(...args);
    }
    if (prop === "find") {
      return (...args) => list.find(...args);
    }
    if (prop === "filter") {
      return (...args) => list.filter(...args);
    }
    const index = Number(prop);
    if (!isNaN(index)) {
      return list[index];
    }
    const val = list[prop];
    return typeof val === 'function' ? val.bind(list) : val;
  },
  ownKeys(target) {
    return Reflect.ownKeys(getMedicalHistory());
  },
  getOwnPropertyDescriptor(target, prop) {
    return Reflect.getOwnPropertyDescriptor(getMedicalHistory(), prop);
  }
});

const CURRENT_USER_KEY = "palscare-current-user";
const REGISTERED_USERS_KEY = "palscare-registered-users";
const REMINDERS_KEY = "palscare-reminders";

const defaultPatient = {
  name: "Alex Morgan",
  initials: "AM",
  email: "alex.morgan@example.com",
  phone: "+1 (415) 555-0142",
  dob: "1991-08-14",
  bloodGroup: "O+",
  allergies: ["Penicillin", "Peanuts"],
  emergencyContact: { name: "Jamie Morgan", relation: "Sister", phone: "+1 (415) 555-0188" },
  insurance: { provider: "BlueShield Premier", memberId: "BSP-928374610", plan: "PPO Gold" },
};

if (isBrowser) {
  const users = window.localStorage.getItem(REGISTERED_USERS_KEY);
  if (!users) {
    const seedUsers = [
      {
        email: "alex.morgan@example.com",
        password: "password123",
        profile: { ...defaultPatient }
      }
    ];
    window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(seedUsers));
  }
}

export function getCurrentUser() {
  if (!isBrowser) return defaultPatient;
  const curr = window.localStorage.getItem(CURRENT_USER_KEY);
  if (!curr) return null;
  const parsed = safeParse(curr, null);
  return parsed ? parsed.profile : null;
}

export function registerUser(name, email, password) {
  if (!isBrowser) return { success: false, message: "Server error" };
  const usersStr = window.localStorage.getItem(REGISTERED_USERS_KEY) || "[]";
  const users = safeParse(usersStr, []);
  
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: "Email already registered" };
  }

  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const newUser = {
    email: email.toLowerCase(),
    password: password,
    profile: {
      name,
      initials,
      email: email.toLowerCase(),
      phone: "",
      dob: "",
      bloodGroup: "A+",
      allergies: [],
      emergencyContact: { name: "", relation: "", phone: "" },
      insurance: { provider: "", memberId: "", plan: "" }
    }
  };

  users.push(newUser);
  window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return { success: true };
}

export function loginUser(email, password) {
  if (!isBrowser) return { success: false, message: "Server error" };
  const usersStr = window.localStorage.getItem(REGISTERED_USERS_KEY) || "[]";
  const users = safeParse(usersStr, []);

  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!found) {
    return { success: false, message: "Invalid email or password" };
  }

  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
  return { success: true };
}

export function logoutUser() {
  if (isBrowser) {
    window.localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function updatePatientProfile(updatedProfile) {
  if (!isBrowser) return null;
  const currStr = window.localStorage.getItem(CURRENT_USER_KEY);
  if (!currStr) return null;
  const currentUser = safeParse(currStr, null);
  if (!currentUser) return null;

  currentUser.profile = {
    ...currentUser.profile,
    ...updatedProfile,
    initials: (updatedProfile.name || currentUser.profile.name)
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  };

  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  const usersStr = window.localStorage.getItem(REGISTERED_USERS_KEY) || "[]";
  const users = safeParse(usersStr, []);
  const nextUsers = users.map(u => 
    u.email.toLowerCase() === currentUser.email.toLowerCase() ? currentUser : u
  );
  window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(nextUsers));

  return currentUser.profile;
}

export const patient = new Proxy({}, {
  get(target, prop) {
    const user = getCurrentUser();
    return user ? user[prop] : defaultPatient[prop];
  },
  ownKeys(target) {
    const user = getCurrentUser() || defaultPatient;
    return Reflect.ownKeys(user);
  },
  getOwnPropertyDescriptor(target, prop) {
    const user = getCurrentUser() || defaultPatient;
    return Reflect.getOwnPropertyDescriptor(user, prop);
  }
});

const baseReminders = [
  {
    id: "r1",
    type: "appointment",
    title: "Appointment with Dr. Amara Patel",
    time: "Today at 4:30 PM",
    refId: "a1",
    dismissed: false
  },
  {
    id: "r2",
    type: "medication",
    title: "Take Cetirizine (10 mg)",
    time: "Daily at 8:00 AM",
    refId: "p1",
    dismissed: false
  }
];

function seedReminders() {
  if (!isBrowser) {
    return baseReminders.map(item => ({ ...item }));
  }
  const existing = window.localStorage.getItem(REMINDERS_KEY);
  if (!existing) {
    window.localStorage.setItem(REMINDERS_KEY, JSON.stringify(baseReminders));
    return baseReminders.map(item => ({ ...item }));
  }
  return safeParse(existing, []);
}

export function getReminders() {
  return seedReminders().filter(r => !r.dismissed);
}

export function addReminder(reminder) {
  if (!isBrowser) return [];
  const current = seedReminders();
  const next = [
    ...current,
    {
      id: `r_${Date.now()}`,
      dismissed: false,
      ...reminder
    }
  ];
  window.localStorage.setItem(REMINDERS_KEY, JSON.stringify(next));
  return next.filter(r => !r.dismissed);
}

export function dismissReminder(id) {
  if (!isBrowser) return;
  const all = seedReminders();
  const next = all.map(r => r.id === id ? { ...r, dismissed: true } : r);
  window.localStorage.setItem(REMINDERS_KEY, JSON.stringify(next));
  return next.filter(r => !r.dismissed);
}

const APPOINTMENTS_KEY = "health-buddy-appointments";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function normalizeAppointment(appointment) {
  return {
    ...appointment,
    status: appointment.status || "upcoming",
  };
}

// Seed appointments on initial load
function seedAppointments() {
  if (!isBrowser) {
    return baseAppointments.map((item) => ({ ...item }));
  }

  const existing = window.localStorage.getItem(APPOINTMENTS_KEY);
  if (!existing) {
    window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(baseAppointments));
    return baseAppointments.map((item) => ({ ...item }));
  }

  const parsed = safeParse(existing, []);
  if (!Array.isArray(parsed)) {
    window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(baseAppointments));
    return baseAppointments.map((item) => ({ ...item }));
  }

  return parsed.map(normalizeAppointment);
}

export function getAppointments() {
  return seedAppointments().slice().sort((left, right) => {
    const leftDate = new Date(left.date).getTime();
    const rightDate = new Date(right.date).getTime();

    if (leftDate !== rightDate) {
      return leftDate - rightDate;
    }

    return timeToMinutes(left.time) - timeToMinutes(right.time);
  });
}

export function setAppointments(nextAppointments) {
  const normalized = nextAppointments.map(normalizeAppointment);

  if (isBrowser) {
    window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(normalized));
  }

  return normalized;
}

export function addAppointment(appointment) {
  const next = [
    ...getAppointments(),
    {
      id: `a_${Date.now()}`,
      ...appointment,
      status: "upcoming",
    },
  ];

  return setAppointments(next);
}

export function updateAppointmentStatus(id, status) {
  const next = getAppointments().map((appointment) =>
    appointment.id === id ? { ...appointment, status } : appointment,
  );

  return setAppointments(next);
}

export function getDoctorsList() {
  if (!isBrowser) return baseDoctors;
  const registeredStr = window.localStorage.getItem("palscare-registered-doctors") || "[]";
  const registered = safeParse(registeredStr, []);
  return [...baseDoctors, ...registered];
}

export function registerDoctor(doctorData) {
  if (!isBrowser) return { success: false };
  
  const initials = doctorData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const newDoc = {
    id: `d_${Date.now()}`,
    rating: 5.0,
    reviews: 0,
    nextSlots: ["Tomorrow 9:00 AM", "Tomorrow 10:30 AM", "Fri 1:00 PM"],
    verificationStatus: "PENDING",
    chambers: [],
    certifications: [],
    initials,
    ...doctorData
  };

  const registeredOnlyStr = window.localStorage.getItem("palscare-registered-doctors") || "[]";
  const registeredOnly = safeParse(registeredOnlyStr, []);
  registeredOnly.push(newDoc);
  
  window.localStorage.setItem("palscare-registered-doctors", JSON.stringify(registeredOnly));
  window.localStorage.setItem("palscare-current-doctor", JSON.stringify(newDoc));

  const currentAppts = getAppointments();
  const nextAppts = [
    ...currentAppts,
    {
      id: `a_mock1_${Date.now()}`,
      doctorId: newDoc.id,
      date: new Date().toISOString().split("T")[0],
      time: "2:30 PM",
      mode: "telemedicine",
      reason: "Follow-up checkup",
      status: "upcoming"
    },
    {
      id: `a_mock2_${Date.now()}`,
      doctorId: newDoc.id,
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      time: "10:00 AM",
      mode: "in-person",
      reason: "Regular consult",
      status: "upcoming"
    }
  ];
  setAppointments(nextAppts);
  
  return { success: true, doctor: newDoc };
}

export function getCurrentDoctor() {
  if (!isBrowser) return null;
  const curr = window.localStorage.getItem("palscare-current-doctor");
  return curr ? safeParse(curr, null) : null;
}

export function logoutDoctor() {
  if (isBrowser) {
    window.localStorage.removeItem("palscare-current-doctor");
  }
}

export function updateDoctorProfile(profileData) {
  if (!isBrowser) return null;
  const current = getCurrentDoctor();
  if (!current) return null;

  const updated = {
    ...current,
    ...profileData
  };

  window.localStorage.setItem("palscare-current-doctor", JSON.stringify(updated));

  const registeredOnlyStr = window.localStorage.getItem("palscare-registered-doctors") || "[]";
  const registeredOnly = safeParse(registeredOnlyStr, []);
  const nextList = registeredOnly.map(d => d.id === updated.id ? updated : d);
  window.localStorage.setItem("palscare-registered-doctors", JSON.stringify(nextList));

  return updated;
}

export function findDoctor(id) {
  return getDoctorsList().find((doctor) => doctor.id === id) || baseDoctors[0];
}

const PRESCRIPTIONS_KEY = "palscare-prescriptions";

function seedPrescriptions() {
  if (!isBrowser) {
    return basePrescriptions;
  }
  const existing = window.localStorage.getItem(PRESCRIPTIONS_KEY);
  if (!existing) {
    window.localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(basePrescriptions));
    return basePrescriptions;
  }
  return safeParse(existing, basePrescriptions);
}

export function getPrescriptions() {
  return seedPrescriptions();
}

export function getPrescriptionCount() {
  return getPrescriptions().length;
}

export function addPrescription(prescriptionData) {
  if (!isBrowser) return;
  const current = getPrescriptions();
  const newPrescription = {
    id: `p_${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    ...prescriptionData
  };
  const next = [newPrescription, ...current];
  window.localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(next));
  
  addMedicalHistoryEntry({
    type: "prescription",
    title: prescriptionData.title || "Prescription Ref",
    detail: prescriptionData.notes || "New medication schedule added.",
    doctorId: prescriptionData.doctorId
  });

  return newPrescription;
}

export const appointments = getAppointments();

export const prescriptions = new Proxy([], {
  get(target, prop) {
    const list = getPrescriptions();
    if (prop === "length") {
      return list.length;
    }
    if (prop === "map") {
      return (...args) => list.map(...args);
    }
    if (prop === "forEach") {
      return (...args) => list.forEach(...args);
    }
    if (prop === "find") {
      return (...args) => list.find(...args);
    }
    if (prop === "filter") {
      return (...args) => list.filter(...args);
    }
    const index = Number(prop);
    if (!isNaN(index)) {
      return list[index];
    }
    const val = list[prop];
    return typeof val === 'function' ? val.bind(list) : val;
  }
});

const DOCTOR_SLOTS_KEY_PREFIX = "palscare-doctor-slots-";

export function getDoctorSlots(doctorId) {
  if (!isBrowser) return [];
  const key = `${DOCTOR_SLOTS_KEY_PREFIX}${doctorId}`;
  const existing = window.localStorage.getItem(key);
  if (!existing) {
    const defaultSlots = [
      { id: "s1", day: "Monday", time: "09:00 AM", mode: "video", chamberName: "", isBooked: false, patientName: "" },
      { id: "s2", day: "Monday", time: "10:30 AM", mode: "chamber", chamberName: "Chembur Chamber", isBooked: true, patientName: "Alex Morgan", reason: "Regular Chamber Consult" },
      { id: "s3", day: "Tuesday", time: "02:00 PM", mode: "video", chamberName: "", isBooked: false, patientName: "" },
      { id: "s4", day: "Wednesday", time: "11:00 AM", mode: "chamber", chamberName: "Chembur Chamber", isBooked: false, patientName: "" }
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
      ...slot
    }
  ];
  const key = `${DOCTOR_SLOTS_KEY_PREFIX}${doctorId}`;
  window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function removeDoctorSlot(doctorId, slotId) {
  if (!isBrowser) return [];
  const current = getDoctorSlots(doctorId);
  const next = current.filter(s => s.id !== slotId);
  const key = `${DOCTOR_SLOTS_KEY_PREFIX}${doctorId}`;
  window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}

export const doctors = new Proxy([], {
  get(target, prop) {
    if (prop === "length") {
      return getDoctorsList().length;
    }
    if (prop === "slice") {
      return (...args) => getDoctorsList().slice(...args);
    }
    if (prop === "filter") {
      return (...args) => getDoctorsList().filter(...args);
    }
    if (prop === "find") {
      return (...args) => getDoctorsList().find(...args);
    }
    if (prop === "map") {
      return (...args) => getDoctorsList().map(...args);
    }
    if (prop === "some") {
      return (...args) => getDoctorsList().some(...args);
    }
    if (prop === "every") {
      return (...args) => getDoctorsList().every(...args);
    }
    if (prop === "forEach") {
      return (...args) => getDoctorsList().forEach(...args);
    }
    const index = Number(prop);
    if (!isNaN(index)) {
      return getDoctorsList()[index];
    }
    const val = getDoctorsList()[prop];
    return typeof val === 'function' ? val.bind(getDoctorsList()) : val;
  },
  ownKeys(target) {
    return Reflect.ownKeys(getDoctorsList());
  },
  getOwnPropertyDescriptor(target, prop) {
    return Reflect.getOwnPropertyDescriptor(getDoctorsList(), prop);
  }
});

// --- API Gateway Integration ---
import { apiRequest } from "./api";

export async function apiLoginDoctor(email, password) {
  const mockUid = "okta_doc_456";
  const session = { userId: mockUid, email: email.toLowerCase(), role: "DOCTOR" };
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ profile: { name: "Doctor User", email }, ...session }));

  try {
    const profile = await apiRequest("/api/v1/doctors/profile", "GET", null, "DOCTOR");
    const completeDoctor = {
      name: profile.name,
      specialty: profile.specialty,
      email: email.toLowerCase(),
      phone: profile.phone,
      registrationNumber: profile.registrationNumber,
      university: profile.university,
      experience: profile.experienceYears,
      about: profile.bio,
      id: profile.id.toString(),
      verificationStatus: "APPROVED",
      initials: profile.name.replace("Dr. ", "").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    };
    window.localStorage.setItem("palscare-current-doctor", JSON.stringify(completeDoctor));
    return { success: true, doctor: completeDoctor };
  } catch (e) {
    return { success: false, message: "Doctor profile not found in database. Please Register first." };
  }
}

export async function apiGetDoctorAppointments() {
  return await apiRequest("/api/v1/patients/appointments/doctor", "GET", null, "DOCTOR");
}

export async function apiUpdateDoctorProfile(doctorData) {
  const updated = await apiRequest("/api/v1/doctors/onboarding", "POST", {
    name: doctorData.name,
    specialty: doctorData.specialty,
    registrationNumber: doctorData.registrationNumber,
    university: doctorData.university,
    experienceYears: parseInt(doctorData.experience, 10) || 1,
    bio: doctorData.about
  }, "DOCTOR");

  const completeDoctor = {
    name: updated.name,
    specialty: updated.specialty,
    registrationNumber: updated.registrationNumber,
    university: updated.university,
    experience: updated.experienceYears,
    about: updated.bio,
    phone: doctorData.phone || "",
    id: updated.id.toString(),
    verificationStatus: "APPROVED",
    initials: updated.name.replace("Dr. ", "").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  };
  window.localStorage.setItem("palscare-current-doctor", JSON.stringify(completeDoctor));
  return completeDoctor;
}

export async function apiRegisterDoctor(doctorData) {
  const mockUid = "okta_doc_" + Math.random().toString(36).substr(2, 9);
  const session = { userId: mockUid, email: doctorData.email.toLowerCase(), role: "DOCTOR" };
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ profile: doctorData, ...session }));

  // Call Gateway User Registration
  await apiRequest("/api/v1/auth/register", "POST", { userType: "DOCTOR" }, "DOCTOR");

  // Save Doctor Onboarding Info
  const onboarded = await apiRequest("/api/v1/doctors/onboarding", "POST", {
    name: doctorData.name,
    specialty: doctorData.specialty,
    registrationNumber: doctorData.registrationNumber,
    university: doctorData.university,
    experienceYears: doctorData.experience,
    bio: doctorData.about
  }, "DOCTOR");

  // Retrieve Doctor ID Resolver (checks database ID)
  let resolvedId = 1;
  try {
    const internalId = await apiRequest("/api/v1/doctors/internal/id", "GET", null, "DOCTOR");
    resolvedId = internalId || 1;
  } catch (e) {
    console.error("Failed to resolve doctor database ID, default to 1", e);
  }

  const completeDoctor = {
    ...doctorData,
    id: resolvedId.toString(),
    verificationStatus: "APPROVED",
    initials: doctorData.name.replace("Dr. ", "").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  };

  window.localStorage.setItem("palscare-current-doctor", JSON.stringify(completeDoctor));
  return { success: true, doctor: completeDoctor };
}

export async function apiGetCurrentDoctor() {
  try {
    const profile = await apiRequest("/api/v1/doctors/profile", "GET", null, "DOCTOR");
    const currentLocal = JSON.parse(window.localStorage.getItem("palscare-current-doctor") || "{}");
    const updated = {
      ...currentLocal,
      name: profile.name,
      specialty: profile.specialty,
      registrationNumber: profile.registrationNumber,
      university: profile.university,
      experience: profile.experienceYears,
      about: profile.bio
    };
    window.localStorage.setItem("palscare-current-doctor", JSON.stringify(updated));
    return updated;
  } catch (e) {
    return null;
  }
}

export async function apiGetChambers() {
  return await apiRequest("/api/v1/doctors/chambers", "GET", null, "DOCTOR");
}

export async function apiAddChamber(name, address) {
  return await apiRequest("/api/v1/doctors/chambers", "POST", { name, address }, "DOCTOR");
}

export async function apiGetDoctorSlots() {
  return await apiRequest("/api/v1/doctors/slots", "GET", null, "DOCTOR");
}

export async function apiAddDoctorSlot(day, startTime, mode, chamberId) {
  // Format time (e.g. "09:00 AM" to "09:00:00")
  const match = startTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  let timeStr = "09:00:00";
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const meridiem = match[3].toUpperCase();
    if (meridiem === "PM" && hours !== 12) {
      hours += 12;
    } else if (meridiem === "AM" && hours === 12) {
      hours = 0;
    }
    timeStr = `${String(hours).padStart(2, '0')}:${minutes}:00`;
  }

  return await apiRequest("/api/v1/doctors/slots/generate", "POST", {
    slotDay: day,
    startTime: timeStr,
    slotMode: mode.toUpperCase(),
    chamberId: mode.toUpperCase() === "CHAMBER" ? (chamberId || 1) : null
  }, "DOCTOR");
}

export async function apiRemoveDoctorSlot(slotId) {
  return await apiRequest(`/api/v1/doctors/slots/${slotId}`, "DELETE", null, "DOCTOR");
}