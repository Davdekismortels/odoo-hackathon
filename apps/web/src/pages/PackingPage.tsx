import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTrip } from "../hooks/useTrips";
import { usePacking, useAddPackingItem, useTogglePackingItem, useRemovePackingItem, useResetPacking } from "../hooks/usePackingNotes";

import { Check, Trash } from "lucide-react";

const CATEGORIES = ["clothing", "documents", "electronics", "toiletries", "medication", "misc"] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_LABELS: Record<Category, string> = {
  clothing: "Clothing", documents: "Documents", electronics: "Electronics",
  toiletries: "Toiletries", medication: "Medication", misc: "Miscellaneous",
};

const CheckIcon = () => <Check size={10} strokeWidth={2.5} />;

import { getTripHeaderStyle } from "../lib/images";

export function PackingPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const { data: tripData } = useTrip(tripId!);
  const { data, isLoading } = usePacking(tripId!);
  const addItem = useAddPackingItem(tripId!);
  const toggleItem = useTogglePackingItem(tripId!);
  const removeItem = useRemovePackingItem(tripId!);
  const resetPacking = useResetPacking(tripId!);

  const [form, setForm] = useState({ name: "", category: "misc" as Category, quantity: 1 });
  const [filter, setFilter] = useState<Category | "all">("all");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const items = data?.items ?? [];
  const stats = data?.stats ?? { total: 0, packed: 0, percent: 0 };

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

  const trip = tripData?.trip;

  return (
    <div className="packing-page">
      {/* Header */}
      <div className="page-header" style={trip ? getTripHeaderStyle(trip.name, trip.id, trip.coverImageUrl) : {}}>
        <div>
          <nav className="breadcrumb" style={{ marginBottom: "var(--space-4)" }}>
            <Link to="/trips" className="breadcrumb-link" style={{ color: "rgba(255,255,255,0.7)" }}>Trips</Link>
            <span className="breadcrumb-sep" style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
            <Link to={`/trips/${tripId}`} className="breadcrumb-link" style={{ color: "rgba(255,255,255,0.7)" }}>{trip?.name ?? "Trip"}</Link>
            <span className="breadcrumb-sep" style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
            <span style={{ color: "rgba(255,255,255,0.9)" }}>Packing</span>
          </nav>
          <h1 className="page-title" style={{ fontSize: "2.5rem", textShadow: "0 2px 20px rgba(0,0,0,0.9)", marginBottom: "var(--space-2)" }}>Packing List</h1>
          <p className="page-subtitle" style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.9)" }}>Check off items as you pack</p>
        </div>
        {items.length > 0 && (
          <div className="page-actions" style={{ marginTop: "var(--space-4)" }}>
            {showResetConfirm ? (
              <>
                <button className="btn btn-danger btn-sm" 
                  onClick={() => { resetPacking.mutate(); setShowResetConfirm(false); }}
                  disabled={resetPacking.isPending}>
                  {resetPacking.isPending ? <span className="spinner" /> : "Confirm reset"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowResetConfirm(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn btn-secondary btn-sm" onClick={() => setShowResetConfirm(true)}>
                Reset all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="packing-progress-card">
        <div className="packing-progress-header">
          <span className="packing-progress-label">{stats.packed} of {stats.total} items packed</span>
          <span className="packing-progress-pct" style={{ color: stats.percent === 100 ? "var(--color-success)" : "var(--color-text-muted)" }}>
            {stats.percent}%
          </span>
        </div>
        <div className="budget-progress-bar">
          <div className="budget-progress-fill"
            style={{ width: `${stats.percent}%`, background: stats.percent === 100 ? "var(--color-success)" : undefined }} />
        </div>
        {stats.percent === 100 && <p className="packing-complete-msg">All packed — have a great trip!</p>}
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="packing-add-form">
        <input className="field-input" placeholder="Item name (e.g. Passport)"
          value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        <select className="field-input field-select" value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
        <input type="number" className="field-input packing-qty-input" min={1} max={99}
          value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
        <button type="submit" className="btn btn-primary" disabled={addItem.isPending}>
          {addItem.isPending ? <span className="spinner" /> : "+ Add item"}
        </button>
      </form>

      {/* Filter tabs */}
      <div className="packing-filter-tabs">
        {(["all", ...CATEGORIES] as const).map((cat) => (
          <button key={cat} className={`packing-tab${filter === cat ? " packing-tab--active" : ""}`}
            onClick={() => setFilter(cat)}>
            {cat === "all" ? "All" : CATEGORY_LABELS[cat as Category]}
          </button>
        ))}
      </div>

      {/* Items */}
      {isLoading ? (
        <div className="loading-center"><span className="spinner" style={{ width: "2rem", height: "2rem" }} /></div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-state-title">Nothing added yet</h3>
          <p className="empty-state-desc">Add items above to build your packing checklist.</p>
        </div>
      ) : (
        <div className="packing-groups">
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat} className="packing-group">
              <h3 className="packing-group-title">
                <span>{CATEGORY_LABELS[cat as Category]}</span>
                <span className="packing-group-count">{catItems.filter((i) => i.isPacked).length}/{catItems.length}</span>
              </h3>
              <ul className="packing-list">
                {catItems.map((item) => (
                  <li key={item.id} className={`packing-item${item.isPacked ? " packing-item--checked" : ""}`}>
                    <button className="packing-checkbox"
                      onClick={() => toggleItem.mutate({ itemId: item.id, isPacked: !item.isPacked })}
                      aria-label={item.isPacked ? "Mark unpacked" : "Mark packed"}>
                      {item.isPacked && <CheckIcon />}
                    </button>
                    <span className="packing-item-name">{item.name}</span>
                    {item.quantity > 1 && <span className="packing-item-qty">×{item.quantity}</span>}
                    <button className="packing-item-delete" onClick={() => removeItem.mutate(item.id)} aria-label="Remove">
                      <Trash size={12} strokeWidth={2.5} />
                    </button>
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
