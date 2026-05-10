import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { useTrip } from "../hooks/useTrips";
import { useBudget, useReorderStops } from "../hooks/useItinerary";
import { SortableStop } from "../components/builder/SortableStop";
import { BudgetPanel } from "../components/builder/BudgetPanel";
import type { Stop } from "../lib/trips.api";


export function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useTrip(id!);
  const { data: budget } = useBudget(id!);
  const reorder = useReorderStops(id!);

  const [localStops, setLocalStops] = useState<Stop[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize localStops from server data once
  if (data && !initialized) {
    setLocalStops([...data.stops].sort((a, b) => a.orderIndex - b.orderIndex));
    setInitialized(true);
  }
  // Sync if server data changes
  if (data && initialized && data.stops.length !== localStops.length) {
    setLocalStops([...data.stops].sort((a, b) => a.orderIndex - b.orderIndex));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalStops((prev) => {
      const oldIdx = prev.findIndex((s) => s.id === active.id);
      const newIdx = prev.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(prev, oldIdx, newIdx);
      reorder.mutate(reordered.map((s) => s.id));
      return reordered;
    });
  }, [reorder]);

  if (isLoading) return <div className="loading-center"><span className="spinner" style={{ width: "2rem", height: "2rem" }} /></div>;
  if (isError || !data) return (
    <div className="empty-state">
      <p className="empty-state-title">Trip not found</p>
      <Link to="/trips" className="btn btn-primary">Back to trips</Link>
    </div>
  );

  const { trip } = data;

  return (
    <div className="builder-page">
      {/* Header */}
      <div className="builder-header">
        <nav className="breadcrumb">
          <Link to="/trips" className="breadcrumb-link">Trips</Link>
          <span className="breadcrumb-sep">›</span>
          <Link to={`/trips/${id}`} className="breadcrumb-link">{trip.name}</Link>
          <span className="breadcrumb-sep">›</span>
          <span>Builder</span>
        </nav>
        <div className="builder-title-row">
          <h1 className="builder-title">✈️ Itinerary Builder</h1>
          <p className="builder-subtitle">Drag stops to reorder · Click to expand and add activities</p>
        </div>
      </div>

      <div className="builder-layout">
        {/* Stops column */}
        <section className="builder-stops-col">
          {localStops.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📍</div>
              <h3 className="empty-state-title">No stops yet</h3>
              <p className="empty-state-desc">Add stops from the trip detail page first.</p>
              <Link to={`/trips/${id}`} className="btn btn-primary">← Trip detail</Link>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localStops.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="builder-stops-list">
                  {localStops.map((stop) => (
                    <SortableStop
                      key={stop.id}
                      tripId={id!}
                      stop={stop}
                      currencyCode={trip.currencyCode}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </section>

        {/* Budget sidebar */}
        {budget && <BudgetPanel summary={budget} />}
      </div>
    </div>
  );
}
