import { useMemo, useState, useEffect } from "react";
import { Calendar, MoreHorizontal, Stethoscope, Video, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { findDoctor, getAppointments, updateAppointmentStatus, apiGetAppointments, apiCancelAppointment, apiGetDoctors } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

function StatusIcon({ status }) {
  return status === "upcoming" ? <Calendar className="h-3 w-3" /> : <Stethoscope className="h-3 w-3" />;
}

function getHoursToAppointment(appointmentDateStr, appointmentTimeStr) {
  try {
    const [datePart] = appointmentDateStr.split("T");
    const match = appointmentTimeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 999;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3].toUpperCase();

    if (meridiem === "PM" && hours !== 12) {
      hours += 12;
    } else if (meridiem === "AM" && hours === 12) {
      hours = 0;
    }

    const apptDateTime = new Date(`${datePart}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
    const now = new Date();
    
    const diffMs = apptDateTime - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours;
  } catch (e) {
    console.error("Error parsing appointment time", e);
    return 999;
  }
}

function AppointmentCard({ appointment, onCancelClick, onReschedule }) {
  const doctorName = appointment.doctorName;
  const doctorSpecialty = appointment.doctorSpecialty;
  const doctorPhoto = appointment.doctorPhoto;

  return (
    <article className="rounded-3xl bg-card p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <img src={doctorPhoto} alt={doctorName} className="h-14 w-14 rounded-2xl object-cover ring-2 ring-primary-soft" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-display text-base font-semibold">{doctorName}</h3>
              <p className="text-xs text-muted-foreground">{doctorSpecialty}</p>
            </div>
            <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-secondary/60 px-3 py-2 text-xs">
            <span className="font-medium">
              {format(new Date(appointment.date), "EEE, MMM d")}
            </span>
            <span className="opacity-50">•</span>
            <span>{appointment.time}</span>
            <span className="opacity-50">•</span>
            <span className="flex items-center gap-1">
              {appointment.mode === "telemedicine" ? <Video className="h-3 w-3" /> : <Stethoscope className="h-3 w-3" />}
              {appointment.mode === "telemedicine" ? "Video" : "Clinic"}
            </span>
            <span
              className={cn(
                "ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                appointment.status === "upcoming" && "bg-primary-soft text-primary",
                appointment.status === "completed" && "bg-success/15 text-success",
                appointment.status === "missed" && "bg-destructive/10 text-destructive",
                appointment.status === "cancelled" && "bg-muted text-muted-foreground",
              )}
            >
              {appointment.status === "upcoming" ? <Calendar className="h-3 w-3" /> : <Stethoscope className="h-3 w-3" />}
              {appointment.status}
            </span>
          </div>

          {appointment.reason && <p className="mt-2 text-sm text-muted-foreground">{appointment.reason}</p>}

          {appointment.status === "upcoming" && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onReschedule(appointment)}
                className="rounded-xl border border-border bg-card py-2.5 text-sm font-medium hover:bg-secondary"
              >
                Reschedule
              </button>
              <button
                type="button"
                onClick={() => onCancelClick(appointment)}
                className="rounded-xl bg-destructive/10 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/15"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Appointments() {
  const [appointments, setAppointmentsState] = useState([]);
  const [tab, setTab] = useState("upcoming");

  // Cancellation modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    // Load database doctors list first
    apiGetDoctors()
      .then((docs) => {
        loadAppointments(docs);
      })
      .catch((err) => {
        console.error("Failed to load doctor list, falling back", err);
        loadAppointments([]);
      });
  }, []);

  const loadAppointments = (docs = []) => {
    apiGetAppointments().then((data) => {
      const mapped = data.map(appt => {
        const dbDoc = docs.find(d => d.id.toString() === appt.doctorId.toString());
        return {
          id: appt.id,
          doctorId: appt.doctorId.toString(),
          doctorName: dbDoc ? dbDoc.name : "Dr. Consultation Specialist",
          doctorSpecialty: dbDoc ? dbDoc.specialty : "General Practitioner",
          doctorPhoto: dbDoc && dbDoc.photo ? dbDoc.photo : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&h=256&fit=crop",
          date: appt.appointmentDatetime.split("T")[0],
          time: formatTime(appt.appointmentDatetime),
          mode: appt.consultationMode === "VIDEO" ? "telemedicine" : "in-person",
          status: appt.status === "BOOKED" ? "upcoming" : appt.status.toLowerCase(),
          reason: appt.reason
        };
      });
      setAppointmentsState(mapped);
    }).catch(err => console.error("Failed to load appointments", err));
  };

  const formatTime = (datetimeStr) => {
    try {
      const timeStr = datetimeStr.split("T")[1];
      const [hoursStr, minutesStr] = timeStr.split(":");
      let hours = parseInt(hoursStr, 10);
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutesStr} ${ampm}`;
    } catch (e) {
      return "12:00 PM";
    }
  };

  const filtered = useMemo(() => {
    if (tab === "all") return appointments;
    return appointments.filter((appointment) => appointment.status === tab);
  }, [appointments, tab]);

  const handleCancelClick = (appointment) => {
    setActiveAppointment(appointment);
    const hoursRemaining = getHoursToAppointment(appointment.date, appointment.time);

    if (hoursRemaining < 4) {
      setShowBlockedModal(true);
    } else {
      setShowCancelModal(true);
    }
  };

  const confirmCancellation = () => {
    if (!activeAppointment) return;

    setIsCancelling(true);
    apiCancelAppointment(activeAppointment.id)
      .then(() => {
        setIsCancelling(false);
        setShowCancelModal(false);
        toast.success("Appointment cancelled & refunded");
        loadAppointments();
        setActiveAppointment(null);
      })
      .catch((err) => {
        setIsCancelling(false);
        toast.error("Failed to cancel appointment");
        console.error(err);
      });
  };

  const handleReschedule = (appointment) => {
    toast("Reschedule", {
      description: `Open ${findDoctor(appointment.doctorId).name} to pick a new time slot.`,
    });
  };

  // Helper values for active modal
  const activeDoctor = activeAppointment ? findDoctor(activeAppointment.doctorId) : null;
  const activeRefundFee = activeAppointment && activeDoctor 
    ? (activeAppointment.mode === "telemedicine" && activeDoctor.modes.includes("telemedicine") ? activeDoctor.feeUsd - 10 : activeDoctor.feeUsd)
    : 0;

  return (
    <div className="animate-fade-up">
      <header className="gradient-soft px-5 pb-4 pt-10">
        <h1 className="font-display text-2xl font-semibold">Appointments</h1>
        <p className="text-sm text-muted-foreground">Track upcoming visits and past consultations.</p>
      </header>

      <div className="px-5 pt-4">
        <div className="grid grid-cols-4 rounded-2xl bg-secondary p-1">
          {["upcoming", "completed", "missed", "all"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "rounded-xl py-2 text-xs font-semibold capitalize transition",
                tab === value ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-3 px-5 py-5">
        <p className="text-xs text-muted-foreground">{filtered.length} appointments</p>
        {filtered.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onCancelClick={handleCancelClick}
            onReschedule={handleReschedule}
          />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-3xl bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
            No appointments in this section.
          </div>
        )}
      </section>

      {/* CONFIRM REFUND CANCELLATION MODAL */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-[360px] rounded-3xl p-5 bg-card/95 backdrop-blur-xl border border-border shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-foreground">Cancel Visit?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This will cancel your scheduled slot and process a partial refund.
            </DialogDescription>
          </DialogHeader>

          {activeAppointment && activeDoctor && (
            <div className="mt-3 space-y-4">
              {/* Summary */}
              <div className="rounded-2xl bg-secondary/50 p-3 text-xs space-y-1.5">
                <p className="font-medium text-foreground">{activeDoctor.name}</p>
                <p className="text-muted-foreground">
                  {format(new Date(activeAppointment.date), "EEEE, MMM d")} at {activeAppointment.time}
                </p>
              </div>

              {/* Policy note */}
              <div className="rounded-2xl border border-dashed border-primary/30 bg-primary-soft/30 p-3 text-xs space-y-2">
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Refund Amount</span>
                  <span className="font-semibold text-foreground">${activeRefundFee}.00</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Platform Fee (Non-refundable)</span>
                  <span className="font-semibold text-foreground">$5.00</span>
                </div>
                <hr className="border-border" />
                <p className="text-[10px] text-primary italic leading-tight">
                  Note: A refund of ${activeRefundFee}.00 will be credited to your card. The $5.00 platform charge is non-refundable.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={confirmCancellation}
                  disabled={isCancelling}
                  className="flex-1 flex items-center justify-center rounded-xl bg-destructive py-3 text-xs font-semibold text-destructive-foreground hover:bg-destructive/95 disabled:opacity-75"
                >
                  {isCancelling ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent" />
                  ) : (
                    "Confirm Cancel"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 rounded-xl border border-border bg-card py-3 text-xs font-semibold text-foreground hover:bg-secondary"
                >
                  Keep Booking
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CANCELLATION BLOCKED POLICY MODAL */}
      <Dialog open={showBlockedModal} onOpenChange={setShowBlockedModal}>
        <DialogContent className="max-w-[360px] rounded-3xl p-5 bg-card/95 backdrop-blur-xl border border-border shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-foreground flex items-center gap-1.5 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Cancellation Blocked
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This appointment is scheduled in less than 4 hours.
            </DialogDescription>
          </DialogHeader>

          {activeAppointment && (
            <div className="mt-3 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Under our cancellation policy, appointments cannot be cancelled or refunded **within 4 hours** of the scheduled time. 
              </p>
              <div className="rounded-2xl bg-secondary/50 p-3 text-xs space-y-1.5 border border-destructive/10">
                <p className="font-semibold text-foreground">Policy Constraint:</p>
                <p className="text-muted-foreground leading-snug">
                  Cancellations are only refundable when processed at least 4 hours prior. Please consult the helpdesk for emergency overrides.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBlockedModal(false)}
                className="w-full rounded-xl bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-soft hover:bg-primary/95"
              >
                Okay, Understood
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}