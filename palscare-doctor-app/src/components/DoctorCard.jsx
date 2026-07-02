import { Link } from "react-router-dom";
import { MapPin, Stethoscope, Star, Video } from "lucide-react";

export function DoctorCard({ doctor }) {
  return (
    <Link
      to={`/doctor/${doctor.id}`}
      className="group block rounded-3xl bg-card p-4 shadow-soft transition-all hover:shadow-elevated"
    >
      <div className="flex gap-4">
        <img
          src={doctor.photo}
          alt={doctor.name}
          loading="lazy"
          width={96}
          height={96}
          className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover ring-2 ring-primary-soft"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold leading-tight text-foreground">{doctor.name}</h3>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-accent-soft px-2 py-1">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              <span className="text-xs font-semibold text-foreground">{doctor.rating}</span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {doctor.distanceKm} km
            </span>
            <span>{doctor.experience} yrs exp</span>
            <div className="flex items-center gap-1.5">
              {doctor.modes.includes("telemedicine") && (
                <span className="flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-primary">
                  <Video className="h-3 w-3" />
                  Video
                </span>
              )}
              {doctor.modes.includes("in-person") && (
                <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
                  <Stethoscope className="h-3 w-3" />
                  Clinic
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
