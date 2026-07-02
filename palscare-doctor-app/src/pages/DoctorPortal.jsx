import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Stethoscope, 
  Calendar, 
  User, 
  Pill, 
  Plus, 
  Trash2, 
  Building, 
  Award, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Star, 
  ChevronRight, 
  ArrowLeft,
  FileText,
  AlertTriangle,
  Upload,
  Eye,
  FileDown,
  Printer,
  Maximize2,
  CalendarDays,
  CheckCircle2,
  Video
} from "lucide-react";
import { 
  getCurrentDoctor, 
  getAppointments, 
  medicalHistory, 
  addPrescription, 
  updateDoctorProfile, 
  logoutDoctor,
  getDoctorSlots,
  addDoctorSlot,
  removeDoctorSlot,
  apiGetCurrentDoctor,
  apiGetChambers,
  apiAddChamber,
  apiGetDoctorSlots,
  apiAddDoctorSlot,
  apiRemoveDoctorSlot,
  apiGetDoctorAppointments,
  apiUpdateDoctorProfile
} from "@/lib/mockData";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DoctorPortal() {
  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  
  // Consult Tab States
  const [activeAppt, setActiveAppt] = useState(null);
  const [prescriptionTitle, setPrescriptionTitle] = useState("");
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [medications, setMedications] = useState([{ name: "", dosage: "", frequency: "" }]);
  const [recommendedTest, setRecommendedTest] = useState("");
  
  // Consult Sub-tab toggles / historical views
  const [consultHistoryTab, setConsultHistoryTab] = useState("upcoming"); // "upcoming" or "previous"
  const [viewingApptSummary, setViewingApptSummary] = useState(null);
  
  // PDF Viewer
  const [selectedPdf, setSelectedPdf] = useState(null);
  
  // Slots & Chambers States
  const [chambers, setChambers] = useState([]);
  const [newChamberName, setNewChamberName] = useState("");
  const [newChamberAddress, setNewChamberAddress] = useState("");
  
  const [slotDay, setSlotDay] = useState("Monday");
  const [slotStart, setSlotStart] = useState("09:00 AM");
  const [slotDuration, setSlotDuration] = useState("30");
  const [slotType, setSlotType] = useState("video"); // "video" or "chamber"
  const [selectedChamber, setSelectedChamber] = useState("");
  
  // Profile States
  const [certs, setCerts] = useState([]);
  const [newCertTitle, setNewCertTitle] = useState("");
  const [newCertIssuer, setNewCertIssuer] = useState("");

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSpecialty, setEditSpecialty] = useState("");
  const [editUniversity, setEditUniversity] = useState("");
  const [editRegNo, setEditRegNo] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPhone, setEditPhone] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    loadDoctorPortalData();
  }, [navigate, activeTab]);

  const loadDoctorPortalData = async () => {
    const sessionStr = localStorage.getItem("palscare-current-user");
    if (!sessionStr) {
      toast.error("Please login first.");
      navigate("/doctor/login");
      return;
    }

    const current = await apiGetCurrentDoctor();
    if (!current) {
      toast.error("Please complete onboarding first.");
      navigate("/doctor/onboarding");
      return;
    }

    setDoctor(current);
    setCerts(current.certifications || []);
    
    setEditName(current.name || "");
    setEditSpecialty(current.specialty || "");
    setEditUniversity(current.university || "");
    setEditRegNo(current.registrationNumber || "");
    setEditExperience(current.experience || "1");
    setEditBio(current.about || "");
    setEditPhone(current.phone || "");

    // Load chambers from backend
    try {
      const backendChambers = await apiGetChambers();
      if (backendChambers.length === 0) {
        // preseed first chamber if empty
        const preseeded = await apiAddChamber("Chembur Chamber", "102, Diamond Plaza, Near Chembur Station, Mumbai");
        setChambers([preseeded]);
        setSelectedChamber(preseeded.name);
      } else {
        setChambers(backendChambers);
        setSelectedChamber(backendChambers[0].name);
      }
    } catch (e) {
      console.error(e);
      setChambers([]);
    }

    // Load appointments matching this doctor from backend database
    try {
      const apiAppts = await apiGetDoctorAppointments();
      const mapped = apiAppts.map(a => {
        const timePart = a.appointmentDatetime.split("T")[1];
        return {
          id: a.id,
          date: a.appointmentDatetime.split("T")[0],
          time: formatTimeStr(timePart),
          mode: a.consultationMode === "VIDEO" ? "telemedicine" : "in-person",
          reason: a.reason,
          status: a.status === "BOOKED" ? "upcoming" : a.status.toLowerCase()
        };
      });
      setAppointments(mapped);
    } catch (err) {
      console.error("Failed to load doctor appointments from backend", err);
      setAppointments([]);
    }

    // Load slots from backend
    loadDoctorSlots();
  };

  const loadDoctorSlots = () => {
    apiGetDoctorSlots().then((data) => {
      // Map backend slots to component structure:
      // slotDay -> day, startTime -> time (formatted e.g. "09:00 AM"), slotMode -> mode (lowercase)
      const mapped = data.map(s => ({
        id: s.id,
        day: s.slotDay,
        time: formatTimeStr(s.startTime),
        mode: s.slotMode.toLowerCase(),
        chamberName: s.chamber ? s.chamber.name : "",
        isBooked: s.isBooked,
        patientName: s.isBooked ? "Patient User" : ""
      }));
      setSlots(mapped);
    }).catch(err => console.error("Failed to load doctor slots", err));
  };

  const formatTimeStr = (timeStr) => {
    try {
      const [hoursStr, minutesStr] = timeStr.split(":");
      let hours = parseInt(hoursStr, 10);
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutesStr} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const handleLogout = () => {
    logoutDoctor();
    toast.success("Logged out from Doctor Portal");
    navigate("/doctor/login");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName || !editSpecialty || !editUniversity || !editRegNo || !editExperience) {
      toast.error("Please fill in all required fields.");
      return;
    }

    apiUpdateDoctorProfile({
      name: editName,
      specialty: editSpecialty,
      university: editUniversity,
      registrationNumber: editRegNo,
      experience: editExperience,
      about: editBio,
      phone: editPhone
    })
      .then((updatedDoc) => {
        setDoctor(updatedDoc);
        setIsEditingProfile(false);
        toast.success("Profile updated successfully!");
      })
      .catch((err) => {
        toast.error("Failed to update profile.");
        console.error(err);
      });
  };

  // Add Chamber Action
  const handleAddChamber = (e) => {
    e.preventDefault();
    if (!newChamberName || !newChamberAddress) return;
    
    apiAddChamber(newChamberName, newChamberAddress)
      .then((newChamber) => {
        setChambers([...chambers, newChamber]);
        if (!selectedChamber) {
          setSelectedChamber(newChamber.name);
        }
        setNewChamberName("");
        setNewChamberAddress("");
        toast.success("Chamber added successfully!");
      })
      .catch((err) => {
        toast.error("Failed to add chamber.");
        console.error(err);
      });
  };

  const handleRemoveChamber = (index) => {
    toast.error("Chamber deletion is disabled locally. Please contact admin.");
  };

  // Add Certification Action
  const handleAddCert = (e) => {
    e.preventDefault();
    if (!newCertTitle || !newCertIssuer) return;

    const updatedCerts = [...certs, { title: newCertTitle, issuer: newCertIssuer, date: new Date().getFullYear().toString() }];
    setCerts(updatedCerts);
    updateDoctorProfile({ certifications: updatedCerts });
    setNewCertTitle("");
    setNewCertIssuer("");
    toast.success("Certification added!");
  };

  // Add Medication Row
  const addMedicationRow = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "" }]);
  };

  // Remove Medication Row
  const removeMedicationRow = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  if (!doctor) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto min-h-screen w-full max-w-md bg-background pb-24 shadow-elevated">
        
        {/* Portal Header */}
        <header className="gradient-hero px-5 pb-10 pt-10 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/20 font-display text-lg font-semibold ring-2 ring-white/30 backdrop-blur">
                {doctor.initials}
              </div>
              <div className="text-left">
                <h1 className="font-display text-lg font-bold leading-tight">{doctor.name}</h1>
                <p className="text-xs opacity-90">{doctor.specialty}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold hover:bg-white/20 transition"
            >
              Logout
            </button>
          </div>
          
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-xs">
            <span className="opacity-90">Verification status:</span>
            <span className="flex items-center gap-1 font-bold text-accent-foreground rounded-full bg-accent-soft px-2 py-0.5 uppercase tracking-wider text-[10px]">
              <ShieldCheck className="h-3 w-3" />
              {doctor.verificationStatus}
            </span>
          </div>
        </header>

        {/* TAB CONTENTS CONTAINER */}
        <main className="px-5 pt-4">

          {/* TAB A: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-4 animate-fade-up">
              {/* Stat grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-card p-3 text-center shadow-soft border border-border">
                  <div className="mx-auto grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <p className="mt-1.5 font-display text-lg font-bold">{appointments.length}</p>
                  <p className="text-[10px] text-muted-foreground">Bookings</p>
                </div>
                <div className="rounded-2xl bg-card p-3 text-center shadow-soft border border-border">
                  <div className="mx-auto grid h-7 w-7 place-items-center rounded-lg bg-accent-soft text-accent">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <p className="mt-1.5 font-display text-lg font-bold">${appointments.length * doctor.feeUsd}</p>
                  <p className="text-[10px] text-muted-foreground">Earnings</p>
                </div>
                <div className="rounded-2xl bg-card p-3 text-center shadow-soft border border-border">
                  <div className="mx-auto grid h-7 w-7 place-items-center rounded-lg bg-secondary text-foreground">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                  </div>
                  <p className="mt-1.5 font-display text-lg font-bold">5.0</p>
                  <p className="text-[10px] text-muted-foreground">Rating</p>
                </div>
              </div>

              {/* Booked Patients list */}
              <section className="space-y-3 text-left">
                <h2 className="font-display text-base font-semibold text-foreground">Upcoming Consultations</h2>
                {appointments.map((appt) => (
                  <article key={appt.id} className="rounded-2xl bg-card p-4 shadow-soft border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">Patient: Alex Morgan</h3>
                        <p className="text-[11px] text-muted-foreground">Reason: {appt.reason}</p>
                      </div>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium capitalize">
                        {appt.mode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                      <span>Date: {format(new Date(appt.date), "MMM d, yyyy")} • {appt.time}</span>
                      <button
                        onClick={() => {
                          setActiveAppt(appt);
                          setPrescriptionTitle(`Consultation - ${appt.reason}`);
                          setActiveTab("consult");
                        }}
                        className="flex items-center gap-1 text-primary font-bold hover:underline"
                      >
                        Consult
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </article>
                ))}

                {appointments.length === 0 && (
                  <div className="rounded-2xl bg-card p-8 text-center text-xs text-muted-foreground shadow-soft border border-border">
                    No active slots booked today.
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB B: CONSULTATION (Prescription writer / History) */}
          {activeTab === "consult" && (
            <div className="space-y-4 animate-fade-up">
              {!activeAppt ? (
                <div className="space-y-4">
                  {/* Consult Tab Toggle */}
                  <div className="grid grid-cols-2 rounded-2xl bg-secondary p-1">
                    <button
                      type="button"
                      onClick={() => setConsultHistoryTab("upcoming")}
                      className={`rounded-xl py-2 text-xs font-semibold transition ${
                        consultHistoryTab === "upcoming" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
                      }`}
                    >
                      Upcoming Consults
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultHistoryTab("previous")}
                      className={`rounded-xl py-2 text-xs font-semibold transition ${
                        consultHistoryTab === "previous" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
                      }`}
                    >
                      Previous Consults (History)
                    </button>
                  </div>

                  {consultHistoryTab === "upcoming" ? (
                    <section className="space-y-3 text-left">
                      <h2 className="font-display text-sm font-semibold text-foreground">Pending Appointments</h2>
                      {appointments.filter(a => a.status === "upcoming").map((appt) => (
                        <article key={appt.id} className="rounded-2xl bg-card p-4 shadow-soft border border-border space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-sm text-foreground">Patient: Alex Morgan</h3>
                              <p className="text-[11px] text-muted-foreground">Reason: {appt.reason}</p>
                            </div>
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium capitalize">
                              {appt.mode === "telemedicine" ? "Video Consult" : `Chamber Visit`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                            <span>Date: {format(new Date(appt.date), "MMM d, yyyy")} • {appt.time}</span>
                            <button
                              onClick={() => {
                                setActiveAppt(appt);
                                setPrescriptionTitle(`Consultation - ${appt.reason}`);
                              }}
                              className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition shadow-soft"
                            >
                              <Stethoscope className="h-3.5 w-3.5" />
                              Start Consult
                            </button>
                          </div>
                        </article>
                      ))}
                      {appointments.filter(a => a.status === "upcoming").length === 0 && (
                        <div className="rounded-2xl bg-card p-8 text-center text-xs text-muted-foreground shadow-soft border border-border">
                          No pending upcoming consults.
                        </div>
                      )}
                    </section>
                  ) : (
                    <section className="space-y-3 text-left">
                      <h2 className="font-display text-sm font-semibold text-foreground">Consultation History Log</h2>
                      {appointments.filter(a => a.status !== "upcoming").map((appt) => (
                        <article key={appt.id} className="rounded-2xl bg-card p-4 shadow-soft border border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-xs text-foreground">Patient: Alex Morgan</h3>
                              <p className="text-[10px] text-muted-foreground">Date: {format(new Date(appt.date), "MMM d, yyyy")} • {appt.time}</p>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                              appt.status === "completed" ? "bg-accent-soft text-accent" : "bg-destructive/15 text-destructive"
                            }`}>
                              {appt.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-2 py-0.5">
                            Reason: {appt.reason || "General checkup"}
                          </p>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setViewingApptSummary(appt)}
                              className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                            >
                              <Eye className="h-3 w-3" />
                              View Summary
                            </button>
                          </div>
                        </article>
                      ))}
                      {appointments.filter(a => a.status !== "upcoming").length === 0 && (
                        <div className="rounded-2xl bg-card p-8 text-center text-xs text-muted-foreground shadow-soft border border-border">
                          No previous consultations logged.
                        </div>
                      )}
                    </section>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Active Patient Summary */}
                  <section className="rounded-2xl bg-primary-soft/50 p-4 border border-primary/20 space-y-2 text-left">
                    <div className="flex justify-between items-center">
                      <h2 className="font-display text-base font-semibold text-primary flex items-center gap-1">
                        <Stethoscope className="h-4 w-4" />
                        Consulting: Alex Morgan
                      </h2>
                      <button onClick={() => setActiveAppt(null)} className="text-[11px] text-muted-foreground underline">Cancel</button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <p>DOB: Aug 14, 1991</p>
                      <p>Blood: O+</p>
                      <p className="col-span-2">Allergies: Penicillin, Peanuts</p>
                    </div>
                  </section>

                  {/* Patient History Check with PDF document access */}
                  <section className="rounded-2xl bg-card p-4 shadow-soft border border-border">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-2.5 text-left">Alex Morgan's Medical History</h3>
                    <div className="max-h-[160px] overflow-y-auto space-y-3 pr-1">
                      {medicalHistory.map((rec) => (
                        <div key={rec.id} className="flex justify-between items-start text-xs border-l-2 border-primary-soft pl-2.5 py-0.5 text-left">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-foreground capitalize">{rec.title} ({rec.type})</p>
                            <p className="text-muted-foreground text-[10px]">{rec.detail} • {format(new Date(rec.date), "MMM d, yyyy")}</p>
                          </div>
                          {rec.reportFileUrl && (
                            <button
                              type="button"
                              onClick={() => setSelectedPdf({ title: rec.title, file: rec.reportFileName, date: rec.date })}
                              className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary-soft transition shrink-0 ml-2"
                            >
                              <FileText className="h-3 w-3" />
                              PDF
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* New Prescription Form */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!prescriptionTitle || !prescriptionNotes) {
                      toast.error("Please enter a title and consultation notes.");
                      return;
                    }
                    const validMeds = medications.filter(m => m.name.trim() !== "");
                    addPrescription({
                      appointmentId: activeAppt.id,
                      doctorId: doctor.id,
                      title: prescriptionTitle,
                      notes: prescriptionNotes,
                      medications: validMeds,
                      testRecommended: recommendedTest
                    });
                    
                    // Mark appointment as completed in state/local storage
                    const updatedAppts = appointments.map(appt => appt.id === activeAppt.id ? { ...appt, status: "completed" } : appt);
                    setAppointments(updatedAppts);
                    
                    // Update in actual app list
                    const actualAppts = getAppointments().map(appt => appt.id === activeAppt.id ? { ...appt, status: "completed" } : appt);
                    window.localStorage.setItem("health-buddy-appointments", JSON.stringify(actualAppts));

                    toast.success("Prescription issued!", {
                      description: "Patient Alex Morgan can now view this in their portal."
                    });

                    // Reset states
                    setActiveAppt(null);
                    setPrescriptionTitle("");
                    setPrescriptionNotes("");
                    setMedications([{ name: "", dosage: "", frequency: "" }]);
                    setRecommendedTest("");
                    setConsultHistoryTab("previous");
                  }} className="rounded-2xl bg-card p-4 shadow-soft border border-border space-y-3 animate-fade-up text-left">
                    <h3 className="font-display text-sm font-semibold text-foreground">Write Prescription</h3>
                    
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Prescription Title</label>
                      <input
                        type="text"
                        required
                        value={prescriptionTitle}
                        onChange={(e) => setPrescriptionTitle(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Clinical Findings / Notes</label>
                      <textarea
                        required
                        placeholder="Vitals normal, recommended rest..."
                        rows="2"
                        value={prescriptionNotes}
                        onChange={(e) => setPrescriptionNotes(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                      />
                    </div>

                    {/* Medications dynamic list */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Medications List</label>
                        <button
                          type="button"
                          onClick={addMedicationRow}
                          className="flex items-center gap-0.5 text-[10px] font-bold text-primary"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Drug
                        </button>
                      </div>

                      {medications.map((med, index) => (
                        <div key={index} className="flex gap-1.5 items-center">
                          <input
                            type="text"
                            placeholder="Drug name"
                            value={med.name}
                            onChange={(e) => {
                              const next = [...medications];
                              next[index].name = e.target.value;
                              setMedications(next);
                            }}
                            className="flex-1 min-w-0 rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Dosage"
                            value={med.dosage}
                            onChange={(e) => {
                              const next = [...medications];
                              next[index].dosage = e.target.value;
                              setMedications(next);
                            }}
                            className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Freq"
                            value={med.frequency}
                            onChange={(e) => {
                              const next = [...medications];
                              next[index].frequency = e.target.value;
                              setMedications(next);
                            }}
                            className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none"
                          />
                          {medications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedicationRow(index)}
                              className="text-destructive p-1 rounded hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Recommended Diagnostic Tests (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Complete Blood Count (CBC)"
                        value={recommendedTest}
                        onChange={(e) => setRecommendedTest(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-1 rounded-xl bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition"
                    >
                      <FileText className="h-4 w-4" />
                      Issue Prescription & Close
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
          
          {/* TAB C: SLOTS & CHAMBERS */}
          {activeTab === "slots" && (
            <div className="space-y-4 animate-fade-up">
              {/* Chambers Manager */}
              <section className="rounded-2xl bg-card p-4 shadow-soft border border-border space-y-3 text-left">
                <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-1">
                  <Building className="h-4 w-4 text-primary" />
                  Manage Clinical Chambers
                </h3>

                {/* Chambers list */}
                <div className="space-y-2">
                  {chambers.map((ch, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-secondary/50 p-2.5 rounded-xl text-xs text-left">
                      <div>
                        <p className="font-semibold text-foreground">{ch.name}</p>
                        <p className="text-muted-foreground text-[10px]">{ch.address}</p>
                      </div>
                      <button type="button" onClick={() => handleRemoveChamber(idx)} className="text-destructive p-1 rounded hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {chambers.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No chambers added yet.</p>
                  )}
                </div>

                {/* Add Chamber Form */}
                <form onSubmit={handleAddChamber} className="border-t border-border pt-3 space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Chamber Name (e.g. Riverside Clinic)"
                    value={newChamberName}
                    onChange={(e) => setNewChamberName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Clinic Address"
                    value={newChamberAddress}
                    onChange={(e) => setNewChamberAddress(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <button type="submit" className="w-full rounded-xl bg-secondary py-2 text-xs font-semibold text-primary">
                    Add Chamber
                  </button>
                </form>
              </section>

              {/* Slot generator template */}
              <section className="rounded-2xl bg-card p-4 shadow-soft border border-border space-y-3 text-left">
                <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4 text-primary" />
                  Define Availability Template
                </h3>
                
                {/* Mode Select: Video vs Chamber */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block">Consult Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSlotType("video")}
                      className={`rounded-xl py-2 text-xs font-semibold border transition ${
                        slotType === "video" 
                          ? "bg-primary-soft text-primary border-primary" 
                          : "bg-background text-muted-foreground border-border"
                      }`}
                    >
                      Video Consult
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlotType("chamber")}
                      className={`rounded-xl py-2 text-xs font-semibold border transition ${
                        slotType === "chamber" 
                          ? "bg-accent-soft text-accent border-accent" 
                          : "bg-background text-muted-foreground border-border"
                      }`}
                    >
                      Chamber Visit
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Weekday</label>
                    <select
                      value={slotDay}
                      onChange={(e) => setSlotDay(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary"
                    >
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Start Time</label>
                    <input
                      type="text"
                      placeholder="09:00 AM"
                      value={slotStart}
                      onChange={(e) => setSlotStart(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Duration (Min)</label>
                    <select
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary"
                    >
                      {["15", "20", "30", "45", "60"].map(d => (
                        <option key={d} value={d}>{d} mins</option>
                      ))}
                    </select>
                  </div>
                  {slotType === "chamber" && (
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Chamber Clinic</label>
                      <select 
                        value={selectedChamber}
                        onChange={(e) => setSelectedChamber(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary"
                      >
                        {chambers.map((ch, i) => (
                          <option key={i} value={ch.name}>{ch.name}</option>
                        ))}
                        {chambers.length === 0 && <option value="">No Chambers Configured</option>}
                      </select>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (slotType === "chamber" && chambers.length === 0) {
                      toast.error("Please add a chamber address first.");
                      return;
                    }
                    const activeChamber = slotType === "chamber" 
                      ? chambers.find(c => c.name === selectedChamber) 
                      : null;
                    const activeChamberId = activeChamber ? activeChamber.id : null;

                    apiAddDoctorSlot(slotDay, slotStart, slotType, activeChamberId)
                      .then(() => {
                        loadDoctorSlots();
                        toast.success("Availability slot generated!", {
                          description: `Active ${slotType} slot registered on ${slotDay} at ${slotStart}.`
                        });
                      })
                      .catch((err) => {
                        toast.error("Failed to generate slot.");
                        console.error(err);
                      });
                  }}
                  className="w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-soft hover:bg-primary/95 transition"
                >
                  Generate & Activate Slots
                </button>
              </section>

              {/* Weekly Slots list & daily schedule */}
              <section className="rounded-2xl bg-card p-4 shadow-soft border border-border space-y-3 text-left">
                <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-1">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Your Weekly Slots Schedule
                </h3>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                    const daySlots = slots.filter(s => s.day === day);
                    if (daySlots.length === 0) return null;
                    return (
                      <div key={day} className="space-y-1.5">
                        <p className="text-[11px] uppercase font-bold text-primary tracking-wider border-b border-border pb-1">{day}</p>
                        <div className="space-y-1">
                          {daySlots.map(s => (
                            <div key={s.id} className="flex justify-between items-center bg-secondary/50 p-2.5 rounded-xl text-xs text-left">
                              <div>
                                <p className="font-semibold text-foreground">{s.time}</p>
                                <p className="text-muted-foreground text-[10px]">
                                  {s.mode === "video" ? (
                                    <span className="text-primary font-medium">Video Consult</span>
                                  ) : (
                                    <span className="text-accent font-medium">Chamber: {s.chamberName}</span>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {s.isBooked ? (
                                  <span className="rounded-full bg-accent-soft text-accent text-[9px] px-2 py-0.5 font-bold uppercase">
                                    Booked: {s.patientName}
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-primary-soft text-primary text-[9px] px-2 py-0.5 font-bold uppercase">
                                    Available
                                  </span>
                                )}
                                {!s.isBooked && (
                                  <button
                                    onClick={() => {
                                      apiRemoveDoctorSlot(s.id)
                                        .then(() => {
                                          loadDoctorSlots();
                                          toast.success("Slot removed.");
                                        })
                                        .catch((err) => {
                                          toast.error("Failed to remove slot.");
                                          console.error(err);
                                        });
                                    }}
                                    className="text-destructive p-1 rounded hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {slots.length === 0 && (
                    <p className="text-xs text-muted-foreground italic text-center py-4">No slots generated. Create some above.</p>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* TAB D: PROFILE & CERTS */}
          {activeTab === "profile" && (
            <div className="space-y-4 animate-fade-up">
              
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="rounded-2xl bg-card p-4 shadow-soft border border-border space-y-3 text-xs text-left">
                  <h3 className="font-display text-sm font-semibold text-primary">Edit Profile Details</h3>
                  
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold">Doctor Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold">Specialty</label>
                    <input
                      type="text"
                      value={editSpecialty}
                      onChange={(e) => setEditSpecialty(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold">University</label>
                    <input
                      type="text"
                      value={editUniversity}
                      onChange={(e) => setEditUniversity(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold">Registration Number</label>
                    <input
                      type="text"
                      value={editRegNo}
                      onChange={(e) => setEditRegNo(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold">Experience Years</label>
                    <input
                      type="number"
                      value={editExperience}
                      onChange={(e) => setEditExperience(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold">Phone Contact</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold">Bio / Clinic About</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:bg-primary/95 transition"
                    >
                      Save Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1 rounded-xl bg-secondary py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <section className="rounded-2xl bg-card p-4 shadow-soft border border-border space-y-2.5 text-xs text-left">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display text-sm font-semibold text-foreground">Clinical Qualifications</h3>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="rounded-lg bg-primary-soft text-primary px-2.5 py-1 font-semibold text-[10px] hover:bg-primary-soft/80"
                    >
                      Edit Profile
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">University</span>
                    <span className="font-semibold text-foreground">{doctor.university}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registration Number</span>
                    <span className="font-semibold text-foreground">{doctor.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-semibold text-foreground">{doctor.experience} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact</span>
                    <span className="font-semibold text-foreground">{doctor.phone}</span>
                  </div>
                  {doctor.about && (
                    <div className="border-t border-border pt-2.5 space-y-1">
                      <p className="text-muted-foreground font-semibold">About Doctor</p>
                      <p className="text-foreground leading-relaxed italic">{doctor.about}</p>
                    </div>
                  )}
                </section>
              )}

              {/* Certifications Manager */}
              <section className="rounded-2xl bg-card p-4 shadow-soft border border-border space-y-3 text-left">
                <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-1">
                  <Award className="h-4 w-4 text-primary" />
                  Certifications
                </h3>
                
                {/* Certifications List */}
                <div className="space-y-2">
                  {certs.map((c, idx) => (
                    <div key={idx} className="bg-secondary/40 p-2.5 rounded-xl text-xs flex justify-between items-center text-left">
                      <div>
                        <p className="font-semibold text-foreground">{c.title}</p>
                        <p className="text-muted-foreground text-[10px]">{c.issuer} ({c.date})</p>
                      </div>
                    </div>
                  ))}
                  {certs.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No medical certifications added.</p>
                  )}
                </div>

                {/* Add Cert Form */}
                <form onSubmit={handleAddCert} className="border-t border-border pt-3 space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Certificate Title (e.g. Board Certified Derm)"
                    value={newCertTitle}
                    onChange={(e) => setNewCertTitle(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Issuing Organization"
                    value={newCertIssuer}
                    onChange={(e) => setNewCertIssuer(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <button type="submit" className="w-full rounded-xl bg-secondary py-2 text-xs font-semibold text-primary">
                    Add Certification
                  </button>
                </form>
              </section>
            </div>
          )}

        </main>

        {/* Doctor Bottom Nav Bar */}
        <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border/60 bg-card/95 backdrop-blur-xl safe-bottom">
          <ul className="flex items-center justify-around px-2 pt-2 pb-1">
            <li className="flex-1">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-medium transition ${
                  activeTab === "dashboard" ? "text-primary font-bold" : "text-muted-foreground"
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab("consult")}
                className={`w-full flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-medium transition ${
                  activeTab === "consult" ? "text-primary font-bold" : "text-muted-foreground"
                }`}
              >
                <Stethoscope className="h-5 w-5" />
                <span>Consult</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab("slots")}
                className={`w-full flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-medium transition ${
                  activeTab === "slots" ? "text-primary font-bold" : "text-muted-foreground"
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span>Availability</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-medium transition ${
                  activeTab === "profile" ? "text-primary font-bold" : "text-muted-foreground"
                }`}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* PDF Viewer Modal Overlay */}
        {selectedPdf && (
          <div className="absolute inset-0 z-50 flex flex-col bg-background/95 p-5 animate-fade-in backdrop-blur">
            <header className="flex items-center justify-between border-b border-border pb-3">
              <div className="text-left">
                <h3 className="font-display text-sm font-bold text-foreground">Report Document</h3>
                <p className="text-[10px] text-muted-foreground">{selectedPdf.title} • {selectedPdf.file}</p>
              </div>
              <button 
                onClick={() => setSelectedPdf(null)}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground hover:bg-secondary/80"
              >
                Close
              </button>
            </header>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* Document Simulator Controls */}
              <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-2 text-xs text-muted-foreground border border-border">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  Verified Digitally
                </span>
                <div className="flex gap-2">
                  <button className="p-1.5 hover:bg-secondary rounded" title="Download"><FileDown className="h-4 w-4" /></button>
                  <button className="p-1.5 hover:bg-secondary rounded" title="Print"><Printer className="h-4 w-4" /></button>
                  <button className="p-1.5 hover:bg-secondary rounded" title="Zoom"><Maximize2 className="h-4 w-4" /></button>
                </div>
              </div>

              {/* PDF Document Body */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-6 text-left relative overflow-hidden">
                {/* Diagonal watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none rotate-45 font-display text-5xl font-bold">
                  PALSCARE LAB
                </div>

                <div className="flex justify-between border-b border-border pb-4">
                  <div>
                    <h4 className="font-display text-base font-bold text-primary">PalsCare Diagnostics</h4>
                    <p className="text-[9px] text-muted-foreground">Reg No: PALS-928374</p>
                    <p className="text-[9px] text-muted-foreground">Mumbai Road 101, India</p>
                  </div>
                  <div className="text-right text-[9px] text-muted-foreground font-medium">
                    <p className="font-bold text-foreground">Report Date: {selectedPdf.date}</p>
                    <p>Patient Name: Alex Morgan</p>
                    <p>Age/Gender: 34 / Male</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-foreground underline capitalize">{selectedPdf.title} Results</h5>
                  
                  {selectedPdf.file === "lipid_panel.pdf" ? (
                    <table className="w-full text-[10.5px] border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground font-bold">
                          <th className="text-left pb-1.5">Test Parameter</th>
                          <th className="text-right pb-1.5">Result</th>
                          <th className="text-right pb-1.5">Reference Range</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="py-2 font-medium">Total Cholesterol</td>
                          <td className="text-right py-2 text-destructive font-semibold">218 mg/dL</td>
                          <td className="text-right py-2 text-muted-foreground">&lt; 200 mg/dL</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium">HDL (Good) Cholesterol</td>
                          <td className="text-right py-2 text-accent font-semibold">48 mg/dL</td>
                          <td className="text-right py-2 text-muted-foreground">&gt; 40 mg/dL</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium">LDL (Bad) Cholesterol</td>
                          <td className="text-right py-2 text-destructive font-semibold">132 mg/dL</td>
                          <td className="text-right py-2 text-muted-foreground">&lt; 100 mg/dL</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium">Triglycerides</td>
                          <td className="text-right py-2 font-semibold">164 mg/dL</td>
                          <td className="text-right py-2 text-muted-foreground">&lt; 150 mg/dL</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-[10.5px] border-collapse">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground font-bold">
                          <th className="text-left pb-1.5">Test Parameter</th>
                          <th className="text-right pb-1.5">Result</th>
                          <th className="text-right pb-1.5">Reference Range</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="py-2 font-medium">Hemoglobin</td>
                          <td className="text-right py-2 font-semibold">14.6 g/dL</td>
                          <td className="text-right py-2 text-muted-foreground">13.5 - 17.5 g/dL</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium">White Blood Cells (WBC)</td>
                          <td className="text-right py-2 font-semibold">6.4 x10^3/uL</td>
                          <td className="text-right py-2 text-muted-foreground">4.5 - 11.0 x10^3/uL</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium">Red Blood Cells (RBC)</td>
                          <td className="text-right py-2 font-semibold">4.8 x10^6/uL</td>
                          <td className="text-right py-2 text-muted-foreground">4.3 - 5.9 x10^6/uL</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium">Platelets</td>
                          <td className="text-right py-2 text-destructive font-semibold">142 x10^3/uL</td>
                          <td className="text-right py-2 text-muted-foreground">150 - 450 x10^3/uL</td>
                        </tr>
                      </tbody>
                    </table>
                  )}

                  <div className="rounded-xl bg-secondary/50 p-2.5 text-[9.5px] text-muted-foreground leading-relaxed text-left">
                    <p className="font-bold text-foreground mb-0.5">Clinical Note:</p>
                    {selectedPdf.file === "lipid_panel.pdf" ? (
                      "Total cholesterol and LDL are slightly elevated. Patient should focus on a low-fat dietary routine, reduce saturated fats, and schedule a follow-up consultation in 6-8 weeks."
                    ) : (
                      "Platelets are slightly below optimal index, but overall CBC parameters align with normal metabolic activity. Rest, hydration, and regular health assessments recommended."
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-border pt-4 text-[9px] text-muted-foreground text-left">
                  <div>
                    <p className="font-bold text-foreground">Dr. Julian Reyes</p>
                    <p>Chief Pathologist, PalsCare Labs</p>
                  </div>
                  <div className="text-right font-medium text-left">
                    <span className="inline-block rounded border border-accent text-accent px-1.5 py-0.5 font-bold uppercase tracking-wider text-[8px]">
                      Electronically Signed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Previous Consultation Summary Modal */}
        {viewingApptSummary && (
          <div className="absolute inset-0 z-50 flex flex-col bg-background/95 p-5 animate-fade-in backdrop-blur">
            <header className="flex items-center justify-between border-b border-border pb-3">
              <div className="text-left">
                <h3 className="font-display text-sm font-bold text-foreground">Consultation Summary</h3>
                <p className="text-[10px] text-muted-foreground">Patient: Alex Morgan</p>
              </div>
              <button 
                onClick={() => setViewingApptSummary(null)}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground hover:bg-secondary/80"
              >
                Close
              </button>
            </header>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-left">
              <section className="rounded-2xl bg-card p-4 border border-border space-y-2.5">
                <h4 className="font-display text-xs font-bold text-primary uppercase tracking-wider text-left">Session Details</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-left">
                  <div>
                    <p className="text-muted-foreground text-[10px]">Date</p>
                    <p className="font-semibold text-foreground">{format(new Date(viewingApptSummary.date), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">Time</p>
                    <p className="font-semibold text-foreground">{viewingApptSummary.time}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">Mode</p>
                    <p className="font-semibold text-foreground capitalize">{viewingApptSummary.mode}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">Status</p>
                    <p className="font-semibold text-accent capitalize">{viewingApptSummary.status}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl bg-card p-4 border border-border space-y-2.5 text-left">
                <h4 className="font-display text-xs font-bold text-primary uppercase tracking-wider">Clinical Notes</h4>
                <p className="text-xs text-foreground leading-relaxed bg-secondary/40 p-3 rounded-xl">
                  {viewingApptSummary.reason === "Skin consultation" 
                    ? "Patient presented skin rash on elbows. Diagnosed as mild atopic dermatitis. Prescribed topical hydrocortisone and recommended mild moisturizing soap."
                    : viewingApptSummary.reason === "ECG follow-up"
                    ? "ECG patterns verified, standard sinus rhythm. Blood work demonstrates slightly elevated LDL levels. Recommended low fat dietary intake and aerobic routines."
                    : "Consultation conducted successfully. Vitals monitored, patient recommended basic hydration and scheduled follow-ups as appropriate."
                  }
                </p>
              </section>

              <section className="rounded-2xl bg-card p-4 border border-border space-y-2.5 text-left">
                <h4 className="font-display text-xs font-bold text-primary uppercase tracking-wider font-semibold">Recommendations & Tests</h4>
                <div className="bg-secondary/40 p-3 rounded-xl text-xs space-y-1.5 text-left">
                  <p><span className="font-semibold text-foreground text-left">Diagnostic Test:</span> {viewingApptSummary.reason === "ECG follow-up" ? "Lipid Profile Panel" : "Standard Diagnostic Screen"}</p>
                  <p><span className="font-semibold text-foreground text-left">Next Review:</span> 4 Weeks</p>
                </div>
              </section>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}