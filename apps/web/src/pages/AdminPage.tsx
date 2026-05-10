import { Link } from "react-router-dom";
import { useAdminStats, useAdminUsers, useTrending } from "../hooks/usePublic";
import { useAuthStore } from "../store/auth.store";
import { useState } from "react";

function StatCard({ label, value, icon, sub }: { label: string; value: number; icon: string; sub?: string }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-value">{value.toLocaleString()}</div>
      <div className="admin-stat-label">{label}</div>
      {sub && <div className="admin-stat-sub">{sub}</div>}
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  planning: "blue", booked: "purple", completed: "green", archived: "gray",
};

export function AdminPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading, isError: statsError } = useAdminStats();
  const { data: trending = [] } = useTrending();
  const [userSearch, setUserSearch] = useState("");
  const { data: adminUsers = [], isLoading: usersLoading } = useAdminUsers(userSearch);

  const [tab, setTab] = useState<"overview" | "users" | "trending">("overview");

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

  if (statsLoading) return <div className="loading-center"><span className="spinner" style={{ width: "2rem", height: "2rem" }} /></div>;
  if (statsError || !stats) return (
    <div className="empty-state">
      <div className="empty-state-icon">⚠️</div>
      <h3 className="empty-state-title">Could not load stats</h3>
    </div>
  );

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
        <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
        <StatCard label="Total Trips" value={stats.totalTrips} icon="✈️" />
        <StatCard label="Public Itineraries" value={stats.totalPublic} icon="🌐" />
        <StatCard label="Trending" value={trending.length} icon="🔥" sub="public now" />
      </div>

      {/* Tab nav */}
      <div className="admin-tabs">
        {(["overview", "users", "trending"] as const).map((t) => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? "admin-tab--active" : ""}`}
            onClick={() => setTab(t)}
          >
            {{ overview: "📊 Overview", users: "👥 Users", trending: "🔥 Trending" }[t]}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <div className="admin-two-col">
          {/* Top cities */}
          <div className="admin-card">
            <h2 className="admin-card-title">🏙️ Most Visited Cities</h2>
            {stats.topCities.length === 0 ? (
              <p className="admin-empty">No stops recorded yet.</p>
            ) : (
              <ol className="admin-cities-list">
                {stats.topCities.map((city, i) => (
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
            {stats.recentTrips.length === 0 ? (
              <p className="admin-empty">No trips yet.</p>
            ) : (
              <ul className="admin-trips-list">
                {stats.recentTrips.map((trip) => (
                  <li key={trip.id} className="admin-trip-row">
                    <div className="admin-trip-info">
                      <Link to={`/trips/${trip.id}`} className="admin-trip-name">{trip.name}</Link>
                      <span className="admin-trip-date">
                        {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <span className={`badge badge--${STATUS_COLOR[trip.status ?? "planning"] ?? "gray"}`}>
                      {trip.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {tab === "users" && (
        <div className="admin-card admin-card--full">
          <div className="admin-card-toolbar">
            <h2 className="admin-card-title">👥 User Management</h2>
            <input
              className="field-input"
              style={{ maxWidth: 260 }}
              placeholder="🔍 Search by name or email…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          {usersLoading ? (
            <div style={{ padding: "2rem", textAlign: "center" }}><span className="spinner" /></div>
          ) : adminUsers.length === 0 ? (
            <p className="admin-empty">No users found.</p>
          ) : (
            <div className="admin-users-table">
              <div className="admin-users-head">
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
                <span>Joined</span>
                <span>Status</span>
              </div>
              {adminUsers.map((u) => (
                <div key={u.id} className={`admin-users-row ${u.deletedAt ? "admin-users-row--deleted" : ""}`}>
                  <span className="admin-user-name">{u.fullName ?? "—"}</span>
                  <span className="admin-user-email">{u.email}</span>
                  <span>
                    <span className={`badge ${u.role === "admin" ? "badge--purple" : "badge--gray"}`}>
                      {u.role ?? "user"}
                    </span>
                  </span>
                  <span className="admin-user-date">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </span>
                  <span>
                    {u.deletedAt
                      ? <span className="badge badge--red">Deleted</span>
                      : <span className="badge badge--green">Active</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="admin-users-note">
            💡 To promote a user to admin: <code>UPDATE users SET role = 'admin' WHERE email = '...';</code>
          </p>
        </div>
      )}

      {/* TRENDING TAB */}
      {tab === "trending" && (
        <div className="admin-card admin-card--full">
          <h2 className="admin-card-title">🔥 Trending Public Itineraries</h2>
          {trending.length === 0 ? (
            <p className="admin-empty">No public itineraries yet. Publish a trip to see it here.</p>
          ) : (
            <div className="admin-trending-grid">
              {trending.map((item) => (
                <Link key={item.slug} to={`/p/${item.slug}`} className="admin-trending-card" target="_blank" rel="noopener">
                  <div className="admin-trending-name">{item.tripName ?? "Unnamed trip"}</div>
                  <div className="admin-trending-meta">
                    <span>👁️ {item.viewCount ?? 0} views</span>
                    <span>📋 {item.cloneCount ?? 0} clones</span>
                    {item.currencyCode && item.budgetLimit && (
                      <span>💰 {item.currencyCode} {Number(item.budgetLimit).toLocaleString()}</span>
                    )}
                  </div>
                  <div className="admin-trending-slug">/p/{item.slug}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
