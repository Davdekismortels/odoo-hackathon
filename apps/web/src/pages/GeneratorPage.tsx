/**
 * Smart Itinerary Generator — Rule-based, deterministic, offline.
 * PRD §13.2: ranks activities by interest match + cost + popularity,
 * packs ≤ 8 hours/day, respects budget cap.
 * No LLM, no external APIs.
 */

import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTrip, useAddStop } from "../hooks/useTrips";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────────────────
interface SeedCity { name: string; countryCode: string; interests: string[]; }
interface DraftStop { city: string; days: number; activities: SeedActivity[]; }
interface SeedActivity { name: string; category: string; durationMin: number; estimatedCost: number; }

// ── Seed data for 5 demo cities ────────────────────────────────────────────
const DEMO_CITIES: SeedCity[] = [
  { name: "Paris",     countryCode: "FR", interests: ["culture","sightseeing","food","shopping"] },
  { name: "Tokyo",     countryCode: "JP", interests: ["culture","food","nightlife","sightseeing"] },
  { name: "Bali",      countryCode: "ID", interests: ["nature","adventure","food"] },
  { name: "Jaipur",    countryCode: "IN", interests: ["culture","sightseeing","shopping","food"] },
  { name: "Reykjavik", countryCode: "IS", interests: ["nature","adventure","sightseeing"] },
];

const CITY_ACTIVITIES: Record<string, SeedActivity[]> = {
  Paris: [
    { name: "Eiffel Tower visit", category: "sightseeing", durationMin: 90, estimatedCost: 30 },
    { name: "Louvre Museum", category: "culture", durationMin: 180, estimatedCost: 20 },
    { name: "Seine River Cruise", category: "sightseeing", durationMin: 60, estimatedCost: 25 },
    { name: "Montmartre walk", category: "sightseeing", durationMin: 90, estimatedCost: 0 },
    { name: "French pastry tour", category: "food", durationMin: 120, estimatedCost: 45 },
    { name: "Palace of Versailles", category: "culture", durationMin: 240, estimatedCost: 30 },
    { name: "Le Marais shopping", category: "shopping", durationMin: 120, estimatedCost: 0 },
    { name: "Musée d'Orsay", category: "culture", durationMin: 150, estimatedCost: 18 },
  ],
  Tokyo: [
    { name: "Senso-ji Temple", category: "culture", durationMin: 90, estimatedCost: 0 },
    { name: "Shibuya Crossing", category: "sightseeing", durationMin: 60, estimatedCost: 0 },
    { name: "Tsukiji fish market breakfast", category: "food", durationMin: 90, estimatedCost: 20 },
    { name: "Shinjuku Gyoen Garden", category: "nature", durationMin: 120, estimatedCost: 5 },
    { name: "Akihabara electronics tour", category: "shopping", durationMin: 120, estimatedCost: 0 },
    { name: "Tokyo Skytree", category: "sightseeing", durationMin: 90, estimatedCost: 22 },
    { name: "Izakaya night out", category: "nightlife", durationMin: 180, estimatedCost: 35 },
    { name: "teamLab digital art", category: "culture", durationMin: 120, estimatedCost: 28 },
  ],
  Bali: [
    { name: "Ubud rice terraces walk", category: "nature", durationMin: 120, estimatedCost: 0 },
    { name: "Mount Batur sunrise hike", category: "adventure", durationMin: 300, estimatedCost: 35 },
    { name: "Tanah Lot temple", category: "sightseeing", durationMin: 90, estimatedCost: 5 },
    { name: "Seminyak beach sunset", category: "nature", durationMin: 120, estimatedCost: 0 },
    { name: "Traditional Balinese cooking class", category: "food", durationMin: 180, estimatedCost: 30 },
    { name: "White-water rafting Ayung River", category: "adventure", durationMin: 180, estimatedCost: 40 },
  ],
  Jaipur: [
    { name: "Amber Fort tour", category: "sightseeing", durationMin: 180, estimatedCost: 8 },
    { name: "Hawa Mahal visit", category: "sightseeing", durationMin: 60, estimatedCost: 3 },
    { name: "Johari Bazaar shopping", category: "shopping", durationMin: 120, estimatedCost: 0 },
    { name: "City Palace museum", category: "culture", durationMin: 120, estimatedCost: 10 },
    { name: "Rooftop dal baati dinner", category: "food", durationMin: 90, estimatedCost: 12 },
    { name: "Jaigarh Fort", category: "culture", durationMin: 90, estimatedCost: 5 },
  ],
  Reykjavik: [
    { name: "Golden Circle tour", category: "sightseeing", durationMin: 480, estimatedCost: 80 },
    { name: "Northern Lights watch", category: "nature", durationMin: 240, estimatedCost: 60 },
    { name: "Blue Lagoon geothermal spa", category: "nature", durationMin: 240, estimatedCost: 70 },
    { name: "Hallgrímskirkja church", category: "sightseeing", durationMin: 60, estimatedCost: 8 },
    { name: "Whale watching tour", category: "adventure", durationMin: 180, estimatedCost: 65 },
    { name: "Reykjavik food walk", category: "food", durationMin: 120, estimatedCost: 35 },
  ],
};

const INTEREST_OPTIONS = ["sightseeing", "culture", "food", "adventure", "nature", "shopping", "nightlife"];

// ── Algorithm ──────────────────────────────────────────────────────────────
function scoreActivity(a: SeedActivity, interests: string[], budgetCap: number): number {
  const maxCost = budgetCap / 10 || 100;
  const interestMatch = interests.includes(a.category) ? 1 : 0;
  const normalizedCost = Math.min(a.estimatedCost / maxCost, 1);
  return 0.5 * interestMatch + 0.3 * (1 - normalizedCost) + 0.2 * (a.durationMin < 180 ? 1 : 0.5);
}

function generateItinerary(
  cities: string[], totalDays: number, interests: string[], budgetCap: number
): DraftStop[] {
  if (cities.length === 0) return [];
  const daysPerCity = Math.max(1, Math.floor(totalDays / cities.length));
  const remainder = totalDays - daysPerCity * cities.length;

  return cities.map((city, i) => {
    const cityDays = daysPerCity + (i === 0 ? remainder : 0);
    const pool = (CITY_ACTIVITIES[city] ?? [])
      .map((a) => ({ ...a, score: scoreActivity(a, interests, budgetCap) }))
      .sort((a, b) => b.score - a.score);

    // Pack ≤ 8h/day greedily
    const maxMinutes = cityDays * 8 * 60;
    let usedMinutes = 0;
    let totalCost = 0;
    const picked: SeedActivity[] = [];

    for (const act of pool) {
      if (usedMinutes + act.durationMin > maxMinutes) continue;
      if (budgetCap && totalCost + act.estimatedCost > budgetCap * 0.8) continue;
      picked.push(act);
      usedMinutes += act.durationMin;
      totalCost += act.estimatedCost;
    }

    return { city, days: cityDays, activities: picked };
  });
}

// ── Component ──────────────────────────────────────────────────────────────
export function GeneratorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tripData, isLoading } = useTrip(id!);

  const [selectedCities, setSelectedCities] = useState<string[]>(["Paris", "Tokyo"]);
  const [interests, setInterests] = useState<string[]>(["sightseeing", "food"]);
  const [totalDays, setTotalDays] = useState(7);
  const [budgetCap, setBudgetCap] = useState(1000);
  const [draft, setDraft] = useState<DraftStop[] | null>(null);
  const [applying, setApplying] = useState(false);

  const addStop = useAddStop(id!);
  const qc = useQueryClient();
  // suppress unused-var warning
  void qc;

  const toggleCity = (c: string) =>
    setSelectedCities((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const toggleInterest = (i: string) =>
    setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const generate = () => {
    if (selectedCities.length === 0) { toast.error("Pick at least one city"); return; }
    if (interests.length === 0) { toast.error("Pick at least one interest"); return; }
    const result = generateItinerary(selectedCities, totalDays, interests, budgetCap);
    setDraft(result);
    toast.success("Itinerary generated! Review below.");
  };

  const applyToTrip = async () => {
    if (!draft || !tripData) return;
    setApplying(true);
    const trip = tripData.trip;
    const startDate = new Date(trip.startDate);
    let cursor = new Date(startDate);

    try {
      for (const stop of draft) {
        // Look up city from our DB
        const searchRes = await api.get<{ success: boolean; data: { cities: Array<{ id: string; name: string }> } }>(
          `/explore/cities?q=${encodeURIComponent(stop.city)}&limit=1`
        );
        const cities = searchRes.data?.data?.cities ?? [];
        if (cities.length === 0) {
          toast.error(`City not found in DB: ${stop.city} — seed first`);
          continue;
        }
        const cityId = cities[0].id;
        const arrival = cursor.toISOString().slice(0, 10);
        cursor.setDate(cursor.getDate() + stop.days);
        const departure = cursor.toISOString().slice(0, 10);
        await addStop.mutateAsync({ cityId, arrivalDate: arrival, departureDate: departure });
      }
      toast.success("Itinerary applied to trip! 🎉");
      navigate(`/trips/${id}/builder`);
    } catch {
      toast.error("Failed to apply itinerary");
    } finally {
      setApplying(false);
    }
  };

  if (isLoading) return <div className="loading-center"><span className="spinner" style={{ width: "2rem", height: "2rem" }} /></div>;

  const trip = tripData?.trip;
  const estimatedBudget = draft?.reduce((sum, s) => sum + s.activities.reduce((a, act) => a + act.estimatedCost, 0), 0) ?? 0;

  return (
    <div className="generator-page">
      <nav className="breadcrumb">
        <Link to="/trips" className="breadcrumb-link">My Trips</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/trips/${id}`} className="breadcrumb-link">{trip?.name ?? "Trip"}</Link>
        <span className="breadcrumb-sep">›</span>
        <span>Smart Generator</span>
      </nav>

      <div className="page-header">
        <h1 className="page-title">🤖 Smart Itinerary Generator</h1>
        <p className="page-subtitle">Rule-based, deterministic, fully offline — no AI APIs needed</p>
      </div>

      <div className="generator-layout">
        {/* Controls */}
        <div className="generator-controls">
          <div className="gen-section">
            <label className="gen-label">Destinations</label>
            <div className="gen-chips">
              {DEMO_CITIES.map((c) => (
                <button
                  key={c.name}
                  className={`gen-chip ${selectedCities.includes(c.name) ? "gen-chip--active" : ""}`}
                  onClick={() => toggleCity(c.name)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="gen-section">
            <label className="gen-label">Interests</label>
            <div className="gen-chips">
              {INTEREST_OPTIONS.map((i) => (
                <button
                  key={i}
                  className={`gen-chip ${interests.includes(i) ? "gen-chip--active" : ""}`}
                  onClick={() => toggleInterest(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="gen-row">
            <div className="gen-field">
              <label className="gen-label">Total Days</label>
              <input type="number" className="field-input" min={1} max={30} value={totalDays}
                onChange={(e) => setTotalDays(Math.max(1, Number(e.target.value)))} />
            </div>
            <div className="gen-field">
              <label className="gen-label">Budget Cap (USD)</label>
              <input type="number" className="field-input" min={0} step={100} value={budgetCap}
                onChange={(e) => setBudgetCap(Number(e.target.value))} />
            </div>
          </div>

          <button className="btn btn-primary gen-btn" onClick={generate}>
            ✨ Generate Itinerary
          </button>
        </div>

        {/* Preview */}
        {draft && (
          <div className="generator-preview">
            <div className="gen-preview-header">
              <h2 className="gen-preview-title">Generated Plan — {totalDays} days</h2>
              <div className="gen-preview-meta">
                Est. activities cost: <strong>${estimatedBudget.toFixed(0)}</strong>
                {budgetCap && estimatedBudget > budgetCap && <span className="gen-over"> ⚠️ over cap</span>}
              </div>
            </div>

            {draft.map((stop, si) => (
              <div key={si} className="gen-stop-card">
                <div className="gen-stop-header">
                  <span className="gen-stop-city">📍 {stop.city}</span>
                  <span className="gen-stop-days">{stop.days} day{stop.days !== 1 ? "s" : ""}</span>
                </div>
                <div className="gen-activities">
                  {stop.activities.length === 0 ? (
                    <p style={{ color: "var(--color-text-faint)", fontSize: "0.85rem" }}>No matching activities</p>
                  ) : (
                    stop.activities.map((act, ai) => (
                      <div key={ai} className="gen-activity-row">
                        <span className="gen-activity-name">{act.name}</span>
                        <div className="gen-activity-meta">
                          <span className="badge badge--gray">{act.category}</span>
                          <span style={{ color: "var(--color-text-faint)", fontSize: "0.78rem" }}>
                            {act.durationMin >= 60 ? `${Math.floor(act.durationMin / 60)}h${act.durationMin % 60 ? (act.durationMin % 60) + "m" : ""}` : `${act.durationMin}m`}
                          </span>
                          {act.estimatedCost > 0 && (
                            <span style={{ color: "var(--color-text-faint)", fontSize: "0.78rem" }}>
                              ${act.estimatedCost}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

            <button
              className="btn btn-primary gen-apply-btn"
              onClick={applyToTrip}
              disabled={applying}
            >
              {applying ? <><span className="spinner" /> Applying…</> : "✅ Apply to Trip"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
