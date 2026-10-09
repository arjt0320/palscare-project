import { useState, useEffect } from "react";
import { Bell, CalendarDays, ChevronRight, FileHeart, Pill, Plus, CheckCircle, Calendar, X, BellRing, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DoctorCard } from "@/components/DoctorCard";
import { format } from "date-fns";
import {
  findDoctor,
  getCurrentUser,
  getAppointments,
  doctors,
  specialties,
  getReminders,
  dismissReminder,
} from "@/lib/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [profileName, setProfileName] = useState("Alex");
  const [nextAppointment, setNextAppointment] = useState(null);
  const [nextDoctor, setNextDoctor] = useState(null);
  const [recentVisit, setRecentVisit] = useState(null);
  const [stats, setStats] = useState({ doctorCount: doctors.length, upcomingCount: 0 });

  const refreshData = () => {
    // Current user
    const user = getCurrentUser();
    if (user && user.name) {
      setProfileName(user.name);
    }

    // Reminders
    setReminders(getReminders());

    // Appointments
    const appts = getAppointments();
    const upcoming = appts.filter((a) => a.status === "upcoming" || a.status === "BOOKED");
    const completed = appts.filter((a) => a.status === "completed" || a.status === "COMPLETED");

    if (upcoming.length > 0) {
      const nextAppt = upcoming[0];
      const doc = findDoctor(nextAppt.doctorId);
      setNextAppointment(nextAppt);
      setNextDoctor(doc);
    } else {
      setNextAppointment(null);
      setNextDoctor(null);
    }

    if (completed.length > 0) {
      const last = completed[0];
      const doc = findDoctor(last.doctorId);
      setRecentVisit({
        doctorName: doc.name,
        reason: last.reason || "Health checkup",
        date: last.date,
      });
    } else {
      setRecentVisit(null);
    }

    setStats({
      doctorCount: doctors.length,
      upcomingCount: upcoming.length,
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleDismiss = (id) => {
    const updated = dismissReminder(id);
    setReminders(updated);
    toast.success("Notification dismissed");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/find?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const unreadCount = reminders.length;

  return (
    <div className="animate-fade-up">
      <header className="gradient-soft px-5 pb-6 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Good afternoon,</p>
            <h1 className="font-display text-2xl font-semibold">{profileName ? profileName.split(" ")[0] : "Alex"}</h1>
          </div>
          <button
            onClick={() => {
              setReminders(getReminders());
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

        {/* Dashboard Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-5 flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-soft border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctor, clinic, condition…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" className="hidden" />
        </form>

        {nextAppointment && nextDoctor ? (
          <Link
            to="/appointments"
            className="mt-6 block overflow-hidden rounded-3xl gradient-hero p-5 text-primary-foreground shadow-glow transition hover:opacity-95"
          >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-90">
              <CalendarDays className="h-3.5 w-3.5" />
              Next appointment
            </div>
            <div className="mt-3 flex items-center gap-3">
              <img
                src={nextDoctor.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nextDoctor.name)}`}
                alt={nextDoctor.name}
                className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white/30"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-semibold">{nextDoctor.name}</h3>
                <p className="text-sm opacity-90">{nextAppointment.reason || "Doctor consultation"}</p>
              </div>
              <ChevronRight className="h-5 w-5 opacity-80" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/20 pt-3 text-sm">
              <span>{format(new Date(nextAppointment.date), "EEE, MMM d")}</span>
              <span className="opacity-60">•</span>
              <span>{nextAppointment.time}</span>
              <span className="ml-auto rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
                {nextAppointment.mode === "telemedicine" ? "Video Telehealth" : "Clinic Visit"}
              </span>
            </div>
          </Link>
        ) : (
          <div className="mt-6 rounded-3xl bg-card p-5 shadow-soft">
            <h3 className="font-display text-lg font-semibold">No upcoming appointments</h3>
            <p className="mt-1 text-sm text-muted-foreground">Book a visit with top specialists in your area.</p>
            <Link to="/find" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft">
              Find a doctor
            </Link>
          </div>
        )}
      </header>

      {/* Quick Action Cards */}
      <section className="px-5 py-5">
        <div className="grid grid-cols-3 gap-3">
          <Link to="/find" className="rounded-2xl bg-card p-4 text-center shadow-soft transition hover:shadow-elevated hover:bg-secondary/40">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <p className="mt-2 text-xs font-medium">Book visit</p>
          </Link>
          <Link to="/records" className="rounded-2xl bg-card p-4 text-center shadow-soft transition hover:shadow-elevated hover:bg-secondary/40">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
              <Pill className="h-5 w-5" />
            </div>
            <p className="mt-2 text-xs font-medium">Prescriptions</p>
          </Link>
          <Link to="/records" className="rounded-2xl bg-card p-4 text-center shadow-soft transition hover:shadow-elevated hover:bg-secondary/40">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-secondary text-foreground">
              <FileHeart className="h-5 w-5" />
            </div>
            <p className="mt-2 text-xs font-medium">History</p>
          </Link>
        </div>
      </section>

      {/* Specialties Carousel */}
      <section className="px-5 pb-2">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold">Specialties</h2>
          <Link to="/find" className="text-xs font-medium text-primary hover:underline">
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

      {/* Featured Doctors */}
      <section className="px-5 py-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Featured doctors</h2>
          <span className="text-xs text-muted-foreground">{stats.doctorCount} verified</span>
        </div>
        <div className="space-y-3">
          {doctors.slice(0, 4).map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </section>

      {/* Key Stats */}
      <section className="px-5 py-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-card p-4 shadow-soft">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Upcoming visits</p>
            <p className="mt-2 font-display text-3xl font-semibold">{stats.upcomingCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">Appointments confirmed</p>
          </div>
          <div className="rounded-3xl bg-card p-4 shadow-soft">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Doctors available</p>
            <p className="mt-2 font-display text-3xl font-semibold">{stats.doctorCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">Across key specialties</p>
          </div>
        </div>

        {recentVisit && (
          <div className="mt-3 rounded-3xl gradient-card p-4 shadow-soft">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Recent consultation</p>
            <p className="mt-2 font-display text-lg font-semibold">{recentVisit.doctorName}</p>
            <p className="text-sm text-muted-foreground">
              {recentVisit.reason} • {format(new Date(recentVisit.date), "MMM d, yyyy")}
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
              Notifications & Alerts
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Active medication timings and booking notices.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[300px] overflow-y-auto space-y-3 pr-1">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-start gap-3 rounded-2xl bg-secondary/40 p-3 border border-border/50 text-xs"
              >
                <div
                  className={`mt-0.5 grid h-7 w-7 place-items-center rounded-lg ${
                    reminder.type === "medication" ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary"
                  }`}
                >
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
                  aria-label="Dismiss notification"
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
