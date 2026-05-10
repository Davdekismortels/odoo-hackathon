import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTrip } from "../hooks/useTrips";
import {
  usePacking,
  useAddPackingItem,
  useTogglePackingItem,
  useRemovePackingItem,
  useResetPacking,
} from "../hooks/usePackingNotes";


const CATEGORIES = ["clothing", "documents", "electronics", "toiletries", "medication", "misc"] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_EMOJI: Record<Category, string> = {
  clothing: "👕",
  documents: "📄",
  electronics: "💻",
  toiletries: "🧴",
  medication: "💊",
  misc: "📦",
};

export function PackingPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const { data: tripData } = useTrip(tripId!);
  const { data, isLoading } = usePacking(tripId!);
  const addItem = useAddPackingItem(tripId!);
  const toggleItem = useTogglePackingItem(tripId!);
  const removeItem = useRemovePackingItem(tripId!);
  const resetPacking = useResetPacking(tripId!);
  const [showResetConfirm, setShowResetConfirm] = useState(false);


  const [form, setForm] = useState({ name: "", category: "misc" as Category, quantity: 1 });
  const [filter, setFilter] = useState<Category | "all">("all");

  const items = data?.items ?? [];
  const stats = data?.stats ?? { total: 0, packed: 0, percent: 0 };

  // Group by category
  const grouped = CATEGORIES.reduce<Record<string, typeof items>>((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat && (filter === "all" || filter === cat));
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addItem.mutate({ name: form.name.trim(), category: form.category, quantity: form.quantity });
    setForm({ name: "", category: "misc", quantity: 1 });
  };

  return (
    <div className="packing-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <nav className="breadcrumb">
            <Link to="/trips" className="breadcrumb-link">Trips</Link>
            <span className="breadcrumb-sep">›</span>
            <Link to={`/trips/${tripId}`} className="breadcrumb-link">{tripData?.trip.name ?? "Trip"}</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Packing List</span>
          </nav>
          <h1 className="page-title">🧳 Packing List</h1>
          <p className="page-subtitle">Check off items as you pack</p>
        </div>
        {items.length > 0 && (
          <div className="page-actions">
            {showResetConfirm ? (
              <>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => { resetPacking.mutate(); setShowResetConfirm(false); }}
                  disabled={resetPacking.isPending}
                >
                  {resetPacking.isPending ? <span className="spinner" /> : "Yes, reset all"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowResetConfirm(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => setShowResetConfirm(true)}>
                🔄 Reset Checklist
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="packing-progress-card">
        <div className="packing-progress-header">
          <span className="packing-progress-label">{stats.packed} / {stats.total} items packed</span>
          <span className="packing-progress-pct" style={{ color: stats.percent === 100 ? "var(--color-success)" : "var(--color-text-muted)" }}>
            {stats.percent}%
          </span>
        </div>
        <div className="budget-progress-bar" style={{ marginTop: "var(--space-2)" }}>
          <div
            className={`budget-progress-fill${stats.percent === 100 ? "" : ""}`}
            style={{ width: `${stats.percent}%`, background: stats.percent === 100 ? "var(--color-success)" : undefined }}
          />
        </div>
        {stats.percent === 100 && <p className="packing-complete-msg">✅ All packed! Have a great trip 🎉</p>}
      </div>

      {/* Add item form */}
      <form onSubmit={handleAdd} className="packing-add-form">
        <input
          className="field-input"
          placeholder="Item name (e.g. Passport)"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <select
          className="field-input field-select"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <input
          type="number"
          className="field-input packing-qty-input"
          min={1}
          max={99}
          value={form.quantity}
          onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
        />
        <button type="submit" className="btn btn-primary" disabled={addItem.isPending}>
          {addItem.isPending ? <span className="spinner" /> : "+ Add"}
        </button>
      </form>

      {/* Category filter tabs */}
      <div className="packing-filter-tabs">
        {(["all", ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            className={`packing-tab${filter === cat ? " packing-tab--active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat === "all" ? "All" : `${CATEGORY_EMOJI[cat]} ${cat}`}
          </button>
        ))}
      </div>

      {/* Items */}
      {isLoading ? (
        <div className="loading-center"><span className="spinner" style={{ width: "2rem", height: "2rem" }} /></div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧳</div>
          <h3 className="empty-state-title">Nothing packed yet</h3>
          <p className="empty-state-desc">Add items above to start your checklist.</p>
        </div>
      ) : (
        <div className="packing-groups">
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat} className="packing-group">
              <h3 className="packing-group-title">
                {CATEGORY_EMOJI[cat as Category]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                <span className="packing-group-count">{catItems.filter((i) => i.isPacked).length}/{catItems.length}</span>
              </h3>
              <ul className="packing-list">
                {catItems.map((item) => (
                  <li key={item.id} className={`packing-item${item.isPacked ? " packing-item--checked" : ""}`}>
                    <button
                      className="packing-checkbox"
                      onClick={() => toggleItem.mutate({ itemId: item.id, isPacked: !item.isPacked })}
                      aria-label={item.isPacked ? "Mark as unpacked" : "Mark as packed"}
                    >
                      {item.isPacked ? "✓" : ""}
                    </button>
                    <span className="packing-item-name">{item.name}</span>
                    {item.quantity > 1 && <span className="packing-item-qty">×{item.quantity}</span>}
                    <button
                      className="btn-ghost-sm btn-danger packing-item-delete"
                      onClick={() => removeItem.mutate(item.id)}
                      aria-label="Remove item"
                    >✕</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
