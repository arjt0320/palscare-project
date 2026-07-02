import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DoctorCard } from "@/components/DoctorCard";
import { cn } from "@/lib/utils";
import { doctors, specialties } from "@/lib/mockData";

export default function FindDoctor() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const active = params.get("specialty") || "All";

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchSpecialty = active === "All" || doctor.specialty === active;
      const matchQuery =
        !query ||
        doctor.name.toLowerCase().includes(query.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(query.toLowerCase()) ||
        doctor.clinic.toLowerCase().includes(query.toLowerCase());

      return matchSpecialty && matchQuery;
    });
  }, [active, query]);

  const setSpecialty = (specialty) => {
    if (specialty === "All") {
      setParams({});
      return;
    }

    setParams({ specialty });
  };

  return (
    <div className="animate-fade-up">
      <header className="gradient-soft px-5 pb-4 pt-10">
        <h1 className="font-display text-2xl font-semibold">Find a doctor</h1>
        <p className="text-sm text-muted-foreground">Specialists, ratings, and open slots.</p>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-soft">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search doctor, clinic, condition…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button type="button" className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {["All", ...specialties.map((specialty) => specialty.label)].map((specialty) => (
          <button
            key={specialty}
            onClick={() => setSpecialty(specialty)}
            className={cn(
              "whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition",
              active === specialty
                ? "border-primary bg-primary text-primary-foreground shadow-soft"
                : "border-border bg-card text-foreground hover:border-primary/50",
            )}
          >
            {specialty}
          </button>
        ))}
      </div>

      <section className="space-y-3 px-5 pb-6">
        <p className="text-xs text-muted-foreground">{filteredDoctors.length} doctors found</p>
        {filteredDoctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
        {filteredDoctors.length === 0 && (
          <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
            No doctors match your search.
          </div>
        )}
      </section>
    </div>
  );
}
