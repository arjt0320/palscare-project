import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DoctorCard } from "@/components/DoctorCard";
import { cn } from "@/lib/utils";
import { doctors, specialties, apiGetDoctors } from "@/lib/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function FindDoctor() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(() => params.get("query") || "");
  const active = params.get("specialty") || "All";
  const [doctorsList, setDoctorsList] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);

  // Filter States
  const [maxFee, setMaxFee] = useState("Any");
  const [minExp, setMinExp] = useState("Any");
  const [sortBy, setSortBy] = useState("rating"); // "rating" | "distance" | "fee"
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const urlQuery = params.get("query") || "";
    setQuery(urlQuery);
  }, [params]);

  useEffect(() => {
    apiGetDoctors(active).then((data) => {
      const mapped = data.map((doc) => ({
        id: doc.id.toString(),
        name: doc.name,
        specialty: doc.specialty,
        experience: doc.experienceYears,
        rating: 4.8,
        reviews: 120,
        clinic: doc.university || "PalsCare Clinic",
        modes: ["in-person"], // force in-person only
        feeUsd: 80,
        about: doc.bio || "Primary care physician."
      }));
      setDoctorsList(mapped);
    }).catch(err => {
      console.error("Failed to load doctors", err);
      // fallback to mock doctors if backend is offline or empty during UI dev
      setDoctorsList(doctors);
    });
  }, [active]);

  const filteredDoctors = useMemo(() => {
    let result = doctorsList.filter((doctor) => {
      const matchSpecialty = active === "All" || doctor.specialty === active;
      const matchQuery =
        !query ||
        doctor.name.toLowerCase().includes(query.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(query.toLowerCase()) ||
        (doctor.clinic && doctor.clinic.toLowerCase().includes(query.toLowerCase()));

      const matchFee =
        maxFee === "Any" ||
        (maxFee === "80" && doctor.feeUsd <= 80) ||
        (maxFee === "120" && doctor.feeUsd <= 120);

      const matchExp =
        minExp === "Any" ||
        (minExp === "5" && doctor.experience >= 5) ||
        (minExp === "10" && doctor.experience >= 10) ||
        (minExp === "15" && doctor.experience >= 15);

      return matchSpecialty && matchQuery && matchFee && matchExp;
    });

    // Sort results
    if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "distance") {
      result = [...result].sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === "fee") {
      result = [...result].sort((a, b) => a.feeUsd - b.feeUsd);
    }

    return result;
  }, [doctorsList, active, query, maxFee, minExp, sortBy]);

  // Reset visible items when query or active specialty changes
  useEffect(() => {
    setVisibleCount(5);
  }, [active, query]);

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 120
      ) {
        setVisibleCount((prev) => Math.min(prev + 5, filteredDoctors.length));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredDoctors.length]);

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
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft hover:bg-primary/95 transition"
          >
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
        {filteredDoctors.slice(0, visibleCount).map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
        
        {visibleCount < filteredDoctors.length && (
          <div className="flex justify-center items-center py-6 gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs text-muted-foreground font-semibold">Loading more doctors...</span>
          </div>
        )}

        {filteredDoctors.length === 0 && (
          <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
            No doctors match your search.
          </div>
        )}
      </section>

      {/* Filter Modal */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-[360px] rounded-3xl p-5 bg-card/95 backdrop-blur-xl border border-border shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-foreground">Filter Doctors</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Narrow down your doctor selection.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-4">
            {/* Consultation Fee */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">Max Consultation Fee</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Any", value: "Any" },
                  { label: "Under $80", value: "80" },
                  { label: "Under $120", value: "120" }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMaxFee(item.value)}
                    className={cn(
                      "rounded-xl py-2 text-xs font-semibold border transition",
                      maxFee === item.value
                        ? "border-primary bg-primary-soft text-primary shadow-soft"
                        : "border-border bg-background text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">Minimum Experience</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: "Any", value: "Any" },
                  { label: "5+ Yrs", value: "5" },
                  { label: "10+ Yrs", value: "10" },
                  { label: "15+ Yrs", value: "15" }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMinExp(item.value)}
                    className={cn(
                      "rounded-xl py-2 text-[10px] font-semibold border transition",
                      minExp === item.value
                        ? "border-primary bg-primary-soft text-primary shadow-soft"
                        : "border-border bg-background text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-2">Sort Results By</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Rating", value: "rating" },
                  { label: "Distance", value: "distance" },
                  { label: "Fee", value: "fee" }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSortBy(item.value)}
                    className={cn(
                      "rounded-xl py-2 text-xs font-semibold border transition",
                      sortBy === item.value
                        ? "border-primary bg-primary-soft text-primary shadow-soft"
                        : "border-border bg-background text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-border mt-4">
              <button
                type="button"
                onClick={() => {
                  setMaxFee("Any");
                  setMinExp("Any");
                  setSortBy("rating");
                }}
                className="flex-1 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary transition"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition shadow-soft"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
