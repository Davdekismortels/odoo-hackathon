import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { packingApi } from "../lib/packing.api";
import { useTrip } from "../hooks/useTrips";

export function PackingChecklistPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: tripData } = useTrip(tripId!);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["packing", tripId],
    queryFn: () => packingApi.list(tripId!),
  });

  const [newItemName, setNewItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("clothing");

  const categories = ["clothing", "documents", "electronics", "toiletries", "medication", "misc"];

  const addItemMutation = useMutation({
    mutationFn: () => packingApi.add(tripId!, newItemName, selectedCategory),
    onSuccess: () => {
      setNewItemName("");
      queryClient.invalidateQueries({ queryKey: ["packing", tripId] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, isPacked }: { itemId: string; isPacked: boolean }) => packingApi.update(tripId!, itemId, isPacked),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["packing", tripId] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => packingApi.remove(tripId!, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["packing", tripId] }),
  });

  if (isLoading || !tripData) return <div className="loading-center"><span className="spinner" /></div>;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addItemMutation.mutate();
  };

  const packedCount = items.filter(i => i.isPacked).length;
  const progress = items.length > 0 ? (packedCount / items.length) * 100 : 0;

  return (
    <div className="fade-in form-page" style={{ maxWidth: "800px" }}>
      <nav className="breadcrumb" style={{ marginBottom: "var(--space-6)" }}>
        <Link to="/trips" className="breadcrumb-link">My Trips</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/trips/${tripId}`} className="breadcrumb-link">{tripData.trip.name}</Link>
        <span className="breadcrumb-sep">›</span>
        <span>Packing Checklist</span>
      </nav>

      <div className="form-card">
        <div className="form-card-header">
          <h1 className="form-card-title">🎒 Packing Checklist</h1>
          <p className="form-card-subtitle">Keep track of everything you need for {tripData.trip.name}.</p>
        </div>

        <div style={{ marginBottom: "var(--space-6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)", fontSize: "0.9rem", fontWeight: 600 }}>
            <span>Progress</span>
            <span>{packedCount} / {items.length} packed ({Math.round(progress)}%)</span>
          </div>
          <div className="budget-progress-bar" style={{ height: "8px" }}>
            <div className="budget-progress-fill" style={{ width: `${progress}%`, background: progress === 100 ? "var(--color-success)" : "var(--color-primary)" }} />
          </div>
        </div>

        <form onSubmit={handleAdd} className="field-row" style={{ alignItems: "flex-end", marginBottom: "var(--space-8)" }}>
          <div className="field" style={{ flex: 2 }}>
            <label className="field-label">Add new item</label>
            <input 
              className="field-input" 
              placeholder="e.g. Passport, Swimsuit..." 
              value={newItemName} 
              onChange={e => setNewItemName(e.target.value)} 
              required
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="field-label">Category</label>
            <select className="field-input field-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={addItemMutation.isPending || !newItemName.trim()}>
            {addItemMutation.isPending ? "Adding..." : "Add"}
          </button>
        </form>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {categories.map(category => {
            const catItems = items.filter(i => i.category === category);
            if (catItems.length === 0) return null;
            return (
              <div key={category}>
                <h3 style={{ textTransform: "capitalize", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-2)", marginBottom: "var(--space-3)", fontSize: "1.1rem" }}>
                  {category}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {catItems.map(item => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-2) var(--space-3)", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", cursor: "pointer", flex: 1 }}>
                        <input 
                          type="checkbox" 
                          checked={item.isPacked} 
                          onChange={(e) => updateItemMutation.mutate({ itemId: item.id, isPacked: e.target.checked })}
                          style={{ width: "1.2rem", height: "1.2rem", accentColor: "var(--color-primary)" }}
                        />
                        <span style={{ fontSize: "1rem", textDecoration: item.isPacked ? "line-through" : "none", color: item.isPacked ? "var(--color-text-faint)" : "var(--color-text)" }}>
                          {item.name}
                        </span>
                      </label>
                      <button className="btn-ghost-sm btn-danger" onClick={() => removeItemMutation.mutate(item.id)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {items.length === 0 && <p className="empty-state-desc" style={{ textAlign: "center" }}>Your checklist is empty. Add your first item above!</p>}
      </div>
    </div>
  );
}
