import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award, Calendar, MapPin, Star, Stethoscope, Video, CreditCard, Fingerprint, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { addAppointment, findDoctor, patient, apiGetDoctorSlots, apiBookAppointment, apiGetDoctors } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const timeSlots = ["9:00 AM", "9:30 AM", "10:00 AM", "11:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "3:00 PM", "4:30 PM", "5:15 PM"];

function formatSlotDate(date) {
  return format(date, "yyyy-MM-dd");
}

function Stat({ icon, label, sub }) {
  return (
    <div className="rounded-2xl bg-secondary/50 p-3 text-center">
      <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-card shadow-soft">{icon}</div>
      <p className="mt-2 text-xs font-semibold">{label}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function ModeButton({ active, onClick, icon, label, fee }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
        active ? "border-primary bg-primary-soft shadow-soft" : "border-border bg-card hover:border-primary/40",
      )}
    >
      <div className={cn("grid h-10 w-10 place-items-center rounded-xl", active ? "bg-primary text-primary-foreground" : "bg-secondary")}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{fee}</p>
      </div>
    </button>
  );
}

export default function DoctorDetails() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedMode, setSelectedMode] = useState("in-person");
  const [slotsList, setSlotsList] = useState([]);

  // Booking confirmation modal states
  const [showPayment, setShowPayment] = useState(false);
  const [bookingState, setBookingState] = useState("idle"); // "idle" | "verifying" | "success"

  useEffect(() => {
    // Fetch doctor info from backend approved directory list
    apiGetDoctors().then((data) => {
      const dbDoc = data.find(d => d.id.toString() === id);
      if (dbDoc) {
        const docObj = {
          id: dbDoc.id.toString(),
          name: dbDoc.name,
          specialty: dbDoc.specialty,
          experience: dbDoc.experienceYears,
          rating: 4.8,
          reviews: 120,
          clinic: dbDoc.university || "PalsCare Clinic",
          modes: ["in-person"], // force in-person only
          feeUsd: 80,
          about: dbDoc.bio || "Primary care physician.",
          photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&h=256&fit=crop"
        };
        setDoctor(docObj);
        setSelectedMode("in-person");
      } else {
        toast.error("Doctor not found.");
        navigate("/find");
      }
    }).catch(err => {
      console.error("Failed to load doctor from database", err);
      toast.error("Failed to load doctor details.");
      navigate("/find");
    });
  }, [id]);

  useEffect(() => {
    if (!doctor) return;
    setSelectedDayIndex(0);
    setSelectedTime(null);
    setSelectedSlotId(null);
  }, [doctor?.id]);

  useEffect(() => {
    if (!doctor) return;
    apiGetDoctorSlots(doctor.id).then((data) => {
      setSlotsList(data);
    }).catch(err => {
      console.error("Failed to load doctor slots from backend", err);
      setSlotsList([]);
    });
  }, [doctor?.id]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + index);
      return nextDate;
    });
  }, []);

  const handleBookClick = () => {
    if (!selectedTime) {
      toast.error("Choose a time slot first.");
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setBookingState("verifying");

    // Book slot via backend API
    apiBookAppointment(selectedSlotId, "Chamber consultation")
      .then(() => {
        setTimeout(() => {
          setBookingState("success");
          setTimeout(() => {
            setBookingState("idle");
            setShowPayment(false);
            toast.success("Appointment booked successfully!", {
              description: `${doctor.name} • ${format(days[selectedDayIndex], "EEE, MMM d")} at ${selectedTime}`,
            });
            navigate("/appointments");
          }, 1000);
        }, 1800);
      })
      .catch((err) => {
        setBookingState("idle");
        toast.error("Booking failed: Slot might have been booked in the meantime.");
        console.error(err);
      });
  };

  const availableDaySlots = useMemo(() => {
    const selectedDayName = format(days[selectedDayIndex], "EEEE");
    return slotsList.filter(slot => 
      slot.slotDay.toLowerCase() === selectedDayName.toLowerCase() && 
      !slot.isBooked && 
      slot.slotMode.toLowerCase() === "chamber"
    );
  }, [slotsList, selectedDayIndex, days]);

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

  if (!doctor) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const currentFee = selectedMode === "telemedicine" && doctor.modes.includes("telemedicine") ? doctor.feeUsd - 10 : doctor.feeUsd;

  return (
    <div className="animate-fade-up pb-32">
      <div className="relative">
        <div className="h-44 gradient-hero" />
        <Link
          to="/find"
          className="absolute left-4 top-10 grid h-10 w-10 place-items-center rounded-full bg-card/90 backdrop-blur shadow-soft"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <img
          src={doctor.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(doctor.name || "Doctor")}`}
          alt={doctor.name}
          className="absolute -bottom-12 left-1/2 h-28 w-28 -translate-x-1/2 rounded-3xl object-cover ring-4 ring-background shadow-elevated"
        />
      </div>

      <div className="mt-16 px-5 text-center">
        <h1 className="font-display text-2xl font-semibold">{doctor.name}</h1>
        <p className="text-sm text-muted-foreground">
          {doctor.specialty} • {doctor.clinic}
        </p>
      </div>

      <div className="mx-5 mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-card p-3 shadow-soft">
        <Stat icon={<Star className="h-4 w-4 fill-accent text-accent" />} label={doctor.rating.toFixed(1)} sub={`${doctor.reviews} reviews`} />
        <Stat icon={<Award className="h-4 w-4 text-primary" />} label={`${doctor.experience} yrs`} sub="experience" />
        <Stat icon={<MapPin className="h-4 w-4 text-primary" />} label={`${doctor.distanceKm} km`} sub="away" />
      </div>

      <section className="px-5 py-5">
        <h2 className="font-display text-lg font-semibold">About</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{doctor.about}</p>
      </section>

      {doctor.modes.length > 1 && (
        <section className="px-5 pb-2">
          <h2 className="font-display text-lg font-semibold">Consultation type</h2>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {doctor.modes.includes("in-person") && (
              <ModeButton
                active={selectedMode === "in-person"}
                onClick={() => setSelectedMode("in-person")}
                icon={<Stethoscope className="h-4 w-4" />}
                label="In-person"
                fee={`$${doctor.feeUsd}`}
              />
            )}
            {doctor.modes.includes("telemedicine") && (
              <ModeButton
                active={selectedMode === "telemedicine"}
                onClick={() => setSelectedMode("telemedicine")}
                icon={<Video className="h-4 w-4" />}
                label="Video"
                fee={`$${currentFee}`}
              />
            )}
          </div>
        </section>
      )}

      <section className="px-5 py-5">
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Select date</h2>
        </div>

        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {days.map((date, index) => (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => setSelectedDayIndex(index)}
              className={cn(
                "flex min-w-[64px] flex-col items-center rounded-2xl border px-3 py-3 text-center transition",
                selectedDayIndex === index ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-card",
              )}
            >
              <span className="text-[11px] uppercase tracking-wider opacity-80">{format(date, "EEE")}</span>
              <span className="mt-1 text-base font-semibold">{format(date, "d")}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 py-2">
        <h2 className="font-display text-lg font-semibold">Select time</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {availableDaySlots.map((slot) => {
            const timeFormatted = formatTimeStr(slot.startTime);
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => {
                  setSelectedTime(timeFormatted);
                  setSelectedSlotId(slot.id);
                }}
                className={cn(
                  "rounded-2xl border px-3 py-3 text-sm font-medium transition",
                  selectedSlotId === slot.id ? "border-primary bg-primary-soft text-primary shadow-soft" : "border-border bg-card hover:border-primary/40",
                )}
              >
                {timeFormatted} ({slot.slotMode})
              </button>
            );
          })}
          {availableDaySlots.length === 0 && (
            <p className="col-span-2 text-center text-sm text-muted-foreground py-4">No available slots for this day.</p>
          )}
        </div>
      </section>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-border/60 bg-background/95 px-5 py-4 backdrop-blur">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Fee</span>
          <span className="font-semibold">${currentFee}</span>
        </div>
        <button
          type="button"
          onClick={handleBookClick}
          className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft"
        >
          Book appointment
        </button>
      </div>

      {/* Booking Confirmation Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-[360px] rounded-3xl p-5 bg-card/95 backdrop-blur-xl border border-border shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-foreground">Confirm Appointment</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review your appointment summary and confirm your booking.
            </DialogDescription>
          </DialogHeader>

          {bookingState === "verifying" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-fade-in">
              <div className="relative h-20 w-20 flex items-center justify-center rounded-3xl bg-primary-soft/40 border border-primary/20 overflow-hidden shadow-soft">
                {/* Scanning Laser Line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary shadow-glow animate-scan-line" />
                <Fingerprint className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm text-foreground animate-pulse">Scanning Biometrics...</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Please scan your fingerprint to confirm</p>
              </div>
            </div>
          )}

          {bookingState === "success" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="h-20 w-20 flex items-center justify-center rounded-3xl bg-success/10 border border-success/20 shadow-soft">
                <ShieldCheck className="h-10 w-10 text-success animate-bounce" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm text-foreground">Booking Authorized!</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Identity verified successfully</p>
              </div>
            </div>
          )}

          {bookingState === "idle" && (
            <>
              {/* Booking Summary */}
              <div className="mt-2 rounded-2xl bg-secondary/50 p-3.5 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-semibold text-foreground">{doctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-semibold capitalize text-foreground">Clinic Chamber Visit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-semibold text-foreground">
                    {selectedTime && format(days[selectedDayIndex], "EEE, MMM d")} at {selectedTime}
                  </span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-foreground">Consultation Fee</span>
                  <span className="font-bold text-primary">${currentFee}</span>
                </div>
                <div className="rounded-xl bg-primary-soft/40 p-2.5 text-[10px] text-primary italic leading-tight">
                  Note: Direct payment has been enabled. No credit card is required. You can settle the fee of ${currentFee} at the clinic.
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="mt-4">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center rounded-xl bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-soft hover:bg-primary/95 transition"
                >
                  Confirm & Book (Biometric Scan)
                </button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
