import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";
  const { login, isLoading } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? "Invalid email or password";
      setError(msg);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">✈</span>
          <span className="auth-logo-text">Traveloop</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue planning your adventures</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="field">
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="field-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="field-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="alert alert--error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn--full" disabled={isLoading}>
            {isLoading ? <span className="spinner" /> : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="auth-link">Create one free</Link>
        </p>
      </div>

      {/* Right-side decorative panel */}
      <div className="auth-visual" aria-hidden="true">
        <div className="auth-visual-inner">
          <div className="auth-quote">
            <p className="auth-quote-text">"The world is a book, and those who do not travel read only one page."</p>
            <p className="auth-quote-author">— Saint Augustine</p>
          </div>
          <div className="auth-cities">
            {["🗼 Paris", "🗽 New York", "🏯 Tokyo", "🕌 Istanbul", "🏛 Rome"].map((city) => (
              <span key={city} className="city-chip">{city}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
