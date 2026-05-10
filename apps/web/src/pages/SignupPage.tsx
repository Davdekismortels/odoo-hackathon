import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

interface FieldError { email?: string; password?: string; fullName?: string }

function validate(form: { email: string; password: string; fullName: string }): FieldError {
  const errors: FieldError = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required";
  if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = "Enter a valid email";
  if (form.password.length < 8) errors.password = "Password must be at least 8 characters";
  else if (!/[A-Z]/.test(form.password)) errors.password = "Include at least one uppercase letter";
  else if (!/[0-9]/.test(form.password)) errors.password = "Include at least one number";
  else if (!/[^A-Za-z0-9]/.test(form.password)) errors.password = "Include at least one special character (e.g. !@#$)";
  return errors;
}

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();

  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

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
      setPasswordStrength(s);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    try {
      await signup(form.email, form.password, form.fullName);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { error?: { message?: string; details?: { message: string }[] } } } })
        ?.response?.data?.error;
      const msg = errData?.details?.[0]?.message ?? errData?.message ?? "Could not create account, please try again";
      setServerError(msg);
    }
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthClass = ["", "strength--weak", "strength--fair", "strength--good", "strength--strong"][passwordStrength];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">✈</span>
          <span className="auth-logo-text">Traveloop</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start planning your perfect trips — free forever</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="field">
            <label htmlFor="fullName" className="field-label">Full name</label>
            <input
              id="fullName" name="fullName" type="text"
              autoComplete="name" className={`field-input ${fieldErrors.fullName ? "field-input--error" : ""}`}
              placeholder="Alex Rivera" value={form.fullName} onChange={handleChange}
            />
            {fieldErrors.fullName && <p className="field-error">{fieldErrors.fullName}</p>}
          </div>

          <div className="field">
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email" name="email" type="email"
              autoComplete="email" className={`field-input ${fieldErrors.email ? "field-input--error" : ""}`}
              placeholder="you@example.com" value={form.email} onChange={handleChange}
            />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password" name="password" type="password"
              autoComplete="new-password" className={`field-input ${fieldErrors.password ? "field-input--error" : ""}`}
              placeholder="Min. 8 chars · uppercase · number · special (!@#$)" value={form.password} onChange={handleChange}
            />
            {form.password && (
              <div className="strength-bar">
                <div className={`strength-fill ${strengthClass}`} style={{ width: `${passwordStrength * 25}%` }} />
                <span className={`strength-label ${strengthClass}`}>{strengthLabel}</span>
              </div>
            )}
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
          </div>

          {serverError && (
            <div className="alert alert--error" role="alert">{serverError}</div>
          )}

          <button type="submit" className="btn btn-primary btn--full" disabled={isLoading}>
            {isLoading ? <span className="spinner" /> : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>

      <div className="auth-visual" aria-hidden="true">
        <div className="auth-visual-inner">
          <div className="auth-steps">
            <h3 className="auth-steps-title">Plan smarter trips in 3 steps</h3>
            {[
              { icon: "🗺️", label: "Build your itinerary", desc: "Drag & drop stops, discover local activities" },
              { icon: "💰", label: "Track your budget", desc: "Real-time spend tracking across all stops" },
              { icon: "📤", label: "Share & inspire", desc: "Publish itineraries, clone from others" },
            ].map((step) => (
              <div key={step.label} className="auth-step">
                <span className="auth-step-icon">{step.icon}</span>
                <div>
                  <p className="auth-step-label">{step.label}</p>
                  <p className="auth-step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
