import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTrip, useAddStop } from "../hooks/useTrips";
import { api } from "../lib/api";
import toast from "react-hot-toast";

interface SeedCity { name: string; countryCode: string; interests: string[]; }
interface DraftStop { city: string; days: number; activities: SeedActivity[]; }
interface SeedActivity { name: string; category: string; durationMin: number; estimatedCost: number; }

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
  ],
  Tokyo: [
    { name: "Senso-ji Temple", category: "culture", durationMin: 90, estimatedCost: 0 },
    { name: "Shibuya Crossing", category: "sightseeing", durationMin: 60, estimatedCost: 0 },
    { name: "Tsukiji breakfast", category: "food", durationMin: 90, estimatedCost: 20 },
    { name: "Shinjuku Gyoen", category: "nature", durationMin: 120, estimatedCost: 5 },
    { name: "Akihabara tour", category: "shopping", durationMin: 120, estimatedCost: 0 },
    { name: "Izakaya night out", category: "nightlife", durationMin: 180, estimatedCost: 35 },
  ],
  Bali: [
    { name: "Ubud rice terraces", category: "nature", durationMin: 120, estimatedCost: 0 },
    { name: "Mount Batur hike", category: "adventure", durationMin: 300, estimatedCost: 35 },
    { name: "Tanah Lot temple", category: "sightseeing", durationMin: 90, estimatedCost: 5 },
    { name: "Seminyak sunset", category: "nature", durationMin: 120, estimatedCost: 0 },
    { name: "Balinese cooking", category: "food", durationMin: 180, estimatedCost: 30 },
  ],
  Jaipur: [
    { name: "Amber Fort tour", category: "sightseeing", durationMin: 180, estimatedCost: 8 },
    { name: "Hawa Mahal", category: "sightseeing", durationMin: 60, estimatedCost: 3 },
    { name: "Johari Bazaar", category: "shopping", durationMin: 120, estimatedCost: 0 },
    { name: "City Palace museum", category: "culture", durationMin: 120, estimatedCost: 10 },
    { name: "Dal baati dinner", category: "food", durationMin: 90, estimatedCost: 12 },
  ],
  Reykjavik: [
    { name: "Golden Circle tour", category: "sightseeing", durationMin: 480, estimatedCost: 80 },
    { name: "Northern Lights", category: "nature", durationMin: 240, estimatedCost: 60 },
    { name: "Blue Lagoon", category: "nature", durationMin: 240, estimatedCost: 70 },
    { name: "Whale watching", category: "adventure", durationMin: 180, estimatedCost: 65 },
    { name: "Reykjavik food walk", category: "food", durationMin: 120, estimatedCost: 35 },
  ],
};

const INTEREST_OPTIONS = ["sightseeing", "culture", "food", "adventure", "nature", "shopping", "nightlife"];

function scoreActivity(a: SeedActivity, interests: string[], budgetCap: number): number {
  const maxCost = budgetCap / 10 || 100;
  const interestMatch = interests.includes(a.category) ? 1 : 0;
  const normalizedCost = Math.min(a.estimatedCost / maxCost, 1);
  return 0.5 * interestMatch + 0.3 * (1 - normalizedCost) + 0.2 * (a.durationMin < 180 ? 1 : 0.5);
}

function generateItinerary(cities: string[], totalDays: number, interests: string[], budgetCap: number): DraftStop[] {
  if (cities.length === 0) return [];
  const daysPerCity = Math.max(1, Math.floor(totalDays / cities.length));
  const remainder = totalDays - daysPerCity * cities.length;

  return cities.map((city, i) => {
    const cityDays = daysPerCity + (i === 0 ? remainder : 0);
    const pool = (CITY_ACTIVITIES[city] ?? []).map((a) => ({ ...a, score: scoreActivity(a, interests, budgetCap) })).sort((a, b) => b.score - a.score);

    const maxMinutes = cityDays * 8 * 60;
    let usedMinutes = 0; let totalCost = 0;
    const picked: SeedActivity[] = [];

    for (const act of pool) {
      if (usedMinutes + act.durationMin > maxMinutes) continue;
      if (budgetCap && totalCost + act.estimatedCost > budgetCap * 0.8) continue;
      picked.push(act); usedMinutes += act.durationMin; totalCost += act.estimatedCost;
    }

    return { city, days: cityDays, activities: picked };
  });
}

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

  const toggleCity = (c: string) => setSelectedCities((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  const toggleInterest = (i: string) => setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const generate = () => {
    if (selectedCities.length === 0) { toast.error("Pick at least one city"); return; }
    if (interests.length === 0) { toast.error("Pick at least one interest"); return; }
    setDraft(generateItinerary(selectedCities, totalDays, interests, budgetCap));
    toast.success("Itinerary generated");
  };

  const applyToTrip = async () => {
    if (!draft || !tripData) return;
    setApplying(true);
    const trip = tripData.trip;
    const startDate = new Date(trip.startDate);
    let cursor = new Date(startDate);

    try {
      for (const stop of draft) {
        const searchRes = await api.get<{ success: boolean; data: { cities: Array<{ id: string; name: string }> } }>(`/explore/cities?q=${encodeURIComponent(stop.city)}&limit=1`);
        const cities = searchRes.data?.data?.cities ?? [];
        if (cities.length === 0) { toast.error(`City not found: ${stop.city}`); continue; }
        const cityId = cities[0].id;
        const arrival = cursor.toISOString().slice(0, 10);
        cursor.setDate(cursor.getDate() + stop.days);
        const departure = cursor.toISOString().slice(0, 10);
        await addStop.mutateAsync({ cityId, arrivalDate: arrival, departureDate: departure });
      }
      toast.success("Itinerary applied to trip!");
      navigate(`/trips/${id}/builder`);
    } catch { toast.error("Failed to apply itinerary"); }
    finally { setApplying(false); }
  };

  if (isLoading) return <div className="loading-center"><span className="spinner" /></div>;

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

      <div className="page-header" style={{
        background: `linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.6) 100%), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2000') center/cover`,
        padding: "var(--space-8) var(--space-6)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "inset 0 0 100px rgba(0,0,0,0.8)",
        marginBottom: "var(--space-6)"
      }}>
        <h1 className="page-title" style={{ fontSize: "2.5rem", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>Smart Itinerary Generator</h1>
        <p className="page-subtitle" style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)" }}>Rule-based, deterministic, fully offline generation.</p>
      </div>

      <div className="generator-layout" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "var(--space-6)" }}>
        <div className="generator-controls" style={{ background: "var(--color-bg-card)", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", alignSelf: "start" }}>
          <div className="gen-section" style={{ marginBottom: "var(--space-5)" }}>
            <label className="gen-label" style={{ display: "block", marginBottom: "var(--space-3)", fontWeight: 600 }}>Destinations</label>
            <div className="gen-chips" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
              {DEMO_CITIES.map((c) => (
                <button key={c.name} className={`packing-tab ${selectedCities.includes(c.name) ? "packing-tab--active" : ""}`} onClick={() => toggleCity(c.name)}>{c.name}</button>
              ))}
            </div>
          </div>

          <div className="gen-section" style={{ marginBottom: "var(--space-5)" }}>
            <label className="gen-label" style={{ display: "block", marginBottom: "var(--space-3)", fontWeight: 600 }}>Interests</label>
            <div className="gen-chips" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
              {INTEREST_OPTIONS.map((i) => (
                <button key={i} className={`packing-tab ${interests.includes(i) ? "packing-tab--active" : ""}`} onClick={() => toggleInterest(i)} style={{ textTransform: "capitalize" }}>{i}</button>
              ))}
            </div>
          </div>

          <div className="gen-row" style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
            <div className="gen-field" style={{ flex: 1 }}>
              <label className="field-label">Total Days</label>
              <input type="number" className="field-input" min={1} max={30} value={totalDays} onChange={(e) => setTotalDays(Math.max(1, Number(e.target.value)))} />
            </div>
            <div className="gen-field" style={{ flex: 1 }}>
              <label className="field-label">Budget Cap ($)</label>
              <input type="number" className="field-input" min={0} step={100} value={budgetCap} onChange={(e) => setBudgetCap(Number(e.target.value))} />
            </div>
          </div>

          <button className="btn btn-primary gen-btn" style={{ width: "100%" }} onClick={generate}>Generate Itinerary</button>
        </div>

        {draft && (
          <div className="generator-preview" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className="gen-preview-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-bg-elevated)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
              <h2 className="gen-preview-title" style={{ fontSize: "1.1rem", fontWeight: 700 }}>Generated Plan ({totalDays} days)</h2>
              <div className="gen-preview-meta" style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                Est. cost: <strong style={{ color: "var(--color-text)" }}>${estimatedBudget.toFixed(0)}</strong>
                {budgetCap && estimatedBudget > budgetCap && <span style={{ color: "var(--color-danger)", marginLeft: "0.5rem" }}>Over cap</span>}
              </div>
            </div>

            {draft.map((stop, si) => (
              <div key={si} className="gen-stop-card" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "var(--space-5)" }}>
                <div className="gen-stop-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                  <span className="gen-stop-city" style={{ fontWeight: 700, fontSize: "1.05rem" }}>{stop.city}</span>
                  <span className="gen-stop-days" style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{stop.days} days</span>
                </div>
                <div className="gen-activities" style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {stop.activities.length === 0 ? (
                    <p style={{ color: "var(--color-text-faint)", fontSize: "0.85rem" }}>No matching activities within budget</p>
                  ) : (
                    stop.activities.map((act, ai) => (
                      <div key={ai} className="gen-activity-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-2) 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span className="gen-activity-name" style={{ fontSize: "0.9rem" }}>{act.name}</span>
                        <div className="gen-activity-meta" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                          <span className="badge badge--gray" style={{ textTransform: "capitalize" }}>{act.category}</span>
                          <span style={{ color: "var(--color-text-faint)", fontSize: "0.78rem", width: "40px", textAlign: "right" }}>
                            {act.durationMin >= 60 ? `${Math.floor(act.durationMin / 60)}h${act.durationMin % 60 ? (act.durationMin % 60) + "m" : ""}` : `${act.durationMin}m`}
                          </span>
                          {act.estimatedCost > 0 && <span style={{ color: "var(--color-text)", fontSize: "0.8rem", fontWeight: 500, width: "35px", textAlign: "right" }}>${act.estimatedCost}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
            <button className="btn btn-primary" style={{ alignSelf: "flex-start", marginTop: "var(--space-2)" }} onClick={applyToTrip} disabled={applying}>
              {applying ? <><span className="spinner" /> Applying…</> : "Apply to Trip"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
