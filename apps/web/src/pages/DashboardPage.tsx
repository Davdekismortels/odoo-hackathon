import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const stats = [
  { label: "Trips planned", value: "0" },
  { label: "Cities explored", value: "0" },
  { label: "Budget saved", value: "$0" },
];

const quickActions = [
  { icon: "➕", label: "New trip", href: "/trips/new", primary: true },
  { icon: "🗺️", label: "Explore cities", href: "/explore", primary: false },
  { icon: "📋", label: "My trips", href: "/trips", primary: false },
];

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="dashboard">
      {/* Hero greeting */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <h1 className="dashboard-greeting">
            {greeting}, <span className="dashboard-name">{user?.fullName?.split(" ")[0] ?? "Traveler"}</span> 👋
          </h1>
          <p className="dashboard-subtitle">
            Where are you headed next? Let&apos;s build something beautiful.
          </p>

          <div className="quick-actions">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className={`btn ${action.primary ? "btn-primary" : "btn-secondary"}`}
              >
                <span>{action.icon}</span> {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Decorative globe SVG */}
        <div className="dashboard-hero-visual" aria-hidden="true">
          <div className="globe-container">
            <div className="globe-ring globe-ring--1" />
            <div className="globe-ring globe-ring--2" />
            <div className="globe-ring globe-ring--3" />
            <span className="globe-icon">🌍</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="dashboard-stats">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Empty state */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Recent Trips</h2>
          <Link to="/trips/new" className="section-action">+ New trip</Link>
        </div>

        <div className="empty-state">
          <div className="empty-state-icon">🗺️</div>
          <h3 className="empty-state-title">No trips yet</h3>
          <p className="empty-state-desc">
            Create your first trip and start adding stops, activities, and a budget.
          </p>
          <Link to="/trips/new" className="btn btn-primary">
            Plan my first trip
          </Link>
        </div>
      </section>
    </div>
  );
}
