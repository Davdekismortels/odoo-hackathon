import { Link } from "react-router-dom";
import type { Trip } from "../../lib/trips.api";
import { useDeleteTrip } from "../../hooks/useTrips";

const STATUS_COLORS: Record<string, string> = {
  planning: "badge--blue",
  booked: "badge--purple",
  completed: "badge--green",
  archived: "badge--gray",
};

const STATUS_ICONS: Record<string, string> = {
  planning: "🗺️",
  booked: "🎫",
  completed: "✅",
  archived: "📦",
};

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const days = Math.round((e.getTime() - s.getTime()) / 86400000);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, { ...opts, year: "numeric" })} · ${days}d`;
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

  return (
    <Link to={`/trips/${trip.id}`} className="trip-card">
      {/* Cover image / gradient placeholder */}
      <div className="trip-card-cover">
        {trip.coverImageUrl ? (
          <img src={trip.coverImageUrl} alt={trip.name} className="trip-card-img" />
        ) : (
          <div className="trip-card-gradient" aria-hidden="true">
            <span className="trip-card-globe">🌍</span>
          </div>
        )}
        <span className={`badge ${STATUS_COLORS[trip.status] ?? "badge--blue"}`}>
          {STATUS_ICONS[trip.status]} {trip.status}
        </span>
      </div>

      {/* Content */}
      <div className="trip-card-body">
        <h3 className="trip-card-title">{trip.name}</h3>
        {trip.description && <p className="trip-card-desc">{trip.description}</p>}

        <div className="trip-card-meta">
          <span className="trip-meta-item">📅 {formatDateRange(trip.startDate, trip.endDate)}</span>
          {trip.stopCount !== undefined && (
            <span className="trip-meta-item">📍 {trip.stopCount} stop{trip.stopCount !== 1 ? "s" : ""}</span>
          )}
          {trip.budgetLimit && (
            <span className="trip-meta-item">
              💰 {trip.currencyCode} {trip.budgetLimit.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        className="trip-card-delete"
        onClick={handleDelete}
        aria-label={`Delete ${trip.name}`}
        disabled={deleteTrip.isPending}
      >
        ✕
      </button>
    </Link>
  );
}
