import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTrip } from "../hooks/useTrips";
import { useNotes, useAddNote, useEditNote, useRemoveNote } from "../hooks/usePackingNotes";
import type { TripNote } from "../lib/packing-notes.api";

function NoteCard({
  note,
  tripId,
  onEdit,
}: {
  note: TripNote;
  tripId: string;
  onEdit: (note: TripNote) => void;
}) {
  const remove = useRemoveNote(tripId);
  return (
    <div className="note-card">
      <div className="note-card-header">
        <h3 className="note-card-title">{note.title || "Untitled note"}</h3>
        <div className="note-card-actions">
          <button className="btn-ghost-sm" onClick={() => onEdit(note)}>✏️ Edit</button>
          <button
            className="btn-ghost-sm btn-danger"
            onClick={() => remove.mutate(note.id)}
            disabled={remove.isPending}
          >✕</button>
        </div>
      </div>
      <div className="note-card-body">
        {/* Simple markdown-like rendering: split on newlines */}
        {note.body.split("\n").map((line, i) => (
          <p key={i} className="note-body-line">{line || "\u00a0"}</p>
        ))}
      </div>
      {note.createdAt && (
        <p className="note-card-date">{new Date(note.createdAt).toLocaleDateString()}</p>
      )}
    </div>
  );
}

export function NotesPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const { data: tripData } = useTrip(tripId!);
  const { data: notes = [], isLoading } = useNotes(tripId!);
  const addNote = useAddNote(tripId!);
  const editNote = useEditNote(tripId!);

  const [editing, setEditing] = useState<TripNote | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", body: "" });
    setShowForm(true);
  };

  const openEdit = (note: TripNote) => {
    setEditing(note);
    setForm({ title: note.title ?? "", body: note.body });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.body.trim()) return;
    if (editing) {
      await editNote.mutateAsync({ noteId: editing.id, data: { title: form.title || undefined, body: form.body } });
    } else {
      await addNote.mutateAsync({ title: form.title || undefined, body: form.body });
    }
    setShowForm(false);
    setForm({ title: "", body: "" });
    setEditing(null);
  };

  return (
    <div className="notes-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <nav className="breadcrumb">
            <Link to="/trips" className="breadcrumb-link">Trips</Link>
            <span className="breadcrumb-sep">›</span>
            <Link to={`/trips/${tripId}`} className="breadcrumb-link">{tripData?.trip.name ?? "Trip"}</Link>
            <span className="breadcrumb-sep">›</span>
            <span>Notes</span>
          </nav>
          <h1 className="page-title">📝 Trip Notes</h1>
          <p className="page-subtitle">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Note</button>
      </div>

      {/* Editor form */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? "Edit Note" : "New Note"}</h2>
              <button className="modal-close btn-ghost-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="field">
                <label className="field-label">Title (optional)</label>
                <input
                  className="field-input"
                  placeholder="e.g. Hotel recommendations"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="field">
                <label className="field-label">Body</label>
                <textarea
                  className="field-input field-textarea note-textarea"
                  placeholder="Write your note here..."
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  required
                  rows={10}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addNote.isPending || editNote.isPending}>
                  {addNote.isPending || editNote.isPending ? <span className="spinner" /> : editing ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes grid */}
      {isLoading ? (
        <div className="loading-center"><span className="spinner" style={{ width: "2rem", height: "2rem" }} /></div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3 className="empty-state-title">No notes yet</h3>
          <p className="empty-state-desc">Create your first note to jot down ideas, reminders, or tips.</p>
          <button className="btn btn-primary" onClick={openNew}>+ New Note</button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} tripId={tripId!} onEdit={openEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
