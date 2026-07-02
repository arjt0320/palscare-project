import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Cake, ChevronRight, Droplet, Bell, Lock, Mail, Phone, ShieldCheck, Edit3, X, Save, LogOut } from "lucide-react";
import { patient as importedPatient, updatePatientProfile, logoutUser, apiGetProfile, apiSaveProfile } from "@/lib/mockData";
import { toast } from "sonner";

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

function SettingRow({ icon, label }) {
  return (
    <button type="button" className="flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3 text-left shadow-soft transition hover:bg-secondary">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary">{icon}</div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

export default function Profile() {
  const [profileData, setProfileData] = useState(() => importedPatient);
  const patient = profileData; // shadows imported patient proxy

  useEffect(() => {
    apiGetProfile().then((data) => {
      const updated = updatePatientProfile(data);
      if (updated) {
        setProfileData({ ...updated });
      }
    }).catch(err => console.error("Failed to load patient from server", err));
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState([]);
  const [allergyInput, setAllergyInput] = useState("");

  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insurancePlan, setInsurancePlan] = useState("");
  const [insuranceId, setInsuranceId] = useState("");

  const navigate = useNavigate();
  const joinDate = "Patient since 2023";

  const handleLogout = () => {
    logoutUser();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const enterEditMode = () => {
    setName(patient.name || "");
    setPhone(patient.phone || "");
    setEmail(patient.email || "");
    setDob(patient.dob || "");
    setBloodGroup(patient.bloodGroup || "");
    setAllergies([...(patient.allergies || [])]);
    setEmergencyName(patient.emergencyContact?.name || "");
    setEmergencyRelation(patient.emergencyContact?.relation || "");
    setEmergencyPhone(patient.emergencyContact?.phone || "");
    setInsuranceProvider(patient.insurance?.provider || "");
    setInsurancePlan(patient.insurance?.plan || "");
    setInsuranceId(patient.insurance?.memberId || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    apiSaveProfile({ name, phone, dob, bloodGroup })
      .then((updated) => {
        setProfileData({ ...updated });
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update profile.");
      });
  };

  const handleAddAllergy = (e) => {
    e.preventDefault();
    if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput("");
    }
  };

  const handleRemoveAllergy = (indexToRemove) => {
    setAllergies(allergies.filter((_, index) => index !== indexToRemove));
  };

  const formattedDob = patient.dob
    ? new Date(patient.dob).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : "Not provided";

  return (
    <div className="animate-fade-up pb-10">
      <header className="gradient-hero px-5 pb-16 pt-12 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 font-display text-2xl font-semibold ring-2 ring-white/30 backdrop-blur">
              {patient.initials}
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold">{patient.name}</h1>
              <p className="text-sm opacity-90">{joinDate}</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </header>

      <div className="-mt-10 space-y-4 px-5">
        {isEditing ? (
          /* EDIT MODE FORM */
          <div className="space-y-4">
            {/* Personal Info Edit Card */}
            <section className="rounded-3xl bg-card p-5 shadow-elevated border border-primary/20">
              <h2 className="font-display text-base font-semibold text-foreground mb-4">Edit Personal Info</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Allergies Edit Card */}
            <section className="rounded-3xl bg-card p-5 shadow-soft border border-border">
              <h2 className="font-display text-base font-semibold text-foreground mb-3">Allergies</h2>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {allergies.map((allergy, index) => (
                  <span key={allergy} className="flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {allergy}
                    <button type="button" onClick={() => handleRemoveAllergy(index)} className="rounded-full hover:bg-destructive/20 p-0.5 ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {allergies.length === 0 && (
                  <p className="text-xs text-muted-foreground">No allergies listed.</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add allergy..."
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground"
                >
                  Add
                </button>
              </div>
            </section>

            {/* Emergency Contact Edit Card */}
            <section className="rounded-3xl bg-card p-5 shadow-soft border border-border">
              <h2 className="font-display text-base font-semibold text-foreground mb-3">Emergency Contact</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Relation</label>
                    <input
                      type="text"
                      placeholder="e.g. Spouse, Friend"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Insurance Edit Card */}
            <section className="rounded-3xl bg-card p-5 shadow-soft border border-border">
              <h2 className="font-display text-base font-semibold text-foreground mb-3">Insurance</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Insurance Provider</label>
                  <input
                    type="text"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Plan Name</label>
                    <input
                      type="text"
                      placeholder="e.g. PPO Gold"
                      value={insurancePlan}
                      onChange={(e) => setInsurancePlan(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Member ID</label>
                    <input
                      type="text"
                      value={insuranceId}
                      onChange={(e) => setInsuranceId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Form actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/95"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* DISPLAY VIEWS */
          <>
            <section className="rounded-3xl bg-card p-4 shadow-elevated">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-base font-semibold">Personal info</h2>
                <button
                  type="button"
                  onClick={enterEditMode}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-85"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </button>
              </div>
              <Row icon={<Mail className="h-4 w-4" />} label="Email" value={patient.email} />
              <Row icon={<Phone className="h-4 w-4" />} label="Phone" value={patient.phone} />
              <Row icon={<Cake className="h-4 w-4" />} label="Date of birth" value={formattedDob} />
              <Row icon={<Droplet className="h-4 w-4" />} label="Blood group" value={patient.bloodGroup} />
            </section>

            <section className="rounded-3xl bg-card p-4 shadow-soft">
              <h2 className="mb-2 font-display text-base font-semibold">Allergies</h2>
              <div className="flex flex-wrap gap-2">
                {patient.allergies && patient.allergies.map((allergy) => (
                  <span key={allergy} className="flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {allergy}
                  </span>
                ))}
                {(!patient.allergies || patient.allergies.length === 0) && (
                  <p className="text-xs text-muted-foreground">No allergy warnings registered.</p>
                )}
              </div>
            </section>

            <section className="rounded-3xl bg-card p-4 shadow-soft">
              <h2 className="mb-1 font-display text-base font-semibold">Emergency contact</h2>
              {patient.emergencyContact && patient.emergencyContact.name ? (
                <>
                  <p className="text-sm font-medium">
                    {patient.emergencyContact.name} <span className="text-muted-foreground">({patient.emergencyContact.relation})</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{patient.emergencyContact.phone}</p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No emergency contacts set.</p>
              )}
            </section>

            <section className="rounded-3xl gradient-card p-4 shadow-soft">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="font-display text-base font-semibold">Insurance</h2>
              </div>
              {patient.insurance && patient.insurance.provider ? (
                <>
                  <p className="mt-2 text-sm font-medium">{patient.insurance.provider}</p>
                  <p className="text-xs text-muted-foreground">
                    {patient.insurance.plan} • Member ID {patient.insurance.memberId}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">No insurance policies registered.</p>
              )}
            </section>

            <section className="space-y-2 pt-2">
              <SettingRow icon={<Bell className="h-4 w-4" />} label="Notifications" />
              <SettingRow icon={<Lock className="h-4 w-4" />} label="Privacy & security" />
            </section>

            <section className="rounded-3xl bg-card p-4 shadow-soft">
              <h2 className="mb-2 font-display text-base font-semibold">Medical summary</h2>
              <p className="text-sm text-muted-foreground">
                Your records, prescriptions, and visit history are stored in the app so you can review them anytime.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
