import type { BudgetSummary } from "../../lib/itinerary.api";

interface Props { summary: BudgetSummary; }

function ProgressBar({ value, max, danger }: { value: number; max: number; danger: boolean }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="budget-progress-bar">
      <div className={`budget-progress-fill ${danger ? "budget-progress--danger" : ""}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function BudgetPanel({ summary }: Props) {
  const { currencyCode, budgetLimit, grandTotal, remaining, isOverBudget, breakdown, stops } = summary;
  const fmt = (n: number) => `${currencyCode} ${Math.round(n).toLocaleString()}`;

  return (
    <aside className="budget-panel">
      <h2 className="budget-panel-title">Budget</h2>

      {/* Grand total */}
      <div className={`budget-total-card ${isOverBudget ? "budget-total--over" : ""}`}>
        <div>
          <p className="budget-total-label">Total spent</p>
          <p className="budget-total-value">{fmt(grandTotal)}</p>
        </div>
        {budgetLimit !== null && (
          <div className="budget-limit-block">
            <p className="budget-limit-label">of {fmt(budgetLimit)} limit</p>
            {remaining !== null && (
              <p className={`budget-remaining ${isOverBudget ? "text-danger" : "text-success"}`}>
                {isOverBudget ? `Over by ${fmt(Math.abs(remaining))}` : `${fmt(remaining)} remaining`}
              </p>
            )}
          </div>
        )}
      </div>

      {budgetLimit !== null && <ProgressBar value={grandTotal} max={budgetLimit} danger={isOverBudget} />}

      <div className="budget-categories">
        {(Object.entries(breakdown) as [string, number][]).map(([key, val]) => (
          <div key={key} className="budget-cat-row">
            <span className="budget-cat-label" style={{ textTransform: "capitalize" }}>{key}</span>
            <span className="budget-cat-value">{fmt(val)}</span>
          </div>
        ))}
      </div>

      {stops.length > 0 && (
        <details className="budget-stops-details">
          <summary className="budget-stops-summary">Per-stop breakdown</summary>
          <div className="budget-stops-list">
            {stops.map((s) => (
              <div key={s.stopId} className="budget-stop-row">
                <div className="budget-stop-header">
                  <span className="budget-stop-city">{s.city}</span>
                  <span className="budget-stop-nights">{s.nights}n</span>
                </div>
                <div className="budget-stop-costs">
                  {s.accommodation > 0 && <span>Stay: {fmt(s.accommodation)}</span>}
                  {s.transport > 0 && <span>Transit: {fmt(s.transport)}</span>}
                  {s.meals > 0 && <span>Food: {fmt(s.meals)}</span>}
                  {s.activities > 0 && <span>Activities: {fmt(s.activities)}</span>}
                </div>
                <p className="budget-stop-subtotal">Total: {fmt(s.subtotal)}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </aside>
  );
}
