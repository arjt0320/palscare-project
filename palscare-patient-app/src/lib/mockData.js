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

export const doctors = [
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
    about: "Compassionate family physician specializing in preventative care, chronic condition monitoring, and holistic patient wellness.",
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
    about: "Board-certified dermatologist focusing on clinical acne therapy, eczema management, mole evaluations, and modern skin rejuvenation.",
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
    about: "Friendly and attentive pediatrician devoted to newborn milestones, child development, immunization programs, and parental guidance.",
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
    about: "Senior cardiovascular expert with over two decades of clinical mastery in hypertension management, arrhythmia care, and preventive cardiology.",
    nextSlots: ["Fri 1:00 PM", "Mon 9:00 AM", "Mon 11:00 AM"],
  },
  {
    id: "d5",
    name: "Dr. Sofia Khan",
    specialty: "Psychiatry",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&h=300&fit=crop",
    rating: 4.9,
    reviews: 91,
    experience: 12,
    clinic: "MindCare Wellness Center",
    distanceKm: 4.2,
    modes: ["telemedicine"],
    feeUsd: 110,
    about: "Consultant psychiatrist specializing in cognitive behavioral support, anxiety relief, mood balance, and mindful lifestyle interventions.",
    nextSlots: ["Today 6:00 PM", "Tomorrow 12:00 PM"],
  },
  {
    id: "d6",
    name: "Dr. Ethan Brooks",
    specialty: "Dentistry",
    photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&h=300&fit=crop",
    rating: 4.8,
    reviews: 127,
    experience: 10,
    clinic: "Bright Smile Dental",
    distanceKm: 2.8,
    modes: ["in-person"],
    feeUsd: 80,
    about: "Restorative and preventive dental surgeon known for painless treatments, cosmetic fillings, smile alignments, and comprehensive oral health.",
    nextSlots: ["Tomorrow 9:30 AM", "Fri 3:00 PM"],
  },
  {
    id: "d7",
    name: "Dr. Samantha Rao",
    specialty: "Neurology",
    photo: "https://images.unsplash.com/photo-1594824813583-059d0442ea35?q=80&w=300&h=300&fit=crop",
    rating: 4.9,
    reviews: 185,
    experience: 15,
    clinic: "Metro Neuro Care",
    distanceKm: 3.9,
    modes: ["in-person", "telemedicine"],
    feeUsd: 130,
    about: "Specialist neurologist treating complex migraine disorders, sleep disturbances, nerve health, and stress-related neuro symptoms.",
    nextSlots: ["Thu 11:00 AM", "Fri 10:00 AM"],
  },
  {
    id: "d8",
    name: "Dr. Marcus Vance",
    specialty: "General Practice",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&h=300&fit=crop",
    rating: 4.8,
    reviews: 104,
    experience: 7,
    clinic: "Apex Medical Center",
    distanceKm: 1.8,
    modes: ["in-person", "telemedicine"],
    feeUsd: 65,
    about: "Dedicated primary healthcare provider focused on annual health screenings, nutrition counseling, and urgent ambulatory medicine.",
    nextSlots: ["Today 3:30 PM", "Tomorrow 2:00 PM"],
  }
];

export function findDoctor(id) {
  return doctors.find((doctor) => doctor.id === id) || doctors[0];
}

// Keys for LocalStorage
const CURRENT_USER_KEY = "palscare-current-user";
const REGISTERED_USERS_KEY = "palscare-registered-users";
const REMINDERS_KEY = "palscare-reminders";
const APPOINTMENTS_KEY = "health-buddy-appointments";
const MEDICAL_HISTORY_KEY = "palscare-medical-history";
const PRESCRIPTIONS_KEY = "palscare-prescriptions";

export const defaultPatient = {
  userId: "demo_patient_001",
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

// Seed demo users and initial session
export function initDemoSession() {
  if (!isBrowser) return;
  const curr = window.localStorage.getItem(CURRENT_USER_KEY);
  if (!curr) {
    const sessionObj = {
      userId: defaultPatient.userId,
      email: defaultPatient.email,
      phone: defaultPatient.phone,
      name: defaultPatient.name,
      profile: { ...defaultPatient },
    };
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionObj));
    window.localStorage.setItem("palscare-token", "demo_token_patient_12345");
  }

  const users = window.localStorage.getItem(REGISTERED_USERS_KEY);
  if (!users) {
    const seedUsers = [
      {
        email: "alex.morgan@example.com",
        password: "password123",
        profile: { ...defaultPatient },
      },
    ];
    window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(seedUsers));
  }
}

// Immediately run session initialization on browser
if (isBrowser) {
  initDemoSession();
}

export function getCurrentUser() {
  if (!isBrowser) return defaultPatient;
  const curr = window.localStorage.getItem(CURRENT_USER_KEY);
  if (!curr) return defaultPatient;
  const parsed = safeParse(curr, null);
  if (!parsed) return defaultPatient;
  return parsed.profile || parsed;
}

export function registerUser(name, email, password) {
  if (!isBrowser) return { success: false, message: "Browser unavailable" };
  const usersStr = window.localStorage.getItem(REGISTERED_USERS_KEY) || "[]";
  const users = safeParse(usersStr, []);

  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const newUser = {
    email: email.toLowerCase(),
    password: password || "password123",
    profile: {
      userId: `user_${Date.now()}`,
      name,
      initials,
      email: email.toLowerCase(),
      phone: "+1 (555) 000-1234",
      dob: "1995-01-01",
      bloodGroup: "A+",
      allergies: [],
      emergencyContact: { name: "", relation: "", phone: "" },
      insurance: { provider: "Standard Healthcare", memberId: "SH-102938", plan: "Silver PPO" },
    },
  };

  users.push(newUser);
  window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

  const sessionObj = {
    userId: newUser.profile.userId,
    email: newUser.profile.email,
    phone: newUser.profile.phone,
    name: newUser.profile.name,
    profile: newUser.profile,
  };
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionObj));
  window.localStorage.setItem("palscare-token", "demo_token_" + Date.now());

  return { success: true };
}

export function loginUser(email, password) {
  if (!isBrowser) return { success: false, message: "Browser unavailable" };
  const usersStr = window.localStorage.getItem(REGISTERED_USERS_KEY) || "[]";
  const users = safeParse(usersStr, []);

  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const userProfile = found ? found.profile : { ...defaultPatient, email: email.toLowerCase() };

  const sessionObj = {
    userId: userProfile.userId || "demo_user",
    email: userProfile.email,
    phone: userProfile.phone,
    name: userProfile.name,
    profile: userProfile,
  };
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionObj));
  window.localStorage.setItem("palscare-token", "demo_token_" + Date.now());

  return { success: true };
}

export function logoutUser() {
  if (isBrowser) {
    window.localStorage.removeItem(CURRENT_USER_KEY);
    window.localStorage.removeItem("palscare-token");
  }
}

export function updatePatientProfile(updatedProfile) {
  if (!isBrowser) return updatedProfile;
  const currStr = window.localStorage.getItem(CURRENT_USER_KEY);
  const currentUser = safeParse(currStr, { profile: { ...defaultPatient } });

  const existingProfile = currentUser.profile || defaultPatient;
  const mergedProfile = {
    ...existingProfile,
    ...updatedProfile,
    initials: (updatedProfile.name || existingProfile.name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
  };

  currentUser.profile = mergedProfile;
  currentUser.name = mergedProfile.name;
  currentUser.phone = mergedProfile.phone;
  currentUser.email = mergedProfile.email;

  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

  // Sync to registered users
  const usersStr = window.localStorage.getItem(REGISTERED_USERS_KEY) || "[]";
  const users = safeParse(usersStr, []);
  const nextUsers = users.map((u) =>
    u.email.toLowerCase() === mergedProfile.email.toLowerCase() ? { ...u, profile: mergedProfile } : u
  );
  window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(nextUsers));

  return mergedProfile;
}

export const patient = new Proxy({}, {
  get(target, prop) {
    const user = getCurrentUser();
    return user ? user[prop] : defaultPatient[prop];
  },
  ownKeys() {
    const user = getCurrentUser() || defaultPatient;
    return Reflect.ownKeys(user);
  },
  getOwnPropertyDescriptor(target, prop) {
    const user = getCurrentUser() || defaultPatient;
    return Reflect.getOwnPropertyDescriptor(user, prop);
  },
});

// Demo Prescriptions
const basePrescriptions = [
  {
    id: "p1",
    doctorId: "d1",
    date: "2026-05-28",
    title: "Seasonal allergies care",
    medications: [
      { name: "Cetirizine", dosage: "10 mg", frequency: "Once daily in the morning" },
      { name: "Fluticasone nasal spray", dosage: "50 mcg", frequency: "1 spray each nostril, AM" },
    ],
    notes: "Take with water. Continue for 2 weeks or until pollen season abates.",
  },
  {
    id: "p2",
    doctorId: "d4",
    date: "2026-04-22",
    title: "Cardiovascular maintenance",
    medications: [
      { name: "Atorvastatin", dosage: "20 mg", frequency: "Nightly after dinner" },
      { name: "Aspirin (Enteric)", dosage: "81 mg", frequency: "Once daily with food" },
    ],
    notes: "Maintain low sodium diet and light 30-min walking routine.",
  },
  {
    id: "p3",
    doctorId: "d2",
    date: "2026-05-12",
    title: "Eczema flare relief",
    medications: [
      { name: "Hydrocortisone 1% cream", dosage: "Apply thin layer", frequency: "Twice daily for 7 days" },
      { name: "Ceramide moisturizing lotion", dosage: "Liberal application", frequency: "After bathing" },
    ],
    notes: "Avoid hot showers and synthetic fabrics.",
  },
  {
    id: "p4",
    doctorId: "d7",
    date: "2026-03-18",
    title: "Migraine management",
    medications: [
      { name: "Sumatriptan", dosage: "50 mg", frequency: "As needed at headache onset" },
      { name: "Magnesium Glycinate", dosage: "400 mg", frequency: "Nightly before sleep" },
    ],
    notes: "Record episode frequency and food triggers in the health diary.",
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

export const prescriptions = getPrescriptions();

// Demo Medical History
export const medicalHistory = [
  { id: "m1", date: "2026-05-28", type: "visit", title: "Annual physical examination", detail: "All vital signs healthy. BP 118/76, resting HR 68 bpm. Routine metabolic panel ordered.", doctorId: "d1" },
  { id: "m2", date: "2026-05-12", type: "diagnosis", title: "Mild atopic dermatitis", detail: "Localized erythematous patches to inner elbows. Responding well to topical therapy.", doctorId: "d2" },
  { id: "m3", date: "2026-04-22", type: "lab", title: "Comprehensive Lipid Panel", detail: "Total cholesterol 184 mg/dL, HDL 54 mg/dL, LDL 112 mg/dL. Normal cardiac risk index.", doctorId: "d4" },
  { id: "m4", date: "2026-02-10", type: "vaccination", title: "Quadrivalent Influenza Vaccine", detail: "Annual seasonal influenza immunization administered safely into left deltoid." },
  { id: "m5", date: "2025-11-04", type: "lab", title: "Complete Blood Count (CBC)", detail: "WBC 6.4, RBC 4.9, Platelets 238k, Hemoglobin 14.8 g/dL. All markers in reference range." },
  { id: "m6", date: "2025-09-18", type: "visit", title: "Telehealth — Viral Rhinovirus", detail: "Acute upper respiratory symptoms. Managed with rest, hydration, and vitamin C.", doctorId: "d1" },
  { id: "m7", date: "2025-06-05", type: "vaccination", title: "Tdap Booster", detail: "Tetanus, diphtheria, and acellular pertussis vaccine up to date for 10 years." }
];

// Helper to format date offset
function getDateOffset(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
}

// Demo Appointments
function getSeedAppointments() {
  const todayStr = getDateOffset(0);
  const futureStr = getDateOffset(3);

  return [
    {
      id: "a1",
      doctorId: "d1",
      doctorName: "Dr. Amara Patel",
      doctorSpecialty: "General Practice",
      doctorPhoto: doc1,
      date: todayStr,
      time: "4:30 PM",
      appointmentDatetime: `${todayStr}T16:30:00`,
      mode: "telemedicine",
      consultationMode: "VIDEO",
      status: "upcoming",
      reason: "Annual health check-up & prescription refill",
    },
    {
      id: "a2",
      doctorId: "d2",
      doctorName: "Dr. Julian Reyes",
      doctorSpecialty: "Dermatology",
      doctorPhoto: doc2,
      date: futureStr,
      time: "10:00 AM",
      appointmentDatetime: `${futureStr}T10:00:00`,
      mode: "in-person",
      consultationMode: "CHAMBER",
      status: "upcoming",
      reason: "Skin examination & seasonal allergy evaluation",
    },
    {
      id: "a3",
      doctorId: "d3",
      doctorName: "Dr. Mei Tanaka",
      doctorSpecialty: "Pediatrics",
      doctorPhoto: doc3,
      date: "2026-05-15",
      time: "11:00 AM",
      appointmentDatetime: "2026-05-15T11:00:00",
      mode: "in-person",
      consultationMode: "CHAMBER",
      status: "completed",
      reason: "Pediatric checkup & vaccination record review",
    },
    {
      id: "a4",
      doctorId: "d4",
      doctorName: "Dr. Henrik Olsen",
      doctorSpecialty: "Cardiology",
      doctorPhoto: doc4,
      date: "2026-04-22",
      time: "9:00 AM",
      appointmentDatetime: "2026-04-22T09:00:00",
      mode: "in-person",
      consultationMode: "CHAMBER",
      status: "completed",
      reason: "ECG rhythm follow-up & blood pressure review",
    },
    {
      id: "a5",
      doctorId: "d5",
      doctorName: "Dr. Sofia Khan",
      doctorSpecialty: "Psychiatry",
      doctorPhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&h=300&fit=crop",
      date: "2026-03-30",
      time: "6:00 PM",
      appointmentDatetime: "2026-03-30T18:00:00",
      mode: "telemedicine",
      consultationMode: "VIDEO",
      status: "missed",
      reason: "Virtual wellness & stress consultation",
    },
  ];
}

function normalizeAppointment(appointment) {
  const doc = findDoctor(appointment.doctorId);
  return {
    ...appointment,
    doctorName: appointment.doctorName || doc.name,
    doctorSpecialty: appointment.doctorSpecialty || doc.specialty,
    doctorPhoto: appointment.doctorPhoto || doc.photo,
    status: appointment.status || "upcoming",
    mode: appointment.mode || (appointment.consultationMode === "VIDEO" ? "telemedicine" : "in-person"),
    consultationMode: appointment.consultationMode || (appointment.mode === "telemedicine" ? "VIDEO" : "CHAMBER"),
  };
}

function seedAppointments() {
  if (!isBrowser) {
    return getSeedAppointments().map(normalizeAppointment);
  }

  const existing = window.localStorage.getItem(APPOINTMENTS_KEY);
  if (!existing) {
    const initial = getSeedAppointments();
    window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(initial));
    return initial.map(normalizeAppointment);
  }

  const parsed = safeParse(existing, []);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    const initial = getSeedAppointments();
    window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(initial));
    return initial.map(normalizeAppointment);
  }

  return parsed.map(normalizeAppointment);
}

export function getAppointments() {
  return seedAppointments().slice().sort((left, right) => {
    const leftDate = new Date(left.date).getTime();
    const rightDate = new Date(right.date).getTime();
    if (leftDate !== rightDate) {
      return rightDate - leftDate; // recent first
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
  const doc = findDoctor(appointment.doctorId);
  const newAppt = normalizeAppointment({
    id: `a_${Date.now()}`,
    doctorName: doc.name,
    doctorSpecialty: doc.specialty,
    doctorPhoto: doc.photo,
    status: "upcoming",
    ...appointment,
  });

  const next = [newAppt, ...getAppointments()];
  setAppointments(next);

  // Also automatically trigger a reminder
  addReminder({
    type: "appointment",
    title: `Appointment with ${doc.name}`,
    time: `${newAppt.date} at ${newAppt.time}`,
    refId: newAppt.id,
  });

  return next;
}

export function updateAppointmentStatus(id, status) {
  const next = getAppointments().map((appointment) =>
    appointment.id === id ? { ...appointment, status } : appointment
  );
  return setAppointments(next);
}

export function getPrescriptionCount() {
  return getPrescriptions().length;
}

export const appointments = getAppointments();

// Demo Reminders / Notifications
const baseReminders = [
  {
    id: "r1",
    type: "appointment",
    title: "Appointment with Dr. Amara Patel",
    time: "Today at 4:30 PM",
    refId: "a1",
    dismissed: false,
  },
  {
    id: "r2",
    type: "medication",
    title: "Take Cetirizine (10 mg)",
    time: "Daily at 8:00 AM",
    refId: "p1",
    dismissed: false,
  },
  {
    id: "r3",
    type: "medication",
    title: "Take Atorvastatin (20 mg)",
    time: "Tonight at 9:00 PM",
    refId: "p2",
    dismissed: false,
  },
];

function seedReminders() {
  if (!isBrowser) {
    return baseReminders.map((item) => ({ ...item }));
  }
  const existing = window.localStorage.getItem(REMINDERS_KEY);
  if (!existing) {
    window.localStorage.setItem(REMINDERS_KEY, JSON.stringify(baseReminders));
    return baseReminders.map((item) => ({ ...item }));
  }
  return safeParse(existing, baseReminders);
}

export function getReminders() {
  return seedReminders().filter((r) => !r.dismissed);
}

export function addReminder(reminder) {
  if (!isBrowser) return [];
  const current = seedReminders();
  const next = [
    {
      id: `r_${Date.now()}`,
      dismissed: false,
      ...reminder,
    },
    ...current,
  ];
  window.localStorage.setItem(REMINDERS_KEY, JSON.stringify(next));
  return next.filter((r) => !r.dismissed);
}

export function dismissReminder(id) {
  if (!isBrowser) return [];
  const all = seedReminders();
  const next = all.map((r) => (r.id === id ? { ...r, dismissed: true } : r));
  window.localStorage.setItem(REMINDERS_KEY, JSON.stringify(next));
  return next.filter((r) => !r.dismissed);
}

// Generate Realistic Slots for any Doctor
export function generateDoctorSlots(doctorId) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const times = [
    { time: "09:00:00", label: "9:00 AM" },
    { time: "10:00:00", label: "10:00 AM" },
    { time: "11:30:00", label: "11:30 AM" },
    { time: "14:00:00", label: "2:00 PM" },
    { time: "15:30:00", label: "3:30 PM" },
    { time: "16:30:00", label: "4:30 PM" },
    { time: "17:15:00", label: "5:15 PM" },
  ];

  const slots = [];
  let slotCounter = 1;

  days.forEach((day) => {
    times.forEach(({ time }) => {
      // Chamber slot
      slots.push({
        id: `slot_${doctorId}_${day.toLowerCase()}_c_${slotCounter++}`,
        doctorId,
        slotDay: day,
        startTime: time,
        slotMode: "chamber",
        isBooked: false,
      });
      // Telemedicine slot
      slots.push({
        id: `slot_${doctorId}_${day.toLowerCase()}_v_${slotCounter++}`,
        doctorId,
        slotDay: day,
        startTime: time,
        slotMode: "telemedicine",
        isBooked: false,
      });
    });
  });

  return slots;
}

// --- Demo-Ready Async API Shims (Zero network calls, 100% offline & demo ready) ---

export async function apiGetDoctors(specialty) {
  if (specialty && specialty !== "All") {
    return doctors.filter((d) => d.specialty === specialty);
  }
  return doctors;
}

export async function apiGetDoctorSlots(doctorId) {
  return generateDoctorSlots(doctorId);
}

export async function apiBookAppointment(slotId, reason = "Consultation", doctorId, dateStr, timeStr, mode = "in-person") {
  const doc = findDoctor(doctorId || "d1");
  const appointment = {
    id: `a_${Date.now()}`,
    doctorId: doc.id,
    doctorName: doc.name,
    doctorSpecialty: doc.specialty,
    doctorPhoto: doc.photo,
    date: dateStr || getDateOffset(1),
    time: timeStr || "10:00 AM",
    appointmentDatetime: `${dateStr || getDateOffset(1)}T10:00:00`,
    mode: mode === "telemedicine" ? "telemedicine" : "in-person",
    consultationMode: mode === "telemedicine" ? "VIDEO" : "CHAMBER",
    status: "upcoming",
    reason: reason || "Clinic consultation",
  };

  addAppointment(appointment);
  return appointment;
}

export async function apiGetAppointments() {
  return getAppointments();
}

export async function apiCancelAppointment(appointmentId) {
  updateAppointmentStatus(appointmentId, "cancelled");
  return { success: true };
}

export async function apiGetProfile() {
  return getCurrentUser();
}

export async function apiSaveProfile(profileData) {
  return updatePatientProfile(profileData);
}

export async function apiGetReminders() {
  return getReminders();
}

export function apiDismissReminder(id) {
  return dismissReminder(id);
}

export async function apiRegisterUser(name, email, password) {
  return registerUser(name, email, password);
}

export async function apiLoginUser(email, password) {
  return loginUser(email, password);
}
