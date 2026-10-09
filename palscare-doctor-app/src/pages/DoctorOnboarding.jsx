import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, ShieldCheck, User, Mail, GraduationCap, FileText, ChevronRight, Upload, X } from "lucide-react";
import { specialties, getCurrentDoctor, updateDoctorProfile } from "@/lib/mockData";
import { toast } from "sonner";

export default function DoctorOnboarding() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("Amara Patel");
  const [email, setEmail] = useState("dr.amara.patel@palscare.com");
  const [phone, setPhone] = useState("+1 (415) 555-0199");
  const [specialty, setSpecialty] = useState(specialties[0].label);
  const [regNo, setRegNo] = useState("MED-REG-84920");
  const [university, setUniversity] = useState("Johns Hopkins School of Medicine");
  const [experience, setExperience] = useState("8");
  const [bio, setBio] = useState("Board-certified physician with extensive clinical expertise.");
  const [fee, setFee] = useState("60");

  // KYC uploaded files state
  const [files, setFiles] = useState([
    { name: "Medical_Council_License.pdf", size: "142.5 KB" },
    { name: "Degree_Certificate.pdf", size: "320.0 KB" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const doc = getCurrentDoctor();
    if (doc) {
      if (doc.name) setName(doc.name.replace("Dr. ", ""));
      if (doc.email) setEmail(doc.email);
      if (doc.phone) setPhone(doc.phone);
      if (doc.specialty) setSpecialty(doc.specialty);
      if (doc.registrationNumber) setRegNo(doc.registrationNumber);
      if (doc.university) setUniversity(doc.university);
      if (doc.experience) setExperience(doc.experience.toString());
      if (doc.about) setBio(doc.about);
    }
  }, []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles([...files, ...selected.map((f) => ({ name: f.name, size: (f.size / 1024).toFixed(1) + " KB" }))]);
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name || !email || !phone) {
        toast.error("Please fill in basic details.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!regNo || !university || !experience) {
        toast.error("Please fill in clinical qualifications.");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Please upload at least one KYC verification document.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      updateDoctorProfile({
        name: name.startsWith("Dr. ") ? name : `Dr. ${name}`,
        email,
        phone,
        specialty,
        registrationNumber: regNo,
        university,
        experience: experience,
        experienceYears: parseInt(experience, 10) || 1,
        about: bio || `Dedicated specialist in ${specialty}.`,
        feeUsd: parseInt(fee, 10) || 60,
        verificationStatus: "APPROVED",
      });

      toast.success("Clinical Onboarding Verified!", {
        description: "Your physician profile and chambers are active.",
      });
      navigate("/doctor/portal");
    }, 500);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-background px-6 pb-8 pt-10">
      {/* Decorative blobs */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary-soft opacity-40 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-accent-soft opacity-30 blur-3xl" />

      <div className="z-10 mx-auto w-full max-w-md animate-fade-up">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero text-primary-foreground shadow-glow">
            <Stethoscope className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground">Physician Onboarding</h1>
          <p className="mt-1 text-xs text-muted-foreground">Verify your license & setup your clinical profile</p>
        </div>

        {/* Multi-step progress bar */}
        <div className="mt-6 flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                  step === s
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-soft"
                    : step > s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              {s < 3 && (
                <div className={`h-1 flex-1 mx-2 rounded-full transition ${step > s ? "bg-primary" : "bg-secondary"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Cards */}
        <div className="mt-6 rounded-3xl bg-card/85 p-6 shadow-elevated backdrop-blur-xl border border-border/50 text-left">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display text-lg font-semibold text-foreground">Step 1: Personal & Practice Details</h2>
              <p className="text-xs text-muted-foreground">Tell us how patients should identify and contact you.</p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Doctor Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amara Patel"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Primary Specialty</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-primary"
                  >
                    {specialties.map((s) => (
                      <option key={s.label} value={s.label}>
                        {s.emoji} {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="mt-6 flex w-full items-center justify-center gap-1 rounded-2xl bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-soft hover:bg-primary/95 transition"
              >
                Continue to Qualifications
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display text-lg font-semibold text-foreground">Step 2: Medical Credentials</h2>
              <p className="text-xs text-muted-foreground">Add your council registration and medical university.</p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Registration Number</label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="e.g. MED-REG-84920"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Medical School / University</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. Johns Hopkins School of Medicine"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Consultation Fee ($)</label>
                    <input
                      type="number"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Brief Bio</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-xs font-semibold text-muted-foreground hover:bg-secondary transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-1 rounded-2xl bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-soft hover:bg-primary/95 transition"
                >
                  Continue to Verification
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              <h2 className="font-display text-lg font-semibold text-foreground">Step 3: Documents & KYC Verification</h2>
              <p className="text-xs text-muted-foreground">Upload your medical board license or clinical certificates.</p>

              {/* Upload area */}
              <div className="mt-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary-soft/30 p-5 text-center">
                <Upload className="mx-auto h-8 w-8 text-primary opacity-80" />
                <p className="mt-2 text-xs font-semibold text-foreground">Select license or registration certificates</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Supports PDF, PNG, JPG (Demo simulated)</p>
                <label className="mt-3 inline-flex cursor-pointer rounded-xl bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition">
                  Browse Files
                  <input type="file" multiple onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {/* Uploaded documents list */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">Uploaded Credentials</label>
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl bg-secondary/50 p-2 text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground text-[11px]">{file.name}</p>
                        <p className="text-[9px] text-muted-foreground">{file.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-xs font-semibold text-muted-foreground hover:bg-secondary transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-soft hover:bg-primary/95 transition disabled:opacity-75"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Complete Verification & Access Portal
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="z-10 text-center text-xs text-muted-foreground">
        Demo Mode • Immediate Physician Approval
      </div>
    </div>
  );
}
