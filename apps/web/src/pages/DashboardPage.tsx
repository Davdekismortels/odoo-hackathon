import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useTrips } from "../hooks/useTrips";

const quickActions = [
  { icon: "➕", label: "New trip", href: "/trips/new", primary: true },
  { icon: "🗺️", label: "Explore cities", href: "/explore", primary: false },
  { icon: "📋", label: "My trips", href: "/trips", primary: false },
];

const FEATURES = [
  { icon: "🗺️", title: "Drag & Drop Builder", desc: "Reorder stops and days instantly with our visual itinerary builder." },
  { icon: "💰", title: "Budget Engine", desc: "Real-time spend tracking per stop and category. Never go over budget." },
  { icon: "🌐", title: "Share & Clone", desc: "Publish your itinerary with a link. Let others clone and customize it." },
  { icon: "🧳", title: "Packing Lists", desc: "Grouped checklists with progress tracking. Never forget a thing." },
];

function TripSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
      {[1, 2, 3].map((i) => <div key={i} className="trip-card-skeleton" />)}
    </div>
  );
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: trips = [], isLoading } = useTrips();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const recentTrips = trips.slice(0, 3);
  const totalTrips = trips.length;
  const plannedTrips = trips.filter((t) => t.status === "planning").length;
  const completedTrips = trips.filter((t) => t.status === "completed").length;

  const STATUS_BADGE: Record<string, string> = {
    planning: "badge--blue", booked: "badge--purple",
    completed: "badge--green", archived: "badge--gray",
  };

  return (
    <div className="dashboard">
      {/* Hero */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <h1 className="dashboard-greeting">
            {greeting}, <span className="dashboard-name">{user?.fullName?.split(" ")[0] ?? "Traveler"}</span> 👋
          </h1>
          <p className="dashboard-subtitle">
            {totalTrips > 0
              ? `You have ${totalTrips} trip${totalTrips !== 1 ? "s" : ""} planned. Where to next?`
              : "Where are you headed next? Let's build something beautiful."}
          </p>
          <div className="quick-actions">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href} className={`btn ${action.primary ? "btn-primary" : "btn-secondary"}`}>
                <span>{action.icon}</span> {action.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="dashboard-hero-visual" aria-hidden="true">
          <div className="globe-container">
            <div className="globe-ring globe-ring--1" />
            <div className="globe-ring globe-ring--2" />
            <div className="globe-ring globe-ring--3" />
            <span className="globe-icon">🌍</span>
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className="dashboard-stats">
        {[
          { label: "Trips planned", value: String(totalTrips) },
          { label: "Planning", value: String(plannedTrips) },
          { label: "Completed", value: String(completedTrips) },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Recent trips */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Recent Trips</h2>
          <Link to="/trips" className="section-action">View all →</Link>
        </div>

        {isLoading ? (
          <TripSkeleton />
        ) : recentTrips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗺️</div>
            <h3 className="empty-state-title">No trips yet</h3>
            <p className="empty-state-desc">Create your first trip and start adding stops, activities, and a budget.</p>
            <Link to="/trips/new" className="btn btn-primary">Plan my first trip</Link>
          </div>
        ) : (
          <div className="trips-grid">
            {recentTrips.map((trip) => (
              <Link key={trip.id} to={`/trips/${trip.id}`} className="trip-card">
                <div className="trip-card-cover">
                  <div className="trip-card-gradient">
                    <span className="trip-card-globe">🌍</span>
                  </div>
                  <span className={`badge ${STATUS_BADGE[trip.status ?? "planning"] ?? "badge--gray"}`}>
                    {trip.status}
                  </span>
                </div>
                <div className="trip-card-body">
                  <h3 className="trip-card-title">{trip.name}</h3>
                  {trip.description && <p className="trip-card-desc">{trip.description}</p>}
                  <div className="trip-card-meta">
                    <span className="trip-meta-item">📅 {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</span>
                    {trip.budgetLimit && <span className="trip-meta-item">💰 {trip.currencyCode} {trip.budgetLimit.toLocaleString()}</span>}
                  </div>
                </div>
              </Link>
            ))}
            {trips.length > 3 && (
              <Link to="/trips" className="trip-card trip-card--more">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "0.5rem", color: "var(--color-text-muted)", padding: "2rem" }}>
                  <span style={{ fontSize: "2rem" }}>+{trips.length - 3}</span>
                  <span style={{ fontSize: "0.9rem" }}>more trips</span>
                </div>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Feature highlights */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">What you can do</h2>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
