import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useTrips } from "../hooks/useTrips";
import { useTrending } from "../hooks/usePublic";

import { TripCard } from "../components/trips/TripCard";
import { LayoutDashboard, Wallet, Share2, Briefcase } from "lucide-react";

const FEATURES = [
  { icon: <LayoutDashboard size={20} />, title: "Visual Builder", desc: "Drag & drop stops and days with our intuitive itinerary builder." },
  { icon: <Wallet size={20} />, title: "Budget Engine", desc: "Real-time spend tracking per stop and category." },
  { icon: <Share2 size={20} />, title: "Share & Clone", desc: "Publish with a public link. Others can clone and customize." },
  { icon: <Briefcase size={20} />, title: "Packing Lists", desc: "Grouped checklists with progress tracking per trip." },
];

function TripSkeleton() {
  return (
    <div className="trips-grid">
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

  return (
    <div className="dashboard">
      {/* Hero */}
      <section className="dashboard-hero" style={{
        background: "linear-gradient(to right, rgba(10,10,10,0.98) 0%, rgba(10,10,10,0.85) 40%, rgba(10,10,10,0.4) 100%), url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=2000') center/cover",
        boxShadow: "inset 0 0 100px rgba(0,0,0,0.8)"
      }}>
        <div className="dashboard-hero-content" style={{ padding: "var(--space-6) 0" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
            {greeting}
          </p>
          <h1 className="dashboard-greeting" style={{ fontSize: "2.5rem" }}>
            {user?.fullName?.split(" ")[0] ?? "Traveler"}
          </h1>
          <p className="dashboard-subtitle" style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>
            {totalTrips > 0
              ? `${totalTrips} trip${totalTrips !== 1 ? "s" : ""} in your collection. Where to next?`
              : "Your journey starts here. Plan your first trip."}
          </p>
          <div className="quick-actions">
            <Link to="/trips/new" className="btn btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "1rem" }}>+ New trip</Link>
            <Link to="/explore" className="btn btn-secondary" style={{ padding: "0.75rem 1.5rem", fontSize: "1rem", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>Explore cities</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="dashboard-stats">
        {[
          { label: "Total trips", value: totalTrips },
          { label: "In planning", value: plannedTrips },
          { label: "Completed", value: completedTrips },
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
          <h2 className="section-title">Recent trips</h2>
          {trips.length > 0 && <Link to="/trips" className="section-action">View all →</Link>}
        </div>

        {isLoading ? (
          <TripSkeleton />
        ) : recentTrips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: "2rem", opacity: 0.4 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 17l3-8 4 4 4-6 3 10H3z"/><circle cx="19" cy="7" r="2"/></svg>
            </div>
            <h3 className="empty-state-title">No trips yet</h3>
            <p className="empty-state-desc">Create your first trip and start adding stops, activities, and a budget.</p>
            <Link to="/trips/new" className="btn btn-primary">Plan my first trip</Link>
          </div>
        ) : (
          <div className="trips-grid">
            {recentTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
            {trips.length > 3 && (
              <Link to="/trips" className="trip-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 160, color: "var(--color-text-muted)", flexDirection: "column", gap: "0.4rem" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>+{trips.length - 3}</span>
                <span style={{ fontSize: "0.85rem" }}>more trips</span>
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Trending */}
      <TrendingSection />

      {/* Features */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">What you can do</h2>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)", marginBottom: "var(--space-3)" }}>{f.icon}</div>
              <h3 className="feature-title" style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>{f.title}</h3>
              <p className="feature-desc" style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TrendingSection() {
  const { data: items = [], isLoading } = useTrending(6);
  if (isLoading || items.length === 0) return null;

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <h2 className="section-title">Trending itineraries</h2>
        <span className="section-hint">Community favourites — clone and customize</span>
      </div>
      <div className="trending-grid">
        {items.map((item) => (
          <Link key={item.slug} to={`/p/${item.slug}`} className="trending-card" target="_blank" rel="noopener noreferrer">
            <div className="trending-card-name">{item.tripName ?? "Unnamed trip"}</div>
            {item.tripDescription && (
              <p className="trending-card-desc">{item.tripDescription.slice(0, 90)}{item.tripDescription.length > 90 ? "…" : ""}</p>
            )}
            <div className="trending-card-meta">
              <span>{item.viewCount ?? 0} views</span>
              <span>{item.cloneCount ?? 0} clones</span>
              {item.currencyCode && item.budgetLimit && (
                <span>{item.currencyCode} {Number(item.budgetLimit).toLocaleString()}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
