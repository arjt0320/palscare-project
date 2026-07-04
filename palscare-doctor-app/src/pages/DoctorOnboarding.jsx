import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, ShieldCheck, User, Mail, GraduationCap, FileText, ChevronRight, Upload, X } from "lucide-react";
import { registerDoctor, specialties, apiRegisterDoctor } from "@/lib/mockData";
import { toast } from "sonner";

export default function DoctorOnboarding() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState(specialties[0].label);
  const [regNo, setRegNo] = useState("");
  const [university, setUniversity] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [fee, setFee] = useState("60");
  
  // KYC uploaded files state
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles([...files, ...selected.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(1) + " KB" }))]);
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

    apiRegisterDoctor({
      name: `Dr. ${name}`,
      specialty,
      email,
      phone,
      registrationNumber: regNo,
      university,
      experience: parseInt(experience, 10) || 1,
      about: bio || `Dedicated specialist in ${specialty}.`,
      feeUsd: parseInt(fee, 10) || 60,
      clinic: "Global Health Center",
      distanceKm: 2.5,
      modes: ["in-person"],
      photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&h=256&fit=crop"
    })
      .then((res) => {
        setIsLoading(false);
        if (res.success) {
          toast.success("Onboarding submitted!", {
            description: "Your credentials have been uploaded. Verification is pending."
          });
          navigate("/doctor/portal");
        } else {
          toast.error("Failed to submit onboarding.");
        }
      })
      .catch((err) => {
        setIsLoading(false);
        toast.error("Failed to submit onboarding: API error.");
        console.error(err);
      });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-background px-6 pb-8 pt-12">
      {/* Decorative background grids/blobs */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary-soft opacity-40 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-accent-soft opacity-30 blur-3xl" />

      <div className="z-10 mx-auto w-full max-w-md animate-fade-up">
        {/* Onboarding Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero text-primary-foreground shadow-glow">
            <Stethoscope className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground">Doctor Onboarding</h1>
          <p className="mt-1 text-sm text-muted-foreground">Register your medical practice & upload KYC</p>
        </div>

        {/* Steps indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s ? "w-8 bg-primary" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basic Signup */}
        {step === 1 && (
          <div className="mt-6 space-y-4 rounded-3xl bg-card p-5 shadow-elevated border border-border/50">
            <h2 className="font-display text-base font-semibold text-foreground">Step 1: Contact Details</h2>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Full Name (e.g. Julian Reyes)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                <User className="h-4 w-4" />
              </span>
              <input
                type="tel"
                placeholder="Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-xs outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Clinical Specialty</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-3 py-3 text-xs outline-none focus:border-primary"
              >
                {specialties.map(spec => (
                  <option key={spec.label} value={spec.label}>{spec.emoji} {spec.label}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="mt-6 flex w-full items-center justify-center gap-1 rounded-2xl bg-primary py-3.5 text-xs font-semibold text-primary-foreground shadow-soft"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Clinical Details */}
        {step === 2 && (
          <div className="mt-6 space-y-4 rounded-3xl bg-card p-5 shadow-elevated border border-border/50">
            <h2 className="font-display text-base font-semibold text-foreground">Step 2: Medical Qualifications</h2>

            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                <FileText className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Medical Registration Number (e.g. GMC-98273)"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="University / Medical School"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Practice Exp (Years)</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-3 text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Consultation Fee ($)</label>
                <input
                  type="number"
                  placeholder="60"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-3 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Biography / Summary</label>
              <textarea
                placeholder="Describe your qualifications, expertise, and patient care philosophies..."
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background p-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-2xl border border-border bg-card py-3 text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-1 rounded-2xl bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-soft"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: KYC Document Upload */}
        {step === 3 && (
          <div className="mt-6 space-y-4 rounded-3xl bg-card p-5 shadow-elevated border border-border/50">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="font-display text-base font-semibold text-foreground">Step 3: Document Verification (KYC)</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload copies of your Medical License, ID Proof, and Degree Certificates to verify your account.
            </p>

            {/* Drag & Drop uploader mockup */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-2xl p-6 bg-primary-soft/10 hover:bg-primary-soft/20 transition cursor-pointer">
              <Upload className="h-8 w-8 text-primary mb-2" />
              <p className="text-xs font-semibold text-foreground text-center">Click to browse files</p>
              <p className="text-[10px] text-muted-foreground text-center mt-1">PDF, JPG, PNG up to 10MB</p>
              <input type="file" multiple onChange={handleFileChange} className="hidden" />
            </label>

            {/* List of uploaded files */}
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground block">Uploaded Files ({files.length})</p>
                {files.map((file, index) => (
                  <div key={file.name} className="flex items-center justify-between rounded-xl bg-secondary/50 p-2.5 text-xs">
                    <span className="truncate max-w-[200px] font-medium text-foreground">{file.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{file.size}</span>
                      <button type="button" onClick={() => removeFile(index)} className="rounded-full hover:bg-destructive/10 p-1 text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isLoading}
                className="flex-1 rounded-2xl border border-border bg-card py-3 text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-1 rounded-2xl bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-soft disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  "Complete Onboarding"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="z-10 mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Palscare Verification System.
      </div>
    </div>
  );
}
