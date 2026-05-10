import { useParams, Link } from "react-router-dom";
import { useTrip } from "../hooks/useTrips";
import { useBudget } from "../hooks/useItinerary";

const CATEGORY_ICONS: Record<string, string> = {
  accommodation: "🏨",
  transport: "🚆",
  meals: "🍽️",
  activities: "🎟️",
};

const CATEGORY_COLORS: Record<string, string> = {
  accommodation: "var(--color-primary)",
  transport: "var(--color-secondary)",
  meals: "var(--color-accent)",
  activities: "#f59e0b",
};

export function TripBudgetPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const { data: tripData, isLoading: isTripLoading } = useTrip(tripId!);
  const { data: budget, isLoading: isBudgetLoading } = useBudget(tripId!);

  if (isTripLoading || isBudgetLoading) {
    return <div className="loading-center"><span className="spinner" /></div>;
  }

  if (!tripData || !budget) return <div className="empty-state">Data not found</div>;

  const { currencyCode, grandTotal, breakdown, stops, budgetLimit, isOverBudget, remaining } = budget;
  const fmt = (n: number) => `${currencyCode} ${Math.round(n).toLocaleString()}`;

  // Calculate percentages for pie/bar chart
  const breakdownEntries = Object.entries(breakdown).filter(([_, val]) => val > 0);
  
  return (
    <div className="fade-in" style={{ maxWidth: "1000px", margin: "0 auto", padding: "var(--space-6)" }}>
      <nav className="breadcrumb" style={{ marginBottom: "var(--space-6)" }}>
        <Link to="/trips" className="breadcrumb-link">My Trips</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/trips/${tripId}`} className="breadcrumb-link">{tripData.trip.name}</Link>
        <span className="breadcrumb-sep">›</span>
        <span>Billing & Budget</span>
      </nav>

      <div className="builder-header" style={{ marginBottom: "var(--space-8)" }}>
        <h1 className="builder-title">💳 Billing & Budget Overview</h1>
        <p className="builder-subtitle">Track your estimated expenses and manage your trip budget.</p>
      </div>

      <div className="explore-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)", marginBottom: "var(--space-8)" }}>
        {/* Total Cost Card */}
        <div className="trip-card" style={{ padding: "var(--space-8)", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: isOverBudget ? "var(--color-danger)" : "var(--color-success)" }} />
          <h2 style={{ fontSize: "1.2rem", color: "var(--color-text-muted)", marginBottom: "var(--space-2)" }}>Total Estimated Cost</h2>
          <div style={{ fontSize: "4rem", fontWeight: 800, background: "linear-gradient(45deg, var(--color-primary), var(--color-accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "var(--space-4)" }}>
            {fmt(grandTotal)}
          </div>
          
          {budgetLimit !== null && (
            <div style={{ padding: "var(--space-4)", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-lg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                <span style={{ fontWeight: 600 }}>Budget Limit</span>
                <span style={{ fontWeight: 600 }}>{fmt(budgetLimit)}</span>
              </div>
              <div className="budget-progress-bar" style={{ height: "12px", marginBottom: "var(--space-3)" }}>
                <div 
                  className="budget-progress-fill" 
                  style={{ width: `${Math.min(100, (grandTotal / budgetLimit) * 100)}%`, background: isOverBudget ? "var(--color-danger)" : "var(--color-primary)" }} 
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Status</span>
                <span style={{ fontWeight: 700, color: isOverBudget ? "var(--color-danger)" : "var(--color-success)" }}>
                  {isOverBudget ? `⚠️ Over by ${fmt(Math.abs(remaining!))}` : `✅ ${fmt(remaining!)} remaining`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Cost Breakdown Visual */}
        <div className="trip-card" style={{ padding: "var(--space-8)", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)" }}>
          <h2 style={{ fontSize: "1.2rem", color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>Category Breakdown</h2>
          
          {/* Stacked Bar Chart */}
          <div style={{ display: "flex", height: "30px", borderRadius: "var(--radius-full)", overflow: "hidden", marginBottom: "var(--space-8)" }}>
            {breakdownEntries.map(([key, val]) => (
              <div 
                key={key} 
                style={{ 
                  width: `${(val / grandTotal) * 100}%`, 
                  background: CATEGORY_COLORS[key] || "gray",
                  transition: "width 1s ease"
                }} 
                title={`${key}: ${fmt(val)}`}
              />
            ))}
            {grandTotal === 0 && <div style={{ width: "100%", background: "var(--color-border)" }} />}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {breakdownEntries.map(([key, val]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "4px", background: CATEGORY_COLORS[key] || "gray" }} />
                  <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{CATEGORY_ICONS[key]} {key}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{Math.round((val / grandTotal) * 100)}%</span>
                  <span style={{ fontWeight: 700 }}>{fmt(val)}</span>
                </div>
              </div>
            ))}
            {grandTotal === 0 && <div className="empty-state-desc" style={{ textAlign: "center" }}>No costs added yet.</div>}
          </div>
        </div>
      </div>

      {/* Per Stop Billing Details */}
      <h2 style={{ fontSize: "1.5rem", marginBottom: "var(--space-6)", fontWeight: 700 }}>🧾 Billing Details by Stop</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {stops.map(stop => (
          <div key={stop.stopId} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--color-border)", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "var(--space-2)" }}>{stop.city}</h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{stop.nights} nights</p>
            </div>
            <div style={{ display: "flex", gap: "var(--space-6)", flexWrap: "wrap", justifyContent: "flex-end", flex: 1, padding: "0 var(--space-8)" }}>
              {stop.accommodation > 0 && <div style={{ textAlign: "center" }}><div style={{ fontSize: "0.8rem", color: "var(--color-text-faint)", textTransform: "uppercase" }}>Stay</div><div style={{ fontWeight: 600 }}>{fmt(stop.accommodation)}</div></div>}
              {stop.transport > 0 && <div style={{ textAlign: "center" }}><div style={{ fontSize: "0.8rem", color: "var(--color-text-faint)", textTransform: "uppercase" }}>Transport</div><div style={{ fontWeight: 600 }}>{fmt(stop.transport)}</div></div>}
              {stop.meals > 0 && <div style={{ textAlign: "center" }}><div style={{ fontSize: "0.8rem", color: "var(--color-text-faint)", textTransform: "uppercase" }}>Meals</div><div style={{ fontWeight: 600 }}>{fmt(stop.meals)}</div></div>}
              {stop.activities > 0 && <div style={{ textAlign: "center" }}><div style={{ fontSize: "0.8rem", color: "var(--color-text-faint)", textTransform: "uppercase" }}>Activities</div><div style={{ fontWeight: 600 }}>{fmt(stop.activities)}</div></div>}
            </div>
            <div style={{ textAlign: "right", minWidth: "120px", borderLeft: "1px solid var(--color-border)", paddingLeft: "var(--space-6)" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "var(--space-1)" }}>Subtotal</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-text)" }}>{fmt(stop.subtotal)}</div>
            </div>
          </div>
        ))}
        {stops.length === 0 && <div className="empty-state">No stops added to itinerary yet.</div>}
      </div>
    </div>
  );
}
