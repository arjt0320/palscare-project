import { useState, useEffect } from "react";
import { Bell, CalendarDays, ChevronRight, FileHeart, Pill, Plus, CheckCircle, Calendar, X, BellRing } from "lucide-react";
import { Link } from "react-router-dom";
import { DoctorCard } from "@/components/DoctorCard";
import { format } from "date-fns";
import { findDoctor, apiGetProfile, apiGetAppointments, apiGetDoctors, specialties, apiGetReminders, apiDismissReminder } from "@/lib/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Index() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [profileName, setProfileName] = useState("Patient");
  const [nextAppointment, setNextAppointment] = useState(null);
  const [nextDoctor, setNextDoctor] = useState(null);
  const [dbDoctors, setDbDoctors] = useState([]);
  const [recentVisit, setRecentVisit] = useState(null);
  const [stats, setStats] = useState({ doctorCount: 4, upcomingCount: 0 });

  useEffect(() => {
    apiGetReminders().then(setReminders);
    
    // Load patient name from database
    apiGetProfile().then((p) => {
      if (p && p.name) setProfileName(p.name);
    }).catch(err => console.error("Failed to load profile for dashboard", err));

    // Load active appointments and doctors list from database
    Promise.all([apiGetAppointments(), apiGetDoctors()])
      .then(([appts, docs]) => {
        const mappedDocs = docs.map(doc => ({
          id: doc.id.toString(),
          name: doc.name,
          specialty: doc.specialty,
          experience: doc.experienceYears,
          rating: 4.8,
          reviews: 120,
          clinic: doc.university || "PalsCare Clinic",
          modes: ["in-person", "telemedicine"],
          feeUsd: 80,
          about: doc.bio || "Primary care physician.",
          photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&h=256&fit=crop"
        }));
        setDbDoctors(mappedDocs);

        const upcoming = appts.filter(a => a.status === "BOOKED" || a.status === "upcoming");
        const completed = appts.filter(a => a.status === "COMPLETED" || a.status === "completed");
        
        const nextAppt = upcoming[0];
        if (nextAppt) {
          const dbDoc = mappedDocs.find(d => d.id.toString() === nextAppt.doctorId.toString());
          setNextAppointment({
            id: nextAppt.id,
            date: nextAppt.appointmentDatetime.split("T")[0],
            time: formatTimeStr(nextAppt.appointmentDatetime.split("T")[1]),
            mode: nextAppt.consultationMode === "VIDEO" ? "telemedicine" : "in-person",
            reason: nextAppt.reason || "Doctor Visit"
          });
          if (dbDoc) {
            setNextDoctor({
              name: dbDoc.name,
              specialty: dbDoc.specialty,
              photo: dbDoc.photo
            });
          } else {
            setNextDoctor({
              name: "Dr. Consultation Specialist",
              specialty: "General Medicine",
              photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&h=256&fit=crop"
            });
          }
        } else {
          setNextAppointment(null);
          setNextDoctor(null);
        }

        if (completed.length > 0) {
          const lastCompleted = completed[completed.length - 1];
          const dbDoc = mappedDocs.find(d => d.id.toString() === lastCompleted.doctorId.toString());
          setRecentVisit({
            doctorName: dbDoc ? dbDoc.name : "Dr. Consultation Specialist",
            reason: lastCompleted.reason || "Follow-up care",
            date: lastCompleted.appointmentDatetime.split("T")[0]
          });
        } else {
          setRecentVisit(null);
        }

        setStats({
          doctorCount: docs.length > 0 ? docs.length : 4,
          upcomingCount: upcoming.length
        });
      })
      .catch(err => console.error("Failed to load dashboard data", err));
  }, []);

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

  const handleDismiss = (id) => {
    apiDismissReminder(id);
    apiGetReminders().then(setReminders);
    toast.success("Notification dismissed");
  };

  const unreadCount = reminders.length;

  return (
    <div className="animate-fade-up">
      <header className="gradient-soft px-5 pb-6 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Good afternoon,</p>
            <h1 className="font-display text-2xl font-semibold">{profileName ? profileName.split(" ")[0] : "Guest"}</h1>
          </div>
          <button
            onClick={() => {
              apiGetReminders().then(setReminders);
              setShowNotifications(true);
            }}
            className="relative grid h-11 w-11 place-items-center rounded-full bg-card shadow-soft hover:bg-secondary transition"
            type="button"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-accent animate-pulse-soft" />
            )}
          </button>
        </div>

        {nextAppointment && nextDoctor ? (
          <Link
            to="/appointments"
            className="mt-6 block overflow-hidden rounded-3xl gradient-hero p-5 text-primary-foreground shadow-glow"
          >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-90">
              <CalendarDays className="h-3.5 w-3.5" />
              Next appointment
            </div>
            <div className="mt-3 flex items-center gap-3">
              <img src={nextDoctor.photo} alt={nextDoctor.name} className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white/30" />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-semibold">{nextDoctor.name}</h3>
                <p className="text-sm opacity-90">{nextAppointment.reason || "Doctor visit"}</p>
              </div>
              <ChevronRight className="h-5 w-5 opacity-80" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/20 pt-3 text-sm">
              <span>{format(new Date(nextAppointment.date), "EEE, MMM d")}</span>
              <span className="opacity-60">•</span>
              <span>{nextAppointment.time}</span>
              <span className="ml-auto rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
                {nextAppointment.mode === "telemedicine" ? "Video" : "Clinic"}
              </span>
            </div>
          </Link>
        ) : (
          <div className="mt-6 rounded-3xl bg-card p-5 shadow-soft">
            <h3 className="font-display text-lg font-semibold">No upcoming appointments</h3>
            <p className="mt-1 text-sm text-muted-foreground">Book a visit to start tracking your schedule.</p>
            <Link to="/find" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Find a doctor
            </Link>
          </div>
        )}
      </header>

      <section className="px-5 py-5">
        <div className="grid grid-cols-3 gap-3">
          <Link to="/find" className="rounded-2xl bg-card p-4 text-center shadow-soft transition hover:shadow-elevated">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <p className="mt-2 text-xs font-medium">Book visit</p>
          </Link>
          <Link to="/records" className="rounded-2xl bg-card p-4 text-center shadow-soft transition hover:shadow-elevated">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
              <Pill className="h-5 w-5" />
            </div>
            <p className="mt-2 text-xs font-medium">Prescriptions</p>
          </Link>
          <Link to="/records" className="rounded-2xl bg-card p-4 text-center shadow-soft transition hover:shadow-elevated">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground">
              <FileHeart className="h-5 w-5" />
            </div>
            <p className="mt-2 text-xs font-medium">History</p>
          </Link>
        </div>
      </section>

      <section className="px-5 pb-2">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold">Specialties</h2>
          <Link to="/find" className="text-xs font-medium text-primary">
            See all
          </Link>
        </div>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {specialties.map((specialty) => (
            <Link
              key={specialty.label}
              to={`/find?specialty=${encodeURIComponent(specialty.label)}`}
              className="group flex min-w-[88px] flex-col items-center gap-2 rounded-2xl bg-card p-3 shadow-soft transition hover:bg-primary-soft"
            >
              <span className="text-2xl">{specialty.emoji}</span>
              <span className="text-center text-[11px] font-medium leading-tight">{specialty.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 py-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Featured doctors</h2>
          <span className="text-xs text-muted-foreground">{stats.doctorCount} professionals</span>
        </div>
        <div className="space-y-3">
          {dbDoctors.slice(0, 4).map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </section>

      <section className="px-5 py-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-card p-4 shadow-soft">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Upcoming visits</p>
            <p className="mt-2 font-display text-3xl font-semibold">{stats.upcomingCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">Appointments scheduled</p>
          </div>
          <div className="rounded-3xl bg-card p-4 shadow-soft">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Doctors available</p>
            <p className="mt-2 font-display text-3xl font-semibold">{stats.doctorCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">Across popular specialties</p>
          </div>
        </div>
        {recentVisit && (
          <div className="mt-3 rounded-3xl gradient-card p-4 shadow-soft">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Recent visit</p>
            <p className="mt-2 font-display text-lg font-semibold">{findDoctor(recentVisit.doctorId).name}</p>
            <p className="text-sm text-muted-foreground">
              {recentVisit.reason || "Follow-up care"} • {format(new Date(recentVisit.date), "MMM d, yyyy")}
            </p>
          </div>
        )}
      </section>

      {/* Notifications Inbox Modal */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-[360px] rounded-3xl p-5 bg-card/95 backdrop-blur-xl border border-border shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <BellRing className="h-5 w-5 text-primary" />
              Notifications
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Track medicine timings and booking alerts.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[300px] overflow-y-auto space-y-3 pr-1">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-start gap-3 rounded-2xl bg-secondary/40 p-3 border border-border/50 text-xs"
              >
                <div className={`mt-0.5 grid h-7 w-7 place-items-center rounded-lg ${
                  reminder.type === "medication" ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary"
                }`}>
                  {reminder.type === "medication" ? <Pill className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground leading-tight">{reminder.title}</p>
                  <p className="text-muted-foreground text-[10px] mt-1">{reminder.time}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDismiss(reminder.id)}
                  className="rounded-full bg-border hover:bg-secondary p-1 text-muted-foreground transition self-center"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {reminders.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <CheckCircle className="mx-auto h-8 w-8 text-success mb-2 opacity-80" />
                <p className="font-semibold text-foreground">All caught up!</p>
                <p className="mt-1">No pending medication reminders or visits notifications.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
