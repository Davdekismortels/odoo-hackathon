import { Link } from "react-router-dom";
import { useTrips, useDeleteTrip } from "../hooks/useTrips";
import { TripCard } from "../components/trips/TripCard";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";

type StatusFilter = "all" | "planning" | "booked" | "completed" | "archived";

const STATUS_TABS: { key: StatusFilter; label: string; emoji: string }[] = [
  { key: "all",       label: "All",       emoji: "🌍" },
  { key: "planning",  label: "Planning",  emoji: "📋" },
  { key: "booked",    label: "Booked",    emoji: "🎟️" },
  { key: "completed", label: "Completed", emoji: "✅" },
  { key: "archived",  label: "Archived",  emoji: "📦" },
];

export function TripListPage() {
  const { data: trips = [], isLoading, isError } = useTrips();
  const deleteTrip = useDeleteTrip();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "budget">("date");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...trips];

    // Status filter
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "budget") return (b.budgetLimit ?? 0) - (a.budgetLimit ?? 0);
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    return list;
  }, [trips, statusFilter, search, sortBy]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: trips.length };
    for (const t of trips) c[t.status ?? "planning"] = (c[t.status ?? "planning"] ?? 0) + 1;
    return c;
  }, [trips]);

  const handleDelete = async (id: string) => {
    try {
      await deleteTrip.mutateAsync(id);
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete trip");
    }
  };

  return (
    <div className="trips-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Trips</h1>
          <p className="page-subtitle">
            {trips.length
              ? `${trips.length} trip${trips.length !== 1 ? "s" : ""} total`
              : "No trips yet — start planning!"}
          </p>
        </div>
        <Link to="/trips/new" className="btn btn-primary">➕ New trip</Link>
      </div>

      {/* Controls row */}
      <div className="trips-controls">
        {/* Search */}
        <input
          className="field-input trips-search"
          type="search"
          placeholder="🔍  Search trips…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Sort */}
        <select
          className="field-input trips-sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
        >
          <option value="date">Sort: Date</option>
          <option value="name">Sort: Name</option>
          <option value="budget">Sort: Budget</option>
        </select>
      </div>

      {/* Status tabs */}
      <div className="status-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`status-tab ${statusFilter === tab.key ? "status-tab--active" : ""}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
            {counts[tab.key] !== undefined && (
              <span className="status-tab-count">{counts[tab.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="trips-grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="trip-card-skeleton" />)}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="alert alert--error">Failed to load trips. Please try refreshing.</div>
      )}

      {/* Empty state — no trips at all */}
      {!isLoading && trips.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">✈️</div>
          <h3 className="empty-state-title">No trips yet</h3>
          <p className="empty-state-desc">Plan your first adventure — add stops, activities, and a budget all in one place.</p>
          <Link to="/trips/new" className="btn btn-primary">Plan my first trip</Link>
        </div>
      )}

      {/* Empty state — filter has no results */}
      {!isLoading && trips.length > 0 && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3 className="empty-state-title">No trips match</h3>
          <p className="empty-state-desc">Try a different filter or search term.</p>
          <button className="btn btn-secondary" onClick={() => { setSearch(""); setStatusFilter("all"); }}>
            Clear filters
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="trips-grid">
          {filtered.map((trip) => (
            <div key={trip.id} className="trip-card-wrapper">
              <TripCard trip={trip} />
              {/* Delete confirm overlay */}
              {deleteConfirm === trip.id ? (
                <div className="trip-delete-confirm">
                  <p>Delete <strong>{trip.name}</strong>?</p>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(trip.id)}
                      disabled={deleteTrip.isPending}
                    >
                      {deleteTrip.isPending ? <span className="spinner" /> : "Delete"}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirm(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="trip-delete-btn"
                  title="Delete trip"
                  onClick={() => setDeleteConfirm(trip.id)}
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm dialog */}
    </div>
  );
}
