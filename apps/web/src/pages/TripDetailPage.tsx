import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTrip, useAddStop, useRemoveStop } from "../hooks/useTrips";
import { usePublishTrip, useUnpublishTrip } from "../hooks/usePublic";
import { exploreApi, type City } from "../lib/trips.api";
import { X, MapPin, Calendar, Share2 } from "lucide-react";
import { getTripHeaderStyle } from "../lib/images";

const XIcon = () => <X size={16} strokeWidth={2.5} />;
const PinIcon = () => <MapPin size={14} strokeWidth={2} />;

function AddStopModal({ tripId, onClose }: { tripId: string; onClose: () => void }) {
  const addStop = useAddStop(tripId);
  const [citySearch, setCitySearch] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [form, setForm] = useState({ arrivalDate: "", departureDate: "", accommodation: "", notes: "" });
  const [searching, setSearching] = useState(false);

  const searchCities = async (q: string) => {
    if (!q.trim()) { setCities([]); return; }
    setSearching(true);
    try { setCities(await exploreApi.cities(q)); }
    finally { setSearching(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity || !form.arrivalDate || !form.departureDate) return;
    await addStop.mutateAsync({
      cityId: selectedCity.id, arrivalDate: form.arrivalDate, departureDate: form.departureDate,
      accommodation: form.accommodation || undefined, notes: form.notes || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add a stop</h2>
          <button className="btn-ghost-sm modal-close" onClick={onClose} aria-label="Close"><XIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field">
            <label className="field-label">City</label>
            {selectedCity ? (
              <div className="selected-city">
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <PinIcon />{selectedCity.name}
                  {selectedCity.countryCode && <span style={{ color: "var(--color-text-faint)", fontSize: "0.78rem" }}>{selectedCity.countryCode}</span>}
                </span>
                <button type="button" className="btn-ghost-sm" onClick={() => setSelectedCity(null)}>Change</button>
              </div>
            ) : (
              <>
                <input type="text" className="field-input" placeholder="Search city…"
                  value={citySearch} onChange={(e) => { setCitySearch(e.target.value); searchCities(e.target.value); }} />
                {searching && <p className="field-hint" style={{ marginTop: "0.25rem" }}>Searching…</p>}
                {cities.length > 0 && (
                  <ul className="city-dropdown">
                    {cities.map((c) => (
                      <li key={c.id} className="city-option"
                        onClick={() => { setSelectedCity(c); setCities([]); setCitySearch(""); }}>
                        <PinIcon /> {c.name}
                        {c.countryCode && <span className="city-cc">{c.countryCode}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label">Arrival</label>
              <input type="date" className="field-input" value={form.arrivalDate}
                onChange={(e) => setForm((f) => ({ ...f, arrivalDate: e.target.value }))} required />
            </div>
            <div className="field">
              <label className="field-label">Departure</label>
              <input type="date" className="field-input" value={form.departureDate} min={form.arrivalDate}
                onChange={(e) => setForm((f) => ({ ...f, departureDate: e.target.value }))} required />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Accommodation <span className="field-optional">(optional)</span></label>
            <input type="text" className="field-input" placeholder="Hotel, Airbnb, hostel…"
              value={form.accommodation} onChange={(e) => setForm((f) => ({ ...f, accommodation: e.target.value }))} />
          </div>

          <div className="field">
            <label className="field-label">Notes <span className="field-optional">(optional)</span></label>
            <textarea className="field-input field-textarea" rows={2} placeholder="Any notes for this stop…"
              value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!selectedCity || addStop.isPending}>
              {addStop.isPending ? <><span className="spinner" /> Adding…</> : "Add stop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useTrip(id!);
  const removeStop = useRemoveStop(id!);
  const publishTrip = usePublishTrip(id!);
  const unpublishTrip = useUnpublishTrip(id!);
  const [showAddStop, setShowAddStop] = useState(false);
  const [viewMode, setViewMode] = useState<"timeline" | "calendar">("timeline");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePublish = async () => {
    const pub = await publishTrip.mutateAsync();
    const link = `${window.location.origin}/p/${pub.slug}`;
    setShareLink(link);
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleUnpublish = async () => { await unpublishTrip.mutateAsync(); setShareLink(null); };

  if (isLoading) return <div className="loading-center"><span className="spinner" style={{ width: "2rem", height: "2rem" }} /></div>;
  if (isError || !data) return (
    <div className="empty-state" style={{ marginTop: "4rem" }}>
      <h3 className="empty-state-title">Trip not found</h3>
      <Link to="/trips" className="btn btn-primary">Back to trips</Link>
    </div>
  );

  const { trip, stops } = data;
  const nights = Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86_400_000);

  return (
    <div className="trip-detail">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/trips" className="breadcrumb-link">My Trips</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{trip.name}</span>
      </nav>

      {/* Header */}
      <div className="trip-detail-header" style={{
        ...getTripHeaderStyle(trip.name, trip.id, trip.coverImageUrl),
        padding: "var(--space-8) var(--space-6)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "inset 0 0 100px rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
        marginBottom: "var(--space-6)",
        overflow: "hidden"
      }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 className="trip-detail-title" style={{ fontSize: "3rem", textShadow: "0 2px 10px rgba(0,0,0,0.5)", marginBottom: "var(--space-2)" }}>{trip.name}</h1>
          {trip.description && <p className="trip-detail-desc" style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.85)", maxWidth: "600px", marginBottom: "var(--space-4)" }}>{trip.description}</p>}
          <div className="trip-detail-meta" style={{ display: "flex", gap: "var(--space-4)", fontSize: "0.95rem", fontWeight: 500 }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.1)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-md)", backdropFilter: "blur(4px)" }}>
              <Calendar size={16} strokeWidth={2} />
              {fmt(trip.startDate)} – {fmt(trip.endDate)}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.1)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-md)", backdropFilter: "blur(4px)" }}>
              {nights} nights
            </span>
            {trip.budgetLimit && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(255,255,255,0.1)", padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-md)", backdropFilter: "blur(4px)", color: "#10b981" }}>
                {trip.currencyCode} {trip.budgetLimit.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="trip-detail-actions" style={{ position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <Link to={`/trips/${id}/budget`} className="btn btn-secondary" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)", borderColor: "rgba(255,255,255,0.2)" }}>Budget</Link>
          <Link to={`/trips/${id}/packing`} className="btn btn-secondary" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)", borderColor: "rgba(255,255,255,0.2)" }}>Packing</Link>
          <Link to={`/trips/${id}/notes`} className="btn btn-secondary" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)", borderColor: "rgba(255,255,255,0.2)" }}>Notes</Link>
          <Link to={`/trips/${id}/builder`} className="btn btn-secondary" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)", borderColor: "rgba(255,255,255,0.2)" }}>Builder</Link>
          <Link to={`/trips/${id}/generate`} className="btn btn-secondary" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)", borderColor: "rgba(255,255,255,0.2)" }}>AI Generate</Link>
          <button className="btn btn-secondary"
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)", borderColor: "rgba(255,255,255,0.2)" }}
            onClick={trip.isPublic ? handleUnpublish : handlePublish}
            disabled={publishTrip.isPending || unpublishTrip.isPending}>
            {trip.isPublic ? "Unpublish" : "Share"}
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddStop(true)}>+ Add stop</button>
        </div>
      </div>

      {/* Share banner */}
      {(shareLink || trip.isPublic) && (
        <div className="share-banner">
          <Share2 size={16} strokeWidth={2} />
          <span className="share-banner-label">Public link:</span>
          <a href={shareLink ?? "#"} target="_blank" rel="noopener noreferrer" className="share-banner-link">
            {shareLink ?? "published"}
          </a>
          {shareLink && (
            <button className="btn-ghost-sm" onClick={() => { navigator.clipboard.writeText(shareLink).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      )}

      {/* Stops */}
      <section className="stops-section">
        <div className="stops-section-header">
          <h2 className="section-title">Itinerary · {stops.length} stop{stops.length !== 1 ? "s" : ""}</h2>
          <div className="view-toggle">
            <button className={`view-toggle-btn${viewMode === "timeline" ? " view-toggle-btn--active" : ""}`} onClick={() => setViewMode("timeline")}>List</button>
            <button className={`view-toggle-btn${viewMode === "calendar" ? " view-toggle-btn--active" : ""}`} onClick={() => setViewMode("calendar")}>Calendar</button>
          </div>
        </div>

        {stops.length === 0 ? (
          <div className="empty-state">
            <h3 className="empty-state-title">No stops yet</h3>
            <p className="empty-state-desc">Add your first city to start building the itinerary.</p>
            <button className="btn btn-primary" onClick={() => setShowAddStop(true)}>Add first stop</button>
          </div>
        ) : viewMode === "calendar" ? (
          <div className="calendar-view">
            {stops.map((stop) => {
              const arrival = new Date(stop.arrivalDate);
              const departure = new Date(stop.departureDate);
              const days = Math.max(1, Math.round((departure.getTime() - arrival.getTime()) / 86_400_000));
              return (
                <div key={stop.id} className="calendar-stop-block">
                  <div className="calendar-stop-date-col">
                    <div className="calendar-month">{arrival.toLocaleDateString(undefined, { month: "short" })}</div>
                    <div className="calendar-day">{arrival.getDate()}</div>
                    <div className="calendar-nights">{days}d</div>
                  </div>
                  <div className="calendar-stop-body">
                    <div className="calendar-stop-city">
                      <span className="calendar-city-dot" />
                      {stop.city.name}
                      <span className="calendar-country">{stop.city.countryCode}</span>
                    </div>
                    <div className="calendar-stop-range">
                      {arrival.toLocaleDateString(undefined, { month: "short", day: "numeric" })} → {departure.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </div>
                    {stop.accommodation && <div className="calendar-accommodation">{stop.accommodation}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <ol className="stops-timeline">
            {stops.map((stop, idx) => (
              <li key={stop.id} className="stop-item">
                <div className="stop-connector">
                  <span className="stop-number">{idx + 1}</span>
                  {idx < stops.length - 1 && <div className="stop-line" />}
                </div>
                <div className="stop-card" style={{ flex: 1, marginBottom: "var(--space-4)" }}>
                  <div className="stop-card-header">
                    <div>
                      <h3 className="stop-card-city">{stop.city.name}
                        {stop.city.countryCode && <span style={{ fontSize: "0.78rem", color: "var(--color-text-faint)", marginLeft: "0.4rem", fontWeight: 400 }}>{stop.city.countryCode}</span>}
                      </h3>
                      <p className="stop-card-dates">{fmt(stop.arrivalDate)} → {fmt(stop.departureDate)}</p>
                    </div>
                    <div className="stop-card-actions">
                      <button className="btn-ghost-sm" onClick={() => removeStop.mutate(stop.id)} aria-label="Remove stop" title="Remove stop"><XIcon /></button>
                    </div>
                  </div>
                  {stop.accommodation && <p className="stop-meta" style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "var(--space-2)" }}>{stop.accommodation}</p>}
                  {stop.notes && <p style={{ fontSize: "0.82rem", color: "var(--color-text-faint)", marginTop: "var(--space-1)", lineHeight: 1.6 }}>{stop.notes}</p>}
                  {((stop.accommodationCost ?? 0) > 0 || (stop.transportCost ?? 0) > 0 || (stop.mealCostPerDay ?? 0) > 0) && (
                    <div className="stop-costs">
                      {(stop.accommodationCost ?? 0) > 0 && <span className="cost-chip">Stay · {trip.currencyCode} {stop.accommodationCost}</span>}
                      {(stop.transportCost ?? 0) > 0 && <span className="cost-chip">Transport · {trip.currencyCode} {stop.transportCost}</span>}
                      {(stop.mealCostPerDay ?? 0) > 0 && <span className="cost-chip">Food · {trip.currencyCode} {stop.mealCostPerDay}/day</span>}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {showAddStop && <AddStopModal tripId={id!} onClose={() => setShowAddStop(false)} />}
    </div>
  );
}
