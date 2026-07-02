import { useState } from "react";
import { FlaskConical, FileText, Pill, Stethoscope, Syringe, Upload } from "lucide-react";
import { format } from "date-fns";
import { findDoctor, medicalHistory, prescriptions, addReminder } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function iconFor(type) {
  switch (type) {
    case "lab":
      return FlaskConical;
    case "vaccination":
      return Syringe;
    case "prescription":
      return Pill;
    case "diagnosis":
      return Stethoscope;
    default:
      return FileText;
  }
}

export default function Records() {
  const [tab, setTab] = useState("prescriptions");

  return (
    <div className="animate-fade-up">
      <header className="gradient-soft px-5 pb-4 pt-10">
        <h1 className="font-display text-2xl font-semibold">Health records</h1>
        <p className="text-sm text-muted-foreground">All your prescriptions and history in one place.</p>
      </header>

      <div className="px-5 pt-4">
        <div className="grid grid-cols-2 rounded-2xl bg-secondary p-1">
          {["prescriptions", "timeline"].map((value) => (
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

      {tab === "prescriptions" && (
        <section className="space-y-3 px-5 py-5">
          <button
            type="button"
            onClick={() => toast("Upload prescription", { description: "Select an image or PDF (mock action)." })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary-soft/50 py-5 text-sm font-medium text-primary transition hover:bg-primary-soft"
          >
            <Upload className="h-4 w-4" />
            Upload prescription (image / PDF)
          </button>

          {prescriptions.map((prescription) => {
            const doctor = findDoctor(prescription.doctorId);

            return (
              <article key={prescription.id} className="rounded-3xl bg-card p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-semibold">{prescription.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {doctor.name} • {format(new Date(prescription.date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <ul className="mt-3 space-y-2">
                  {prescription.medications.map((medication) => (
                    <li key={medication.name} className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{medication.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {medication.dosage} • {medication.frequency}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          addReminder({
                            type: "medication",
                            title: `Take ${medication.name} (${medication.dosage})`,
                            time: `Scheduled: ${medication.frequency}`,
                            refId: medication.name
                          });
                          toast.success("Reminder set", {
                            description: `${medication.name} — ${medication.frequency}. Added to notifications.`
                          });
                        }}
                        className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground"
                      >
                        Remind me
                      </button>
                    </li>
                  ))}
                </ul>

                {prescription.notes && <p className="mt-2 text-xs italic text-muted-foreground">"{prescription.notes}"</p>}
              </article>
            );
          })}
        </section>
      )}

      {tab === "timeline" && (
        <section className="px-5 py-5">
          <div className="relative space-y-4 border-l-2 border-primary-soft pl-5">
            {medicalHistory.map((record) => {
              const Icon = iconFor(record.type);

              return (
                <div key={record.id} className="relative">
                  <span className="absolute -left-[33px] grid h-8 w-8 place-items-center rounded-full bg-card ring-2 ring-primary-soft">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  <div className="rounded-2xl bg-card p-4 shadow-soft">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{record.type}</p>
                    <h3 className="font-display text-base font-semibold leading-tight">{record.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{record.detail}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {format(new Date(record.date), "MMMM d, yyyy")}
                      {record.doctorId ? ` • ${findDoctor(record.doctorId).name}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
