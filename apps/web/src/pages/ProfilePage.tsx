import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { api } from "../lib/api";
import toast from "react-hot-toast";

const LANGUAGES = [
  { code: "en", label: "English" }, { code: "es", label: "Español" },
  { code: "fr", label: "Français" }, { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" }, { code: "hi", label: "हिन्दी" }, { code: "zh", label: "中文" },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [language, setLanguage] = useState(user?.language ?? "en");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch<{ success: true; data: { user: typeof user } }>("/auth/profile", {
        fullName: fullName.trim() || undefined, language,
      });
      if (res.data.data.user) setUser(res.data.data.user);
      toast.success("Profile updated");
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete("/auth/account");
      await logout();
      navigate("/login");
      toast.success("Account deleted");
    } catch { toast.error("Failed to delete account"); }
    finally { setDeleting(false); }
  };

  if (!user) return null;

  const initials = user.fullName?.charAt(0).toUpperCase() ?? "U";
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Unknown";

  return (
    <div className="profile-page">
      <div className="page-header" style={{
        background: `linear-gradient(to right, rgba(10,10,10,0.98) 0%, rgba(10,10,10,0.85) 40%, rgba(10,10,10,0.4) 100%), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=2000') center/cover`,
        padding: "var(--space-8) var(--space-6)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "inset 0 0 100px rgba(0,0,0,0.8)",
        marginBottom: "var(--space-6)"
      }}>
        <div>
          <h1 className="page-title" style={{ fontSize: "2.5rem", textShadow: "0 2px 10px rgba(0,0,0,0.5)", marginBottom: "var(--space-2)", color: "#fff" }}>Profile & Settings</h1>
          <p className="page-subtitle" style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)" }}>Manage your account and preferences</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Avatar card */}
        <div className="profile-card profile-card--avatar">
          <div className="profile-avatar-lg">{initials}</div>
          <div className="profile-name">{user.fullName ?? "Traveler"}</div>
          <div className="profile-email">{user.email}</div>
          <div className="profile-role">
            <span className={`badge ${user.role === "admin" ? "badge--purple" : "badge--blue"}`}>{user.role ?? "user"}</span>
          </div>
          <div className="profile-since">Member since {memberSince}</div>
        </div>

        {/* Edit form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div className="profile-card profile-card--form">
            <h2 className="profile-card-title">Edit Profile</h2>

            <div className="profile-field">
              <label className="field-label">Full name</label>
              <input className="field-input" type="text" placeholder="Your name"
                value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div className="profile-field">
              <label className="field-label">Email</label>
              <input className="field-input" type="email" value={user.email ?? ""} disabled style={{ opacity: 0.5 }} />
              <span className="profile-hint">Email address cannot be changed</span>
            </div>

            <div className="profile-field">
              <label className="field-label">Language preference</label>
              <select className="field-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>

            <button className="btn btn-primary profile-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner" /> Saving…</> : "Save changes"}
            </button>
          </div>

          {/* Account info */}
          <div className="profile-card profile-card--info">
            <h2 className="profile-card-title">Account Info</h2>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">User ID</span>
                <code className="profile-info-value" style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{user.id?.slice(0, 12)}…</code>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Role</span>
                <span className="profile-info-value">{user.role ?? "user"}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Language</span>
                <span className="profile-info-value">{LANGUAGES.find((l) => l.code === (user.language ?? "en"))?.label ?? "English"}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Member since</span>
                <span className="profile-info-value">{memberSince}</span>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="profile-card profile-card--danger">
            <h2 className="profile-card-title">Danger Zone</h2>
            <p className="profile-danger-desc">
              Permanently deletes your account, all trips, packing lists, and notes. This cannot be undone.
            </p>
            {showDeleteConfirm ? (
              <div className="profile-delete-confirm">
                <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>Are you absolutely sure? This is permanent.</p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                    {deleting ? <><span className="spinner" /> Deleting…</> : "Yes, delete my account"}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>Delete account</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
