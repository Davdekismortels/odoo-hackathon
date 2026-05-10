import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe, Map, Wallet, Share2 } from "lucide-react";
import { useAuthStore } from "../store/auth.store";

interface FieldError { email?: string; password?: string; fullName?: string }

function validateForm(form: { email: string; password: string; fullName: string }): FieldError {
  const errors: FieldError = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required";
  if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = "Enter a valid email";
  if (form.password.length < 8) errors.password = "At least 8 characters required";
  else if (!/[A-Z]/.test(form.password)) errors.password = "Include at least one uppercase letter";
  else if (!/[0-9]/.test(form.password)) errors.password = "Include at least one number";
  else if (!/[^A-Za-z0-9]/.test(form.password)) errors.password = "Include a special character (!@#$)";
  return errors;
}

const STEPS = [
  { icon: <Map size={24} />, label: "Build your itinerary", desc: "Drag & drop stops, discover local activities" },
  { icon: <Wallet size={24} />, label: "Track your budget", desc: "Real-time spend tracking across every stop" },
  { icon: <Share2 size={24} />, label: "Share & inspire", desc: "Publish itineraries publicly, clone from others" },
];

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();

  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [pwStrength, setPwStrength] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: undefined }));
    setServerError(null);
    if (name === "password") {
      let s = 0;
      if (value.length >= 8) s++;
      if (/[A-Z]/.test(value)) s++;
      if (/[0-9]/.test(value)) s++;
      if (/[^A-Za-z0-9]/.test(value)) s++;
      setPwStrength(s);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    try {
      await signup(form.email, form.password, form.fullName);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { error?: { message?: string; details?: { message: string }[] } } } })
        ?.response?.data?.error;
      setServerError(errData?.details?.[0]?.message ?? errData?.message ?? "Could not create account. Please try again.");
    }
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  const strengthClass = ["", "strength--weak", "strength--fair", "strength--good", "strength--strong"][pwStrength];

  return (
    <div className="auth-page">
      {/* Form side */}
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <Globe size={22} className="auth-logo-icon" />
          <span className="auth-logo-text">Traveloop</span>
        </Link>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Free forever. No credit card required.</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="field">
            <label htmlFor="signup-name" className="field-label">Full name</label>
            <input id="signup-name" name="fullName" type="text" autoComplete="name"
              className={`field-input ${fieldErrors.fullName ? "field-input--error" : ""}`}
              placeholder="Alex Rivera" value={form.fullName} onChange={handleChange} />
            {fieldErrors.fullName && <p className="field-error">{fieldErrors.fullName}</p>}
          </div>

          <div className="field">
            <label htmlFor="signup-email" className="field-label">Email address</label>
            <input id="signup-email" name="email" type="email" autoComplete="email"
              className={`field-input ${fieldErrors.email ? "field-input--error" : ""}`}
              placeholder="you@example.com" value={form.email} onChange={handleChange} />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="signup-password" className="field-label">Password</label>
            <input id="signup-password" name="password" type="password" autoComplete="new-password"
              className={`field-input ${fieldErrors.password ? "field-input--error" : ""}`}
              placeholder="Min. 8 chars, uppercase, number, symbol" value={form.password} onChange={handleChange} />
            {form.password && (
              <div className="strength-bar">
                <div className={`strength-fill ${strengthClass}`} style={{ width: `${pwStrength * 25}%`, flexGrow: 0 }} />
                <div style={{ flex: 1, height: 4, background: "var(--color-border)", borderRadius: 99 }} />
                {strengthLabel && <span className={`strength-label ${strengthClass}`}>{strengthLabel}</span>}
              </div>
            )}
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
          </div>

          {serverError && <div className="alert alert--error" role="alert">{serverError}</div>}

          <button type="submit" className="btn btn-primary btn--full" disabled={isLoading} style={{ marginTop: "0.5rem" }}>
            {isLoading ? <span className="spinner" /> : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>

      {/* Visual side */}
      <div className="auth-visual" aria-hidden="true">
        <div className="auth-visual-inner">
          <h3 className="auth-steps-title">Plan smarter trips in 3 steps</h3>
          {STEPS.map((step) => (
            <div key={step.label} className="auth-step">
              <span className="auth-step-icon" style={{ color: "var(--color-primary)" }}>{step.icon}</span>
              <div>
                <p className="auth-step-label">{step.label}</p>
                <p className="auth-step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
