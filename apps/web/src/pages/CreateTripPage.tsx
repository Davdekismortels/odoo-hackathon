import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCreateTrip } from "../hooks/useTrips";
import { getTripHeaderStyle } from "../lib/images";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR", "AUD", "CAD", "SGD", "AED"];

export function CreateTripPage() {
  const navigate = useNavigate();
  const createTrip = useCreateTrip();

  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: today,
    endDate: nextWeek,
    budgetLimit: "",
    currencyCode: "USD",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((fe) => ({ ...fe, [name]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Trip name is required";
    if (!form.startDate) e.startDate = "Start date required";
    if (!form.endDate) e.endDate = "End date required";
    if (form.startDate && form.endDate && form.startDate > form.endDate) e.endDate = "End date must be after start date";
    if (form.budgetLimit && isNaN(Number(form.budgetLimit))) e.budgetLimit = "Must be a number";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      const trip = await createTrip.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        budgetLimit: form.budgetLimit ? Number(form.budgetLimit) : undefined,
        currencyCode: form.currencyCode,
      });
      navigate(`/trips/${trip.id}`);
    } catch {
      setErrors({ submit: "Failed to create trip. Please try again." });
    }
  };

  const nights = form.startDate && form.endDate
    ? Math.max(0, Math.round((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000))
    : 0;

  return (
    <div className="form-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/trips" className="breadcrumb-link">My Trips</Link>
        <span className="breadcrumb-sep">›</span>
        <span>New Trip</span>
      </nav>

      <div className="form-card">
        <div className="form-card-header" style={{
          ...getTripHeaderStyle("Create Trip", "new_trip", null),
          padding: "var(--space-8) var(--space-6)",
          margin: "-var(--space-6) -var(--space-6) var(--space-6) -var(--space-6)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
        }}>
          <h1 className="form-card-title" style={{ fontSize: "2.2rem", textShadow: "0 2px 10px rgba(0,0,0,0.5)", marginBottom: "var(--space-2)", color: "#fff" }}>Plan a new trip ✈️</h1>
          <p className="form-card-subtitle" style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.8)" }}>Fill in the basics — you can add stops and activities after.</p>
        </div>

        <form onSubmit={handleSubmit} className="trip-form">
          {/* Name */}
          <div className="field">
            <label htmlFor="name" className="field-label">Trip name *</label>
            <input id="name" name="name" type="text" className={`field-input ${errors.name ? "field-input--error" : ""}`}
              placeholder="e.g. Summer in Japan 🌸" value={form.name} onChange={handleChange} />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="field">
            <label htmlFor="description" className="field-label">Description <span className="field-optional">(optional)</span></label>
            <textarea id="description" name="description" className="field-input field-textarea"
              placeholder="What's this trip about?" rows={3} value={form.description} onChange={handleChange} />
          </div>

          {/* Dates */}
          <div className="field-row">
            <div className="field">
              <label htmlFor="startDate" className="field-label">Start date *</label>
              <input id="startDate" name="startDate" type="date" className={`field-input ${errors.startDate ? "field-input--error" : ""}`}
                value={form.startDate} onChange={handleChange} />
              {errors.startDate && <p className="field-error">{errors.startDate}</p>}
            </div>
            <div className="field">
              <label htmlFor="endDate" className="field-label">End date *</label>
              <input id="endDate" name="endDate" type="date" className={`field-input ${errors.endDate ? "field-input--error" : ""}`}
                value={form.endDate} onChange={handleChange} min={form.startDate} />
              {errors.endDate && <p className="field-error">{errors.endDate}</p>}
            </div>
          </div>

          {nights > 0 && (
            <p className="field-hint">📅 {nights} night{nights !== 1 ? "s" : ""}</p>
          )}

          {/* Budget */}
          <div className="field-row">
            <div className="field" style={{ flex: 2 }}>
              <label htmlFor="budgetLimit" className="field-label">Total budget <span className="field-optional">(optional)</span></label>
              <input id="budgetLimit" name="budgetLimit" type="number" min="0" step="1"
                className={`field-input ${errors.budgetLimit ? "field-input--error" : ""}`}
                placeholder="e.g. 3000" value={form.budgetLimit} onChange={handleChange} />
              {errors.budgetLimit && <p className="field-error">{errors.budgetLimit}</p>}
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="currencyCode" className="field-label">Currency</label>
              <select id="currencyCode" name="currencyCode" className="field-input field-select" value={form.currencyCode} onChange={handleChange}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {errors.submit && <div className="alert alert--error">{errors.submit}</div>}

          <div className="form-actions">
            <Link to="/trips" className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={createTrip.isPending}>
              {createTrip.isPending ? <><span className="spinner" /> Creating…</> : "Create trip →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
