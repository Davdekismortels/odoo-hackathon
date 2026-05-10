import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { Stop } from "../../lib/trips.api";
import { useStopActivities, useAddActivity, useRemoveActivity } from "../../hooks/useItinerary";
import { exploreApi } from "../../lib/trips.api";

const XIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

interface ActivityRowProps {
  tripId: string; stopId: string; currencyCode: string;
  entry: { id: string; customCost?: number | null; activity: { name: string; category: string | null; durationMin: number | null; estimatedCost: number | null } | null; };
}

function ActivityRow({ tripId, stopId, entry, currencyCode }: ActivityRowProps) {
  const remove = useRemoveActivity(tripId, stopId);
  return (
    <div className="activity-row">
      <div className="activity-row-info">
        <span className="activity-category-dot" data-category={entry.activity?.category ?? "other"} />
        <span className="activity-name">{entry.activity?.name ?? "Unknown activity"}</span>
        {entry.activity?.durationMin && (
          <span className="activity-duration">{Math.round(entry.activity.durationMin / 60)}h</span>
        )}
      </div>
      <div className="activity-row-right">
        <span className="activity-cost">
          {currencyCode} {(entry.customCost ?? entry.activity?.estimatedCost ?? 0).toLocaleString()}
        </span>
        <button className="btn-ghost-sm btn-danger" onClick={() => remove.mutate(entry.id)} disabled={remove.isPending} aria-label="Remove activity" title="Remove activity">
          <XIcon />
        </button>
      </div>
    </div>
  );
}

interface Props { tripId: string; stop: Stop & { city: { name: string; countryCode: string | null } }; currencyCode: string; }

export function SortableStop({ tripId, stop, currencyCode }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id });
  const { data: activities = [] } = useStopActivities(tripId, stop.id);
  const addActivity = useAddActivity(tripId, stop.id);

  const [expanded, setExpanded] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [activitySearch, setActivitySearch] = useState("");
  const [cityActivities, setCityActivities] = useState<{ id: string; name: string; category: string; estimatedCost: number | null }[]>([]);

  const nights = Math.max(0, Math.round((new Date(stop.departureDate).getTime() - new Date(stop.arrivalDate).getTime()) / 86400000));

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 999 : undefined };

  const loadActivities = async () => {
    const result = await exploreApi.cities(stop.city.name);
    const city = result[0];
    if (city) {
      const acts = await fetch(`/api/v1/explore/cities/${city.id}/activities`).then((r) => r.json()).then((d) => d.data?.activities ?? []);
      setCityActivities(acts);
    }
  };

  const handleAddActivityOpen = () => { setShowAddActivity(true); loadActivities(); };
  const filtered = cityActivities.filter((a) => !activitySearch || a.name.toLowerCase().includes(activitySearch.toLowerCase()));

  return (
    <div ref={setNodeRef} style={style} className={`builder-stop ${isDragging ? "builder-stop--dragging" : ""}`}>
      <div className="builder-stop-header">
        <button className="drag-handle" {...attributes} {...listeners} aria-label="Drag to reorder" title="Drag to reorder">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
        </button>
        <div className="builder-stop-info">
          <h3 className="builder-stop-city">{stop.city.name}</h3>
          <span className="builder-stop-dates">
            {new Date(stop.arrivalDate).toLocaleDateString()} → {new Date(stop.departureDate).toLocaleDateString()}
            {nights > 0 && ` · ${nights}n`}
          </span>
        </div>
        <div className="builder-stop-actions">
          <span className="stop-activity-count">{activities.length} {activities.length === 1 ? "activity" : "activities"}</span>
          <button className="btn btn-secondary btn-sm" onClick={handleAddActivityOpen}>+ Add</button>
          <button className="expand-toggle" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded} title={expanded ? "Collapse" : "Expand"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="builder-stop-body">
          {activities.length === 0 ? (
            <p className="no-activities">No activities scheduled for this stop.</p>
          ) : (
            <div className="activities-list">
              {activities.map((entry) => <ActivityRow key={entry.id} tripId={tripId} stopId={stop.id} entry={entry} currencyCode={currencyCode} />)}
            </div>
          )}

          {showAddActivity && (
            <div className="add-activity-panel">
              <div className="add-activity-header">
                <h4 className="add-activity-title">Add activity in {stop.city.name}</h4>
                <button className="btn-ghost-sm" onClick={() => setShowAddActivity(false)}><XIcon /></button>
              </div>
              <input type="text" className="field-input" placeholder="Search activities…" value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)} />
              {filtered.length === 0 && <p className="field-hint">No activities found for this city.</p>}
              <ul className="activity-search-list">
                {filtered.map((act) => (
                  <li key={act.id} className="activity-search-item">
                    <div>
                      <span className="activity-name">{act.name}</span>
                      {act.category && <span className="activity-cat-badge">{act.category}</span>}
                    </div>
                    <div className="activity-search-right">
                      {act.estimatedCost !== null && <span className="activity-price">${act.estimatedCost}</span>}
                      <button className="btn btn-primary btn-sm" disabled={addActivity.isPending}
                        onClick={() => { addActivity.mutate({ activityId: act.id, cost: act.estimatedCost ?? undefined }); setShowAddActivity(false); }}>
                        Add
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
