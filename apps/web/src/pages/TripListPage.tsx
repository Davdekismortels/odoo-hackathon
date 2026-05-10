import { Link } from "react-router-dom";
import { useTrips } from "../hooks/useTrips";
import { TripCard } from "../components/trips/TripCard";

export function TripListPage() {
  const { data: trips, isLoading, isError } = useTrips();

  return (
    <div className="trips-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Trips</h1>
          <p className="page-subtitle">
            {trips?.length
              ? `You have ${trips.length} trip${trips.length !== 1 ? "s" : ""} planned`
              : "No trips yet — start planning!"}
          </p>
        </div>
        <Link to="/trips/new" className="btn btn-primary">➕ New trip</Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="loading-grid">
          {[1, 2, 3].map((i) => <div key={i} className="trip-card-skeleton" />)}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="alert alert--error">Failed to load trips. Please try refreshing.</div>
      )}

      {/* Empty */}
      {!isLoading && trips?.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">✈️</div>
          <h3 className="empty-state-title">No trips yet</h3>
          <p className="empty-state-desc">Plan your first adventure — add stops, activities, and a budget all in one place.</p>
          <Link to="/trips/new" className="btn btn-primary">Plan my first trip</Link>
        </div>
      )}

      {/* Grid */}
      {trips && trips.length > 0 && (
        <div className="trips-grid">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
