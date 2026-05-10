import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Compass, Trash } from "lucide-react";
import { useTrips, useDeleteTrip } from "../hooks/useTrips";
import { TripCard } from "../components/trips/TripCard";
import toast from "react-hot-toast";
import { getTripHeaderStyle } from "../lib/images";

type StatusFilter = "all" | "planning" | "booked" | "completed" | "archived";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "planning", label: "Planning" },
  { key: "booked", label: "Booked" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

export function TripListPage() {
  const { data: trips = [], isLoading, isError } = useTrips();
  const deleteTrip = useDeleteTrip();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "budget">("date");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...trips];
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }
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
      setDeleteConfirmId(null);
      toast.success("Trip deleted");
    } catch {
      toast.error("Failed to delete trip");
    }
  };

  return (
    <div className="trips-page">
      {/* Header */}
      <div className="page-header" style={{
        ...getTripHeaderStyle("My Trips", "trip_list", null),
        padding: "var(--space-8) var(--space-6)",
        borderRadius: "var(--radius-xl)",
        marginBottom: "var(--space-6)",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "var(--space-4)"
      }}>
        <div>
          <h1 className="page-title" style={{ fontSize: "2.5rem", textShadow: "0 2px 10px rgba(0,0,0,0.5)", marginBottom: "var(--space-2)" }}>My Trips</h1>
          <p className="page-subtitle" style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)" }}>
            {trips.length ? `${trips.length} trip${trips.length !== 1 ? "s" : ""} total` : "No trips yet — start planning!"}
          </p>
        </div>
        <Link to="/trips/new" className="btn btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "1.05rem" }}>+ New trip</Link>
      </div>

      {/* Controls */}
      <div className="trips-controls">
        <input className="field-input trips-search" type="search"
          placeholder="Search trips…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="field-input trips-sort" value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
          <option value="date">Sort: Newest</option>
          <option value="name">Sort: Name</option>
          <option value="budget">Sort: Budget</option>
        </select>
      </div>

      {/* Status tabs */}
      <div className="status-tabs">
        {STATUS_TABS.map((tab) => (
          <button key={tab.key}
            className={`status-tab ${statusFilter === tab.key ? "status-tab--active" : ""}`}
            onClick={() => setStatusFilter(tab.key)}>
            {tab.label}
            {counts[tab.key] !== undefined && (
              <span className="status-tab-count">{counts[tab.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="trips-grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="trip-card-skeleton" />)}
        </div>
      )}

      {/* Error */}
      {isError && <div className="alert alert--error">Failed to load trips. Please try refreshing.</div>}

      {/* Empty — no trips at all */}
      {!isLoading && trips.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Compass size={40} strokeWidth={1.5} style={{ opacity: 0.35, margin: "0 auto" }} />
          </div>
          <h3 className="empty-state-title">No trips yet</h3>
          <p className="empty-state-desc">Plan your first adventure — add stops, activities, and a budget all in one place.</p>
          <Link to="/trips/new" className="btn btn-primary">Plan my first trip</Link>
        </div>
      )}

      {/* Empty — filter has no results */}
      {!isLoading && trips.length > 0 && filtered.length === 0 && (
        <div className="empty-state">
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
              {deleteConfirmId === trip.id ? (
                <div className="trip-delete-confirm">
                  <p>Delete <strong>{trip.name}</strong>?</p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(trip.id)} disabled={deleteTrip.isPending}>
                      {deleteTrip.isPending ? <span className="spinner" /> : "Delete"}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="trip-delete-btn" title="Delete trip" onClick={() => setDeleteConfirmId(trip.id)}>
                  <Trash size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
