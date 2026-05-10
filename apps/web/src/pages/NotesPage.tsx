import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTrip } from "../hooks/useTrips";
import { useNotes, useAddNote, useEditNote, useRemoveNote } from "../hooks/usePackingNotes";
import type { TripNote } from "../lib/packing-notes.api";

import { Pencil, X } from "lucide-react";

const EditIcon = () => <Pencil size={12} strokeWidth={2.5} />;
const XIcon = () => <X size={16} strokeWidth={2.5} />;

function NoteCard({ note, tripId, onEdit }: { note: TripNote; tripId: string; onEdit: (n: TripNote) => void }) {
  const remove = useRemoveNote(tripId);
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <div className="note-card">
      <div className="note-card-header">
        <h3 className="note-card-title">{note.title || "Untitled"}</h3>
        <div className="note-card-actions">
          <button className="btn-ghost-sm" onClick={() => onEdit(note)} title="Edit"><EditIcon /></button>
          <button className="btn-ghost-sm" onClick={() => remove.mutate(note.id)} disabled={remove.isPending} title="Delete">
            {remove.isPending ? <span className="spinner" style={{ width: "0.7rem", height: "0.7rem" }} /> : <XIcon />}
          </button>
        </div>
      </div>
      <div className="note-card-body">
        {note.body.split("\n").slice(0, 6).map((line, i) => (
          <p key={i} className="note-body-line">{line || "\u00a0"}</p>
        ))}
        {note.body.split("\n").length > 6 && <p className="note-body-line" style={{ color: "var(--color-text-faint)" }}>…</p>}
      </div>
      {note.createdAt && <p className="note-card-date">{fmt(note.createdAt)}</p>}
    </div>
  );
}

import { getTripHeaderStyle } from "../lib/images";

export function NotesPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const { data: tripData } = useTrip(tripId!);
  const { data: notes = [], isLoading } = useNotes(tripId!);
  const addNote = useAddNote(tripId!);
  const editNote = useEditNote(tripId!);

  const [editing, setEditing] = useState<TripNote | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });

  const openNew = () => { setEditing(null); setForm({ title: "", body: "" }); setShowForm(true); };
  const openEdit = (note: TripNote) => { setEditing(note); setForm({ title: note.title ?? "", body: note.body }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm({ title: "", body: "" }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.body.trim()) return;
    if (editing) {
      await editNote.mutateAsync({ noteId: editing.id, data: { title: form.title || undefined, body: form.body } });
    } else {
      await addNote.mutateAsync({ title: form.title || undefined, body: form.body });
    }
    closeForm();
  };

  const isPending = addNote.isPending || editNote.isPending;
  const trip = tripData?.trip;

  return (
    <div className="notes-page">
      <div className="page-header" style={{ ...(trip ? getTripHeaderStyle(trip.name, trip.id, trip.coverImageUrl) : {}), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <nav className="breadcrumb" style={{ marginBottom: "var(--space-4)" }}>
            <Link to="/trips" className="breadcrumb-link" style={{ color: "rgba(255,255,255,0.7)" }}>Trips</Link>
            <span className="breadcrumb-sep" style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
            <Link to={`/trips/${tripId}`} className="breadcrumb-link" style={{ color: "rgba(255,255,255,0.7)" }}>{trip?.name ?? "Trip"}</Link>
            <span className="breadcrumb-sep" style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
            <span style={{ color: "rgba(255,255,255,0.9)" }}>Notes</span>
          </nav>
          <h1 className="page-title" style={{ fontSize: "2.5rem", textShadow: "0 2px 20px rgba(0,0,0,0.9)", marginBottom: "var(--space-2)" }}>Trip Notes</h1>
          <p className="page-subtitle" style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.9)" }}>{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New note</button>
      </div>

      {/* Modal editor */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeForm()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? "Edit Note" : "New Note"}</h2>
              <button className="btn-ghost-sm modal-close" onClick={closeForm}><XIcon /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="field">
                <label className="field-label">Title <span style={{ color: "var(--color-text-faint)" }}>(optional)</span></label>
                <input className="field-input" placeholder="e.g. Hotel recommendations"
                  value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">Body</label>
                <textarea className="field-input field-textarea note-textarea"
                  placeholder="Write your note here…" required rows={10}
                  value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? <span className="spinner" /> : editing ? "Save changes" : "Create note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-center"><span className="spinner" style={{ width: "2rem", height: "2rem" }} /></div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-state-title">No notes yet</h3>
          <p className="empty-state-desc">Jot down ideas, reminders, hotel picks, or local tips for this trip.</p>
          <button className="btn btn-primary" onClick={openNew}>+ Create first note</button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => <NoteCard key={note.id} note={note} tripId={tripId!} onEdit={openEdit} />)}
        </div>
      )}
    </div>
  );
}
