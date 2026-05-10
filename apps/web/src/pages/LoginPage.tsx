import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

import { Eye, EyeOff, Globe } from "lucide-react";

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? <Eye size={16} strokeWidth={2} /> : <EyeOff size={16} strokeWidth={2} />;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";
  const { login, isLoading } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Email and password are required."); return; }
    setError(null);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? "Invalid email or password.";
      setError(msg);
    }
  };

  return (
    <div className="auth-page">
      {/* Form side */}
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <Globe size={22} className="auth-logo-icon" />
          <span className="auth-logo-text">Traveloop</span>
        </Link>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue planning your adventures</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="field">
            <label htmlFor="login-email" className="field-label">Email address</label>
            <input id="login-email" name="email" type="email" autoComplete="email" required
              className="field-input" placeholder="you@example.com"
              value={form.email} onChange={handleChange} />
          </div>

          <div className="field">
            <div className="field-label-row">
              <label htmlFor="login-password" className="field-label">Password</label>
            </div>
            <div className="field-input-wrap">
              <input id="login-password" name="password" type={showPw ? "text" : "password"}
                autoComplete="current-password" required className="field-input" placeholder="••••••••"
                value={form.password} onChange={handleChange} />
              <button type="button" className="field-eye-btn" onClick={() => setShowPw((v) => !v)} aria-label="Toggle password visibility">
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>

          {error && <div className="alert alert--error" role="alert">{error}</div>}

          <button type="submit" className="btn btn-primary btn--full" disabled={isLoading} style={{ marginTop: "0.5rem" }}>
            {isLoading ? <span className="spinner" /> : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="auth-link">Create one free</Link>
        </p>
      </div>

      {/* Visual side */}
      <div className="auth-visual" aria-hidden="true">
        <div className="auth-visual-inner">
          <div className="auth-quote">
            <p className="auth-quote-text">&ldquo;The world is a book, and those who do not travel read only one page.&rdquo;</p>
            <p className="auth-quote-author">— Saint Augustine</p>
          </div>
          <div className="auth-cities">
            {["Paris", "New York", "Tokyo", "Istanbul", "Rome", "Bali"].map((city) => (
              <span key={city} className="city-chip">{city}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
