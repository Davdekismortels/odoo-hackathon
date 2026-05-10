import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import { usePublicTrip, useCloneTrip } from "../hooks/usePublic";
import { useAuthStore } from "../store/auth.store";
import type { PublicStop } from "../lib/public.api";

const CATEGORY_EMOJI: Record<string, string> = {
  sightseeing: "🏛️", food: "🍽️", adventure: "🧗", culture: "🎭",
  nightlife: "🌙", shopping: "🛍️", nature: "🌿", other: "📌",
};

function StopCard({ stop, index, currency }: { stop: PublicStop; index: number; currency: string }) {
  const nights = Math.round(
    (new Date(stop.departureDate).getTime() - new Date(stop.arrivalDate).getTime()) / 86400000
  );
  return (
    <div className="pub-stop-card">
      <div className="pub-stop-connector">
        <span className="pub-stop-number">{index + 1}</span>
        <div className="pub-stop-line" />
      </div>
      <div className="pub-stop-body">
        <div className="pub-stop-header">
          <div>
            <h3 className="pub-stop-city">
              {stop.cityName}
              {stop.cityCountryCode && <span className="pub-stop-cc"> · {stop.cityCountryCode}</span>}
            </h3>
            <p className="pub-stop-dates">
              {new Date(stop.arrivalDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              {" "}→{" "}
              {new Date(stop.departureDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              {" "}· {nights} night{nights !== 1 ? "s" : ""}
            </p>
          </div>
          {stop.accommodation && (
            <span className="pub-stop-accomm">🏨 {stop.accommodation}</span>
          )}
        </div>

        {stop.activities.length > 0 && (
          <ul className="pub-activities">
            {stop.activities.map((act) => (
              <li key={act.id} className="pub-activity-item">
                <span className="pub-activity-emoji">
                  {CATEGORY_EMOJI[act.activityCategory ?? ""] ?? "📌"}
                </span>
                <span className="pub-activity-name">{act.activityName}</span>
                {act.durationMin && (
                  <span className="pub-activity-dur">{act.durationMin}min</span>
                )}
                <span className="pub-activity-cost">
                  {currency} {(act.customCost ?? act.estimatedCost ?? 0).toFixed(0)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {stop.notes && <p className="pub-stop-notes">{stop.notes}</p>}
      </div>
    </div>
  );
}

export function PublicTripPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePublicTrip(slug!);
  const cloneTrip = useCloneTrip(slug!);
  const { isAuthenticated } = useAuthStore();
  const [copied, setCopied] = useState(false);


  const handleClone = async () => {
    if (!isAuthenticated) { navigate("/signup"); return; }
    const cloned = await cloneTrip.mutateAsync();
    navigate(`/trips/${cloned.id}`);
  };

  const pageUrl = window.location.href;
  const shareText = data ? `Check out this trip: ${data.trip.name} \ud83c\udf0d` : "Check out this trip!";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareTwitter = () =>
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`, "_blank");

  const shareWhatsApp = () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + pageUrl)}`, "_blank");


  if (isLoading) {
    return (
      <div className="pub-loading">
        <span className="spinner" style={{ width: "3rem", height: "3rem" }} />
        <p>Loading itinerary…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="pub-not-found">
        <div className="pub-not-found-icon">🗺️</div>
        <h1>Itinerary not found</h1>
        <p>This itinerary may have been unpublished or the link is invalid.</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    );
  }

  const { pub, trip, stops } = data;
  const currency = trip.currencyCode ?? "USD";
  const totalCost = stops.reduce((sum, s) =>
    sum + s.activities.reduce((asum, a) => asum + (a.customCost ?? a.estimatedCost ?? 0), 0), 0
  );
  const nights = Math.round(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000
  );

  return (
    <div className="pub-page">
      {/* Hero */}
      <header className="pub-hero">
        <div className="pub-hero-content">
          <div className="pub-hero-badge">✈️ Public Itinerary</div>
          <h1 className="pub-hero-title">{trip.name}</h1>
          {trip.description && <p className="pub-hero-desc">{trip.description}</p>}

          <div className="pub-hero-meta">
            <div className="pub-meta-chip">
              <span className="pub-meta-icon">📅</span>
              <span>{new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</span>
            </div>
            <div className="pub-meta-chip">
              <span className="pub-meta-icon">🌙</span>
              <span>{nights} nights</span>
            </div>
            <div className="pub-meta-chip">
              <span className="pub-meta-icon">📍</span>
              <span>{stops.length} {stops.length === 1 ? "stop" : "stops"}</span>
            </div>
            {totalCost > 0 && (
              <div className="pub-meta-chip">
                <span className="pub-meta-icon">💰</span>
                <span>~{currency} {totalCost.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="pub-hero-stats">
            <span className="pub-stat">👁️ {pub.viewCount ?? 0} views</span>
            <span className="pub-stat">📋 {pub.cloneCount ?? 0} clones</span>
          </div>

          <button
            className="btn btn-primary pub-clone-btn"
            onClick={handleClone}
            disabled={cloneTrip.isPending}
          >
            {cloneTrip.isPending
              ? <><span className="spinner" /> Cloning…</>
              : "📋 Clone this itinerary"}
          </button>

          {/* Social sharing */}
          <div className="pub-share-row">
            <span className="pub-share-label">Share:</span>
            <button className="pub-share-btn pub-share-btn--copy" onClick={handleCopyLink}>
              {copied ? "✅ Copied!" : "🔗 Copy Link"}
            </button>
            <button className="pub-share-btn pub-share-btn--twitter" onClick={shareTwitter}>
              🐦 Twitter
            </button>
            <button className="pub-share-btn pub-share-btn--whatsapp" onClick={shareWhatsApp}>
              💬 WhatsApp
            </button>
          </div>
        </div>
        <div className="pub-hero-globe">🌍</div>
      </header>

      {/* Timeline */}
      <main className="pub-main">
        <div className="pub-timeline-header">
          <h2 className="pub-timeline-title">Itinerary</h2>
          <p className="pub-timeline-sub">{stops.length} cities · {nights} nights</p>
        </div>

        {stops.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📍</div>
            <h3 className="empty-state-title">No stops added</h3>
          </div>
        ) : (
          <div className="pub-stops">
            {stops.map((stop, i) => (
              <StopCard key={stop.id} stop={stop} index={i} currency={currency} />
            ))}
          </div>
        )}

        {/* CTA at the bottom */}
        <div className="pub-cta">
          <h3 className="pub-cta-title">Inspired? Build your own.</h3>
          <p className="pub-cta-desc">Clone this itinerary and customize it, or start fresh with Traveloop.</p>
          <div className="pub-cta-actions">
            <button className="btn btn-primary" onClick={handleClone} disabled={cloneTrip.isPending}>
              📋 Clone this trip
            </button>
            <Link to="/signup" className="btn btn-secondary">Create free account</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
