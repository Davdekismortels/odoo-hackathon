import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { tripsApi, stopsApi } from "../lib/trips.api";

// ── Types ──────────────────────────────────────────────────────────────────
interface City {
  id: string;
  name: string;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  imageUrl: string | null;
  popularity: number | null;
}
interface Activity {
  id: string;
  cityId: string;
  name: string;
  category: string | null;
  description: string | null;
  imageUrl: string | null;
  estimatedCost: number | null;
  durationMin: number | null;
}
interface Country {
  code: string;
  name: string;
}

// ── API hooks ──────────────────────────────────────────────────────────────
function useCities(q: string, country: string) {
  return useQuery({
    queryKey: ["explore-cities", q, country],
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (country) params.set("country", country);
      params.set("limit", "30");
      return api.get<{ success: true; data: { cities: City[] } }>(`/explore/cities?${params}`)
        .then((r) => r.data.data.cities);
    },
  });
}

function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: () =>
      api.get<{ success: true; data: { countries: Country[] } }>("/explore/countries")
        .then((r) => r.data.data.countries),
    staleTime: 60 * 60 * 1000,
  });
}

function useCityActivities(cityId: string | null) {
  return useQuery({
    queryKey: ["city-activities", cityId],
    queryFn: () =>
      api.get<{ success: true; data: { activities: Activity[] } }>(`/explore/cities/${cityId}/activities`)
        .then((r) => r.data.data.activities),
    enabled: !!cityId,
  });
}

// ── Category config ────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  sightseeing: "#3b82f6",
  culture: "#8b5cf6",
  food: "#f59e0b",
  adventure: "#ef4444",
  nature: "#10b981",
  shopping: "#ec4899",
  nightlife: "#6366f1",
};

const CATEGORY_ICONS: Record<string, string> = {
  sightseeing: "🏛️",
  culture: "🎭",
  food: "🍜",
  adventure: "🧗",
  nature: "🌿",
  shopping: "🛍️",
  nightlife: "🌃",
};

// ── Add To Trip Modal ──────────────────────────────────────────────────────
function AddToTripModal({ city, onClose }: { city: City; onClose: () => void }) {
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: tripsApi.list,
  });

  const activeTrips = trips.filter((t) => t.status === "planning" || t.status === "booked");

  const addMutation = useMutation({
    mutationFn: () => {
      if (!selectedTripId || !arrivalDate || !departureDate) {
        throw new Error("Please select a trip and dates");
      }
      return stopsApi.add(selectedTripId, {
        cityId: city.id,
        arrivalDate,
        departureDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trip", selectedTripId] });
      onClose();
      // Optionally navigate to the trip builder
      navigate(`/trips/${selectedTripId}`);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to add stop");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    addMutation.mutate();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Add {city.name} to Trip</h2>
        <p className="modal-desc">Select an active trip and dates to add this destination.</p>

        {error && <div className="form-error">{error}</div>}

        {tripsLoading ? (
          <p>Loading your trips...</p>
        ) : activeTrips.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any active trips.</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate("/trips/new")}>
              Create a Trip
            </button>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ marginTop: 8 }}>
              Cancel
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-stack">
            <div className="field-group">
              <label>Select Trip</label>
              <select
                className="field-input"
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                required
              >
                <option value="">-- Choose a trip --</option>
                {activeTrips.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label>Arrival Date</label>
                <input
                  type="date"
                  className="field-input"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>Departure Date</label>
                <input
                  type="date"
                  className="field-input"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={onClose} disabled={addMutation.isPending}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adding..." : "Add Stop"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export function ExplorePage() {
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<string | null>(null);
  const [cityToAdd, setCityToAdd] = useState<City | null>(null);

  const { data: cities = [], isLoading: citiesLoading } = useCities(search, countryFilter);
  const { data: countries = [] } = useCountries();
  const { data: activities = [], isLoading: activitiesLoading } = useCityActivities(selectedCityId);

  const selectedCity = cities.find((c) => c.id === selectedCityId);

  const filteredActivities = useMemo(() => {
    if (!activityFilter) return activities;
    return activities.filter((a) => a.category === activityFilter);
  }, [activities, activityFilter]);

  const activityCategories = useMemo(() => {
    const cats = new Set(activities.map((a) => a.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [activities]);

  return (
    <div className="explore-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🌍 Explore Destinations</h1>
          <p className="page-subtitle">
            Discover cities and activities to add to your trips
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="explore-controls">
        <input
          className="field-input explore-search"
          type="search"
          placeholder="🔍  Search cities…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedCityId(null); }}
        />
        <select
          className="field-input explore-country-filter"
          value={countryFilter}
          onChange={(e) => { setCountryFilter(e.target.value); setSelectedCityId(null); }}
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
          ))}
        </select>
      </div>

      <div className="explore-layout">
        {/* City grid */}
        <section className="explore-cities-col">
          <h2 className="explore-section-title">
            📍 Cities
            {cities.length > 0 && <span className="explore-count">{cities.length}</span>}
          </h2>

          {citiesLoading ? (
            <div className="explore-skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="explore-city-skeleton" />)}
            </div>
          ) : cities.length === 0 ? (
            <div className="empty-state" style={{ padding: "2rem" }}>
              <div className="empty-state-icon">🏙️</div>
              <h3 className="empty-state-title">No cities found</h3>
              <p className="empty-state-desc">Try a different search or check the database seed.</p>
            </div>
          ) : (
            <div className="explore-cities-grid">
              {cities.map((city) => (
                <button
                  key={city.id}
                  className={`explore-city-card ${selectedCityId === city.id ? "explore-city-card--selected" : ""}`}
                  onClick={() => { setSelectedCityId(city.id); setActivityFilter(null); }}
                >
                  <div className="explore-city-header">
                    <span className="explore-city-name">{city.name}</span>
                    <span className="explore-city-country">{city.countryCode}</span>
                  </div>
                  {city.description && (
                    <p className="explore-city-desc">
                      {city.description.slice(0, 80)}{city.description.length > 80 ? "…" : ""}
                    </p>
                  )}
                  <div className="explore-city-meta">
                    {city.popularity != null && (
                      <span className="explore-city-pop">🔥 {city.popularity}</span>
                    )}
                    {city.latitude != null && (
                      <span className="explore-city-coords">
                        {Number(city.latitude).toFixed(1)}°, {Number(city.longitude).toFixed(1)}°
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    <button
                      className="btn btn-primary"
                      style={{ width: "100%", padding: "0.4rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCityToAdd(city);
                      }}
                    >
                      + Add to Trip
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Activity panel */}
        <section className="explore-activities-col">
          {!selectedCityId ? (
            <div className="explore-activity-placeholder">
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👈</div>
              <p>Select a city to browse activities</p>
            </div>
          ) : (
            <>
              <h2 className="explore-section-title">
                🎯 Activities in {selectedCity?.name ?? "…"}
                {activities.length > 0 && <span className="explore-count">{filteredActivities.length}</span>}
              </h2>

              {/* Category filter chips */}
              {activityCategories.length > 0 && (
                <div className="explore-activity-filters">
                  <button
                    className={`gen-chip ${activityFilter === null ? "gen-chip--active" : ""}`}
                    onClick={() => setActivityFilter(null)}
                  >
                    All
                  </button>
                  {activityCategories.map((cat) => (
                    <button
                      key={cat}
                      className={`gen-chip ${activityFilter === cat ? "gen-chip--active" : ""}`}
                      onClick={() => setActivityFilter(cat)}
                    >
                      {CATEGORY_ICONS[cat] ?? "📌"} {cat}
                    </button>
                  ))}
                </div>
              )}

              {activitiesLoading ? (
                <div style={{ padding: "2rem", textAlign: "center" }}><span className="spinner" /></div>
              ) : filteredActivities.length === 0 ? (
                <div className="explore-activity-placeholder">
                  <p>No activities found for this city.</p>
                </div>
              ) : (
                <div className="explore-activities-list">
                  {filteredActivities.map((act) => (
                    <div key={act.id} className="explore-activity-card">
                      <div className="explore-activity-top">
                        <span className="explore-activity-name">{act.name}</span>
                        {act.category && (
                          <span
                            className="badge"
                            style={{
                              background: `${CATEGORY_COLORS[act.category] ?? "#6b7280"}22`,
                              color: CATEGORY_COLORS[act.category] ?? "#6b7280",
                              border: `1px solid ${CATEGORY_COLORS[act.category] ?? "#6b7280"}44`,
                            }}
                          >
                            {CATEGORY_ICONS[act.category] ?? "📌"} {act.category}
                          </span>
                        )}
                      </div>
                      {act.description && (
                        <p className="explore-activity-desc">{act.description}</p>
                      )}
                      <div className="explore-activity-meta">
                        {act.estimatedCost != null && (
                          <span>💰 ${Number(act.estimatedCost).toFixed(0)}</span>
                        )}
                        {act.durationMin != null && (
                          <span>
                            ⏱️ {act.durationMin >= 60
                              ? `${Math.floor(act.durationMin / 60)}h${act.durationMin % 60 ? ` ${act.durationMin % 60}m` : ""}`
                              : `${act.durationMin}m`}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {cityToAdd && (
        <AddToTripModal city={cityToAdd} onClose={() => setCityToAdd(null)} />
      )}
    </div>
  );
}
