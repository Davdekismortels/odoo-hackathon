import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTrip, useAddStop, useRemoveStop } from "../hooks/useTrips";
import { usePublishTrip, useUnpublishTrip } from "../hooks/usePublic";
import { exploreApi, type City } from "../lib/trips.api";


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
    try {
      const results = await exploreApi.cities(q);
      setCities(results);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity || !form.arrivalDate || !form.departureDate) return;
    await addStop.mutateAsync({
      cityId: selectedCity.id,
      arrivalDate: form.arrivalDate,
      departureDate: form.departureDate,
      accommodation: form.accommodation || undefined,
      notes: form.notes || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add a stop 📍</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* City search */}
          <div className="field">
            <label className="field-label">City</label>
            {selectedCity ? (
              <div className="selected-city">
                <span>📍 {selectedCity.name}</span>
                <button type="button" className="btn-ghost-sm" onClick={() => setSelectedCity(null)}>Change</button>
              </div>
            ) : (
              <>
                <input
                  type="text" className="field-input" placeholder="Search city..."
                  value={citySearch}
                  onChange={(e) => { setCitySearch(e.target.value); searchCities(e.target.value); }}
                />
                {cities.length > 0 && (
                  <ul className="city-dropdown">
                    {cities.map((c) => (
                      <li key={c.id} className="city-option" onClick={() => { setSelectedCity(c); setCities([]); setCitySearch(""); }}>
                        📍 {c.name} {c.countryCode && <span className="city-cc">{c.countryCode}</span>}
                      </li>
                    ))}
                  </ul>
                )}
                {searching && <p className="field-hint">Searching…</p>}
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
              <input type="date" className="field-input" value={form.departureDate}
                min={form.arrivalDate}
                onChange={(e) => setForm((f) => ({ ...f, departureDate: e.target.value }))} required />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Accommodation <span className="field-optional">(optional)</span></label>
            <input type="text" className="field-input" placeholder="Hotel, Airbnb, etc."
              value={form.accommodation} onChange={(e) => setForm((f) => ({ ...f, accommodation: e.target.value }))} />
          </div>

          <div className="field">
            <label className="field-label">Notes <span className="field-optional">(optional)</span></label>
            <textarea className="field-input field-textarea" rows={2} placeholder="Any notes for this stop..."
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

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useTrip(id!);
  const removeStop = useRemoveStop(id!);
  const publishTrip = usePublishTrip(id!);
  const unpublishTrip = useUnpublishTrip(id!);
  const [showAddStop, setShowAddStop] = useState(false);
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

  const handleUnpublish = async () => {
    await unpublishTrip.mutateAsync();
    setShareLink(null);
  };

  if (isLoading) return <div className="loading-center"><span className="spinner" style={{ width: "2rem", height: "2rem" }} /></div>;
  if (isError || !data) return (
    <div className="empty-state">
      <p className="empty-state-title">Trip not found</p>
      <Link to="/trips" className="btn btn-primary">Back to trips</Link>
    </div>
  );

  const { trip, stops } = data;
  const nights = Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000);

  return (
    <div className="trip-detail">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/trips" className="breadcrumb-link">My Trips</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{trip.name}</span>
      </nav>

      {/* Hero header */}
      <div className="trip-detail-header">
        <div>
          <h1 className="trip-detail-title">{trip.name}</h1>
          {trip.description && <p className="trip-detail-desc">{trip.description}</p>}
          <div className="trip-detail-meta">
            <span>📅 {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</span>
            <span>🌙 {nights} nights</span>
            {trip.budgetLimit && <span>💰 {trip.currencyCode} {trip.budgetLimit.toLocaleString()}</span>}
          </div>
        </div>
        <div className="trip-detail-actions">
          <Link to={`/trips/${id}/packing`} className="btn btn-secondary">🧳 Packing</Link>
          <Link to={`/trips/${id}/notes`} className="btn btn-secondary">📝 Notes</Link>
          <Link to={`/trips/${id}/builder`} className="btn btn-secondary">🗺️ Builder</Link>
          <button
            className="btn btn-secondary"
            onClick={trip.isPublic ? handleUnpublish : handlePublish}
            disabled={publishTrip.isPending || unpublishTrip.isPending}
          >
            {trip.isPublic ? "🔒 Unpublish" : "🌐 Share"}
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddStop(true)}>➕ Add stop</button>
        </div>
      </div>

      {/* Share link banner */}
      {(shareLink || trip.isPublic) && (
        <div className="share-banner">
          <span className="share-banner-icon">🌐</span>
          <span className="share-banner-label">Public link:</span>
          <a
            href={shareLink ?? `${window.location.origin}/p/...`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-banner-link"
          >{shareLink ?? "published"}</a>
          {shareLink && (
            <button className="btn-ghost-sm share-banner-copy" onClick={() => {
              navigator.clipboard.writeText(shareLink).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}>
              {copied ? "✅ Copied!" : "📋 Copy"}
            </button>
          )}
        </div>
      )}

      {/* Stops timeline */}
      <section className="stops-section">
        <h2 className="section-title">Itinerary · {stops.length} stop{stops.length !== 1 ? "s" : ""}</h2>

        {stops.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📍</div>
            <h3 className="empty-state-title">No stops yet</h3>
            <p className="empty-state-desc">Add your first city stop to start building the itinerary.</p>
            <button className="btn btn-primary" onClick={() => setShowAddStop(true)}>Add first stop</button>
          </div>
        ) : (
          <ol className="stops-timeline">
            {stops.map((stop, idx) => (
              <li key={stop.id} className="stop-item">
                <div className="stop-connector">
                  <span className="stop-number">{idx + 1}</span>
                  {idx < stops.length - 1 && <div className="stop-line" />}
                </div>
                <div className="stop-card">
                  <div className="stop-card-header">
                    <div>
                      <h3 className="stop-city">{stop.city.name}</h3>
                      <p className="stop-dates">
                        {new Date(stop.arrivalDate).toLocaleDateString()} → {new Date(stop.departureDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      className="btn-ghost-sm btn-danger"
                      onClick={() => removeStop.mutate(stop.id)}
                      aria-label="Remove stop"
                    >✕</button>
                  </div>
                  {stop.accommodation && (
                    <p className="stop-meta">🏨 {stop.accommodation}</p>
                  )}
                  {stop.notes && <p className="stop-notes">{stop.notes}</p>}
                  <div className="stop-costs">
                    {(stop.accommodationCost ?? 0) > 0 && (
                      <span className="cost-chip">🏨 {trip.currencyCode} {stop.accommodationCost}</span>
                    )}
                    {(stop.transportCost ?? 0) > 0 && (
                      <span className="cost-chip">🚆 {trip.currencyCode} {stop.transportCost}</span>
                    )}
                    {(stop.mealCostPerDay ?? 0) > 0 && (
                      <span className="cost-chip">🍽️ {trip.currencyCode} {stop.mealCostPerDay}/day</span>
                    )}
                  </div>
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
