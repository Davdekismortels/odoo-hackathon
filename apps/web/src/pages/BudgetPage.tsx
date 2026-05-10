import { useParams, Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useBudget, useUpdateStop } from "../hooks/useItinerary";
import { useTrip } from "../hooks/useTrips";
import { useState } from "react";
import toast from "react-hot-toast";

import { Pencil, MapPin } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = { accommodation: "#6366f1", transport: "#f59e0b", meals: "#10b981", activities: "#3b82f6" };

const EditIcon = () => <Pencil size={12} strokeWidth={2.5} />;
const PinIcon = () => <MapPin size={14} strokeWidth={2.5} />;

function formatCurrency(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function StopCostEditor({ stop, currency, tripId }: { stop: any; currency: string; tripId: string; }) {
  const updateStop = useUpdateStop(tripId);
  const [accomPerNight, setAccomPerNight] = useState(stop.nights > 0 ? Math.round(stop.accommodation / stop.nights) : stop.accommodation);
  const [transport, setTransport] = useState(stop.transport);
  const [mealPerDay, setMealPerDay] = useState(stop.nights > 0 ? Math.round(stop.meals / stop.nights) : stop.meals);
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    try {
      await updateStop.mutateAsync({ stopId: stop.stopId, data: { accommodationCost: accomPerNight, transportCost: transport, mealCostPerDay: mealPerDay } });
      toast.success(`${stop.city} costs updated`);
      setEditing(false);
    } catch { toast.error("Failed to update costs"); }
  };

  if (!editing) {
    return (
      <div className="stop-cost-row">
        <span className="stop-cost-city"><PinIcon /> {stop.city}</span>
        <span className="stop-cost-nights">{stop.nights}n</span>
        <span className="stop-cost-val">{formatCurrency(stop.accommodation, currency)}</span>
        <span className="stop-cost-val">{formatCurrency(stop.transport, currency)}</span>
        <span className="stop-cost-val">{formatCurrency(stop.meals, currency)}</span>
        <span className="stop-cost-val">{formatCurrency(stop.activities, currency)}</span>
        <span className="stop-cost-total">{formatCurrency(stop.subtotal, currency)}</span>
        <button className="btn-ghost-sm" onClick={() => setEditing(true)} title="Edit"><EditIcon /></button>
      </div>
    );
  }

  return (
    <div className="stop-cost-row stop-cost-row--editing">
      <span className="stop-cost-city"><PinIcon /> {stop.city} ({stop.nights}n)</span>
      <div className="stop-cost-inputs">
        <label className="stop-cost-field">
          <span>Stay/night</span>
          <input type="number" className="field-input field-input--sm" value={accomPerNight} min={0} onChange={(e) => setAccomPerNight(Number(e.target.value))} />
        </label>
        <label className="stop-cost-field">
          <span>Transport</span>
          <input type="number" className="field-input field-input--sm" value={transport} min={0} onChange={(e) => setTransport(Number(e.target.value))} />
        </label>
        <label className="stop-cost-field">
          <span>Meals/day</span>
          <input type="number" className="field-input field-input--sm" value={mealPerDay} min={0} onChange={(e) => setMealPerDay(Number(e.target.value))} />
        </label>
      </div>
      <div className="stop-cost-actions">
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={updateStop.isPending}>
          {updateStop.isPending ? <span className="spinner" /> : "Save"}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </div>
  );
}

import { getTripHeaderStyle } from "../lib/images";

export function BudgetPage() {
  const { id } = useParams<{ id: string }>();
  const { data: budget, isLoading, isError } = useBudget(id!);
  const { data: tripData } = useTrip(id!);

  if (isLoading) return <div className="loading-center"><span className="spinner" style={{ width: "2rem", height: "2rem" }} /></div>;
  if (isError || !budget) return (
    <div className="empty-state">
      <h3 className="empty-state-title">Could not load budget</h3>
      <Link to={`/trips/${id}`} className="btn btn-primary">Back to trip</Link>
    </div>
  );

  const currency = budget.currencyCode ?? "USD";
  const pct = budget.budgetLimit ? Math.min(100, (budget.grandTotal / budget.budgetLimit) * 100) : null;
  const trip = tripData?.trip;

  const pieData = Object.entries(budget.breakdown).filter(([, v]) => v > 0).map(([key, value]) => ({ name: key, value }));
  const barData = budget.stops.map((s) => ({
    name: s.city, Accommodation: Math.round(s.accommodation), Transport: Math.round(s.transport),
    Meals: Math.round(s.meals), Activities: Math.round(s.activities),
  }));

  return (
    <div className="budget-page">
      <nav className="breadcrumb">
        <Link to="/trips" className="breadcrumb-link">My Trips</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/trips/${id}`} className="breadcrumb-link">{trip?.name ?? "Trip"}</Link>
        <span className="breadcrumb-sep">›</span>
        <span>Budget</span>
      </nav>

      <div className="page-header" style={trip ? getTripHeaderStyle(trip.name, trip.id, trip.coverImageUrl) : {}}>
        <h1 className="page-title" style={{ fontSize: "2.5rem", textShadow: "0 2px 20px rgba(0,0,0,0.9)", marginBottom: "var(--space-2)" }}>Budget Breakdown</h1>
        <p className="page-subtitle" style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.9)" }}>{trip?.name}</p>
      </div>

      <div className="budget-hero-row">
        <div className="budget-hero-card">
          <div className="budget-hero-label">Total Spend</div>
          <div className={`budget-hero-value ${budget.isOverBudget ? "budget-hero-value--over" : ""}`}>
            {formatCurrency(budget.grandTotal, currency)}
          </div>
          {budget.budgetLimit && <div className="budget-hero-limit">Limit: {formatCurrency(budget.budgetLimit, currency)}</div>}
        </div>

        {budget.remaining !== null && (
          <div className={`budget-hero-card ${budget.isOverBudget ? "budget-hero-card--danger" : "budget-hero-card--success"}`}>
            <div className="budget-hero-label">{budget.isOverBudget ? "Over Budget" : "Remaining"}</div>
            <div className="budget-hero-value">{formatCurrency(Math.abs(budget.remaining), currency)}</div>
            {pct !== null && (
              <div className="budget-progress-bar">
                <div className={`budget-progress-fill ${budget.isOverBudget ? "budget-progress-fill--over" : ""}`} style={{ width: `${pct}%` }} />
              </div>
            )}
            {pct !== null && <div className="budget-pct">{pct.toFixed(1)}% of budget used</div>}
          </div>
        )}

        <div className="budget-categories">
          {Object.entries(budget.breakdown).map(([cat, val]) => (
            <div key={cat} className="budget-cat-chip" style={{ borderColor: CATEGORY_COLORS[cat] + "66" }}>
              <div>
                <div className="budget-cat-name" style={{ textTransform: "capitalize" }}>{cat}</div>
                <div className="budget-cat-val" style={{ color: CATEGORY_COLORS[cat] }}>{formatCurrency(val, currency)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {budget.grandTotal > 0 && (
        <div className="budget-charts-row">
          <div className="budget-chart-card">
            <h2 className="budget-chart-title">By Category</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? "#6b7280"} />)}
                </Pie>
                <RechartsTooltip formatter={(val) => formatCurrency(Number(val ?? 0), currency)} contentStyle={{ background: "#000", border: "1px solid #333", borderRadius: 4 }} />
                <Legend iconType="circle" formatter={(v) => <span style={{ textTransform: "capitalize" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {barData.length > 0 && (
            <div className="budget-chart-card budget-chart-card--wide">
              <h2 className="budget-chart-title">By Stop</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ background: "#000", border: "1px solid #333", borderRadius: 4 }} formatter={(val) => formatCurrency(Number(val ?? 0), currency)} />
                  <Legend iconType="circle" />
                  <Bar dataKey="Accommodation" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Transport" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Meals" stackId="a" fill="#10b981" />
                  <Bar dataKey="Activities" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <div className="budget-stops-section">
        <h2 className="budget-section-title">
          Stop Breakdown
          <span className="budget-section-hint">Click edit icon to adjust costs</span>
        </h2>
        {budget.stops.length === 0 ? (
          <div className="empty-state">
            <h3 className="empty-state-title">No stops yet</h3>
            <p className="empty-state-desc">Add stops to your trip to see the cost breakdown.</p>
            <Link to={`/trips/${id}`} className="btn btn-primary">Add stops</Link>
          </div>
        ) : (
          <div className="stop-costs-table">
            <div className="stop-cost-head">
              <span>City</span>
              <span>Nights</span>
              <span>Stay</span>
              <span>Transport</span>
              <span>Meals</span>
              <span>Activities</span>
              <span>Subtotal</span>
              <span></span>
            </div>
            {budget.stops.map((stop) => <StopCostEditor key={stop.stopId} stop={stop} currency={currency} tripId={id!} />)}
            <div className="stop-cost-footer">
              <span className="stop-cost-footer-label">Grand Total</span>
              <span className="stop-cost-footer-total">{formatCurrency(budget.grandTotal, currency)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
