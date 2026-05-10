import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { tripsApi, stopsApi } from "../lib/trips.api";
import { getTripImageUrl } from "../lib/images";

interface City { id: string; name: string; countryCode: string; latitude: number | null; longitude: number | null; description: string | null; imageUrl: string | null; popularity: number | null; }
interface Activity { id: string; cityId: string; name: string; category: string | null; description: string | null; imageUrl: string | null; estimatedCost: number | null; durationMin: number | null; }
interface Country { code: string; name: string; }

function useCities(q: string, country: string) {
  return useQuery({
    queryKey: ["explore-cities", q, country],
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (country) params.set("country", country);
      params.set("limit", "30");
      return api.get<{ success: true; data: { cities: City[] } }>(`/explore/cities?${params}`).then((r) => r.data.data.cities);
    },
  });
}

function useCountries() { return useQuery({ queryKey: ["countries"], queryFn: () => api.get<{ success: true; data: { countries: Country[] } }>("/explore/countries").then((r) => r.data.data.countries), staleTime: 3600000 }); }
function useCityActivities(cityId: string | null) { return useQuery({ queryKey: ["city-activities", cityId], queryFn: () => api.get<{ success: true; data: { activities: Activity[] } }>(`/explore/cities/${cityId}/activities`).then((r) => r.data.data.activities), enabled: !!cityId }); }

const CATEGORY_COLORS: Record<string, string> = { sightseeing: "#3b82f6", culture: "#8b5cf6", food: "#f59e0b", adventure: "#ef4444", nature: "#10b981", shopping: "#ec4899", nightlife: "#6366f1" };

function AddToTripModal({ city, onClose }: { city: City; onClose: () => void }) {
  const [selectedTripId, setSelectedTripId] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading: tripsLoading } = useQuery({ queryKey: ["trips"], queryFn: tripsApi.list });
  const activeTrips = trips.filter((t) => t.status === "planning" || t.status === "booked");

  const addMutation = useMutation({
    mutationFn: () => {
      if (!selectedTripId || !arrivalDate || !departureDate) throw new Error("Please select a trip and dates");
      return stopsApi.add(selectedTripId, { cityId: city.id, arrivalDate, departureDate });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["trips"] }); queryClient.invalidateQueries({ queryKey: ["trip", selectedTripId] }); onClose(); navigate(`/trips/${selectedTripId}`); },
    onError: (err: any) => { setError(err.message || "Failed to add stop"); },
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setError(""); addMutation.mutate(); };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add {city.name} to Trip</h2>
          <button className="btn-ghost-sm modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-form">
          <p className="modal-desc" style={{ marginBottom: "var(--space-4)" }}>Select an active trip and dates to add this destination.</p>
          {error && <div className="alert alert--error" style={{ marginBottom: "var(--space-4)" }}>{error}</div>}
          {tripsLoading ? <p>Loading your trips…</p> : activeTrips.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any active trips.</p>
              <button type="button" className="btn btn-primary" onClick={() => navigate("/trips/new")}>Create a Trip</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div className="field">
                <label className="field-label">Select Trip</label>
                <select className="field-input" value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)} required>
                  <option value="">-- Choose a trip --</option>
                  {activeTrips.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Arrival Date</label>
                  <input type="date" className="field-input" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} required />
                </div>
                <div className="field">
                  <label className="field-label">Departure Date</label>
                  <input type="date" className="field-input" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={addMutation.isPending}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addMutation.isPending}>
                  {addMutation.isPending ? <span className="spinner" /> : "Add Stop"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

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
      <div className="page-header">
        <div>
          <h1 className="page-title">Explore Destinations</h1>
          <p className="page-subtitle">Discover cities and activities to add to your trips</p>
        </div>
      </div>

      <div className="explore-controls">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-faint)" }} />
          <input className="field-input explore-search" type="search" placeholder="Search cities…" style={{ paddingLeft: "2.5rem" }} value={search} onChange={(e) => { setSearch(e.target.value); setSelectedCityId(null); }} />
        </div>
        <select className="field-input explore-country-filter" style={{ flexShrink: 0, width: "auto" }} value={countryFilter} onChange={(e) => { setCountryFilter(e.target.value); setSelectedCityId(null); }}>
          <option value="">All countries</option>
          {countries.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
        </select>
      </div>

      <div className="explore-layout">
        <section className="explore-cities-col">
          <h2 className="explore-section-title">
            Cities {cities.length > 0 && <span className="explore-count">({cities.length})</span>}
          </h2>

          {citiesLoading ? (
            <div className="explore-skeleton-grid">
              {[1, 2, 3, 4].map((i) => <div key={i} className="explore-city-skeleton" />)}
            </div>
          ) : cities.length === 0 ? (
            <div className="empty-state">
              <h3 className="empty-state-title">No cities found</h3>
              <p className="empty-state-desc">Try a different search term or country filter.</p>
            </div>
          ) : (
            <div className="explore-cities-grid">
              {cities.map((city) => {
                const bgUrl = getTripImageUrl(city.name, city.id, city.imageUrl, 600);

                return (
                  <div key={city.id} 
                    className={`explore-city-card ${selectedCityId === city.id ? "explore-city-card--selected" : ""}`}
                    onClick={() => { setSelectedCityId(city.id); setActivityFilter(null); }}
                  >
                    <div className="city-card-bg" style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%), url('${bgUrl}')` }}></div>
                    
                    <div className="city-card-content">
                      <div className="city-card-header">
                        <span className="city-card-name">{city.name}</span>
                        <span className="city-card-country">{city.countryCode}</span>
                      </div>
                      
                      {city.description && <p className="city-card-desc">{city.description.slice(0, 80)}…</p>}
                      
                      <div className="city-card-footer">
                        <div className="city-card-meta">
                          {city.popularity != null && <span>Pop: {city.popularity}</span>}
                        </div>
                        <button className="btn btn-primary btn-sm city-add-btn" onClick={(e) => { e.stopPropagation(); setCityToAdd(city); }}>+ Add</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="explore-activities-col">
          {!selectedCityId ? (
            <div className="explore-activity-placeholder">
              <p>Select a city to view its top activities</p>
            </div>
          ) : (
            <div className="explore-activities-container">
              <h2 className="explore-section-title">
                Activities in {selectedCity?.name}
                {activities.length > 0 && <span style={{ color: "var(--color-text-faint)", fontWeight: 400, marginLeft: "0.4rem" }}>({filteredActivities.length})</span>}
              </h2>

              {activityCategories.length > 0 && (
                <div className="explore-activity-filters" style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-5)" }}>
                  <button className={`packing-tab ${activityFilter === null ? "packing-tab--active" : ""}`} onClick={() => setActivityFilter(null)}>All</button>
                  {activityCategories.map((cat) => (
                    <button key={cat} className={`packing-tab ${activityFilter === cat ? "packing-tab--active" : ""}`} onClick={() => setActivityFilter(cat)} style={{ textTransform: "capitalize" }}>{cat}</button>
                  ))}
                </div>
              )}

              {activitiesLoading ? (
                <div className="loading-center"><span className="spinner" /></div>
              ) : filteredActivities.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state-desc">No activities found for this city.</p>
                </div>
              ) : (
                <div className="explore-activities-list">
                  {filteredActivities.map((act) => {
                    const cityName = selectedCity?.name || "Unknown City";
                    const bgUrl = getTripImageUrl(cityName + " " + (act.category || "travel"), act.id, act.imageUrl, 200);

                    return (
                      <div key={act.id} className="explore-activity-card" style={{ padding: "var(--space-3)", background: "var(--color-bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
                        <div className="explore-activity-thumb" style={{ width: "80px", height: "80px", borderRadius: "var(--radius-md)", backgroundImage: `url('${bgUrl}')`, backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div className="explore-activity-top" style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                            <span className="explore-activity-name" style={{ fontWeight: 600, color: "#fff", fontSize: "1rem" }}>{act.name}</span>
                            {act.category && (
                              <span className="badge" style={{ background: `${CATEGORY_COLORS[act.category] ?? "#6b7280"}22`, color: CATEGORY_COLORS[act.category] ?? "#6b7280", border: `1px solid ${CATEGORY_COLORS[act.category] ?? "#6b7280"}44`, textTransform: "capitalize" }}>
                                {act.category}
                              </span>
                            )}
                          </div>
                          {act.description && <p className="explore-activity-desc" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.5, marginBottom: "var(--space-2)" }}>{act.description}</p>}
                          <div className="explore-activity-meta" style={{ display: "flex", gap: "var(--space-4)", fontSize: "0.78rem", color: "var(--color-text-faint)", fontWeight: 500 }}>
                            {act.estimatedCost != null && <span>Cost: ${Number(act.estimatedCost).toFixed(0)}</span>}
                            {act.durationMin != null && <span>Duration: {act.durationMin >= 60 ? `${Math.floor(act.durationMin / 60)}h${act.durationMin % 60 ? ` ${act.durationMin % 60}m` : ""}` : `${act.durationMin}m`}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {cityToAdd && <AddToTripModal city={cityToAdd} onClose={() => setCityToAdd(null)} />}
    </div>
  );
}
