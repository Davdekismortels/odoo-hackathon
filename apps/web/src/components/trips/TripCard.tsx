import { Link } from "react-router-dom";
import type { Trip } from "../../lib/trips.api";
import { useDeleteTrip } from "../../hooks/useTrips";
import { Calendar, MapPin, DollarSign, Trash } from "lucide-react";
import { getTripImageUrl } from "../../lib/images";

const STATUS_COLORS: Record<string, string> = {
  planning: "badge--blue",
  booked: "badge--purple",
  completed: "badge--green",
  archived: "badge--gray",
};

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const days = Math.round((e.getTime() - s.getTime()) / 86_400_000);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, { ...opts, year: "numeric" })} · ${days}d`;
}

function calculateProgress(start: string, end: string) {
  const now = new Date().getTime();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  
  if (now > e) return 100; // Completed
  if (now < s) return 0; // Upcoming
  
  const total = e - s;
  if (total === 0) return 100;
  return Math.max(0, Math.min(100, ((now - s) / total) * 100));
}

interface Props { trip: Trip; }

export function TripCard({ trip }: Props) {
  const deleteTrip = useDeleteTrip();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete "${trip.name}"? This cannot be undone.`)) {
      deleteTrip.mutate(trip.id);
    }
  };

  const progress = calculateProgress(trip.startDate, trip.endDate);
  
  const coverUrl = getTripImageUrl(trip.name, trip.id, trip.coverImageUrl, 800);

  return (
    <Link to={`/trips/${trip.id}`} className="trip-card">
      {/* Cover */}
      <div className="trip-card-cover">
        <img src={coverUrl} alt={trip.name} className="trip-card-img" />
        <span className={`badge ${STATUS_COLORS[trip.status] ?? "badge--blue"}`}>{trip.status}</span>
      </div>

      {/* Progress Bar (Visual Density) */}
      <div className="trip-progress-bar" style={{ width: "100%", height: "4px", background: "var(--color-bg-elevated)" }}>
        <div 
          className="trip-progress-fill" 
          style={{ width: `${progress}%`, height: "100%", background: progress === 100 ? "var(--color-success)" : "var(--color-accent)", transition: "width 0.5s ease" }} 
        />
      </div>

      {/* Body */}
      <div className="trip-card-body">
        <h3 className="trip-card-title">{trip.name}</h3>
        {trip.description && <p className="trip-card-desc">{trip.description}</p>}
        <div className="trip-card-meta" style={{ marginTop: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <span className="trip-meta-item">
              <Calendar size={12} strokeWidth={2} />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
            {trip.stopCount !== undefined && trip.stopCount > 0 && (
              <span className="trip-meta-item">
                <MapPin size={12} strokeWidth={2} />
                {trip.stopCount} stop{trip.stopCount !== 1 ? "s" : ""}
              </span>
            )}
            {trip.budgetLimit && (
              <span className="trip-meta-item" style={{ gridColumn: "1 / -1", color: "var(--color-text)" }}>
                <DollarSign size={12} strokeWidth={2} />
                <strong style={{ fontWeight: 600 }}>{trip.currencyCode} {trip.budgetLimit.toLocaleString()}</strong> limit
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete */}
      <button className="trip-card-delete" onClick={handleDelete}
        aria-label={`Delete ${trip.name}`} disabled={deleteTrip.isPending}>
        <Trash size={14} strokeWidth={2.5} />
      </button>
    </Link>
  );
}
