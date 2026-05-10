import { Link } from "react-router-dom";
import { useAdminStats } from "../hooks/usePublic";
import { useAuthStore } from "../store/auth.store";

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-value">{value.toLocaleString()}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  );
}

export function AdminPage() {
  const { user } = useAuthStore();
  const { data, isLoading, isError } = useAdminStats();

  if (user?.role !== "admin") {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔒</div>
        <h3 className="empty-state-title">Access denied</h3>
        <p className="empty-state-desc">This page is only accessible to administrators.</p>
        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="loading-center"><span className="spinner" style={{ width: "2rem", height: "2rem" }} /></div>;
  }

  if (isError || !data) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3 className="empty-state-title">Could not load stats</h3>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview and analytics</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="admin-stats-grid">
        <StatCard label="Total Users" value={data.totalUsers} icon="👥" />
        <StatCard label="Total Trips" value={data.totalTrips} icon="✈️" />
        <StatCard label="Public Itineraries" value={data.totalPublic} icon="🌐" />
      </div>

      <div className="admin-two-col">
        {/* Top cities */}
        <div className="admin-card">
          <h2 className="admin-card-title">🏙️ Most Visited Cities</h2>
          {data.topCities.length === 0 ? (
            <p className="admin-empty">No stops recorded yet.</p>
          ) : (
            <ol className="admin-cities-list">
              {data.topCities.map((city, i) => (
                <li key={i} className="admin-city-row">
                  <span className="admin-rank">#{i + 1}</span>
                  <span className="admin-city-name">{city.name ?? "Unknown"}</span>
                  <span className="admin-city-count">{city.count} stop{city.count !== 1 ? "s" : ""}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Recent trips */}
        <div className="admin-card">
          <h2 className="admin-card-title">🕐 Recent Trips</h2>
          {data.recentTrips.length === 0 ? (
            <p className="admin-empty">No trips yet.</p>
          ) : (
            <ul className="admin-trips-list">
              {data.recentTrips.map((trip) => (
                <li key={trip.id} className="admin-trip-row">
                  <div className="admin-trip-info">
                    <Link to={`/trips/${trip.id}`} className="admin-trip-name">{trip.name}</Link>
                    <span className="admin-trip-date">
                      {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <span className={`badge badge--${
                    trip.status === "planning" ? "blue" :
                    trip.status === "booked" ? "purple" :
                    trip.status === "completed" ? "green" : "gray"
                  }`}>{trip.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
