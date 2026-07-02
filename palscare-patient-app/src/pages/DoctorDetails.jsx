import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award, Calendar, MapPin, Star, Stethoscope, Video, CreditCard } from "lucide-react";
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

  // Payment simulated modal states
  const [showPayment, setShowPayment] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

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
          modes: ["in-person", "telemedicine"],
          feeUsd: 80,
          about: dbDoc.bio || "Primary care physician.",
          photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&h=256&fit=crop"
        };
        setDoctor(docObj);
        setSelectedMode(docObj.modes[0]);
      } else {
        const fallback = findDoctor(id);
        setDoctor(fallback);
        setSelectedMode(fallback.modes[0]);
      }
    }).catch(err => {
      console.error("Failed to load doctor from database, falling back to mock", err);
      const fallback = findDoctor(id);
      setDoctor(fallback);
      setSelectedMode(fallback.modes[0]);
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
    setCardName(patient.name || "");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setShowPayment(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv) {
      toast.error("Please fill in all card details.");
      return;
    }

    setIsPaying(true);

    apiBookAppointment(selectedSlotId, "Doctor visit")
      .then(() => {
        setIsPaying(false);
        setShowPayment(false);
        toast.success("Appointment booked & paid!", {
          description: `${doctor.name} • ${format(days[selectedDayIndex], "EEE, MMM d")} at ${selectedTime}`,
        });
        navigate("/appointments");
      })
      .catch((err) => {
        setIsPaying(false);
        toast.error("Booking failed: Slot might have been booked in the meantime.");
        console.error(err);
      });
  };

  const availableDaySlots = useMemo(() => {
    const selectedDayName = format(days[selectedDayIndex], "EEEE");
    return slotsList.filter(slot => slot.slotDay.toLowerCase() === selectedDayName.toLowerCase() && !slot.isBooked);
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
          src={doctor.photo}
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

      {/* Simulated Payment Sheet Modal */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-[360px] rounded-3xl p-5 bg-card/95 backdrop-blur-xl border border-border shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-foreground">Confirm & Pay</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review your appointment summary and enter payment info.
            </DialogDescription>
          </DialogHeader>

          {/* Booking Summary */}
          <div className="mt-2 rounded-2xl bg-secondary/50 p-3.5 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Doctor</span>
              <span className="font-semibold text-foreground">{doctor.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-semibold capitalize text-foreground">{selectedMode === "telemedicine" ? "Video Consultation" : "In-person Visit"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & Time</span>
              <span className="font-semibold text-foreground">
                {selectedTime && format(days[selectedDayIndex], "EEE, MMM d")} at {selectedTime}
              </span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Consultation Fee</span>
              <span className="font-semibold text-foreground">${currentFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="font-semibold text-foreground">$5.00</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-border pt-2 text-sm">
              <span className="font-bold text-foreground">Total Charge</span>
              <span className="font-bold text-primary">${currentFee + 5}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Cardholder Name</label>
              <input
                type="text"
                required
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Card Number</label>
              <input
                type="text"
                required
                placeholder="4111 2222 3333 4444"
                maxLength="19"
                value={cardNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim();
                  setCardNumber(val);
                }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Expiry Date</label>
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  maxLength="5"
                  value={cardExpiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length >= 2) {
                      val = val.slice(0, 2) + "/" + val.slice(2, 4);
                    }
                    setCardExpiry(val);
                  }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">CVV</label>
                <input
                  type="password"
                  required
                  placeholder="***"
                  maxLength="3"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPaying}
              className="w-full mt-4 flex items-center justify-center rounded-xl bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-soft hover:bg-primary/95 disabled:opacity-75"
            >
              {isPaying ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                `Pay $${currentFee + 5} & Confirm`
              )}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
