import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { api } from "../lib/api";
import toast from "react-hot-toast";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
  { code: "hi", label: "हिन्दी" },
  { code: "zh", label: "中文" },
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
        fullName: fullName.trim() || undefined,
        language,
      });
      const updated = res.data.data.user;
      if (updated) setUser(updated);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete("/auth/account");
      toast.success("Account deleted. Goodbye 👋");
      await logout();
      navigate("/login");
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Unknown";

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">👤 Profile & Settings</h1>
          <p className="page-subtitle">Manage your account, preferences, and privacy</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Avatar + Info */}
        <div className="profile-card profile-card--avatar">
          <div className="profile-avatar-lg">
            {user.fullName?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="profile-name">{user.fullName ?? "Traveler"}</div>
          <div className="profile-email">{user.email}</div>
          <div className="profile-role">
            <span className={`badge ${user.role === "admin" ? "badge--purple" : "badge--blue"}`}>
              {user.role ?? "user"}
            </span>
          </div>
          <div className="profile-since">Member since {memberSince}</div>
        </div>

        {/* Edit form */}
        <div className="profile-card profile-card--form">
          <h2 className="profile-card-title">✏️ Edit Profile</h2>

          <div className="profile-field">
            <label className="field-label">Full Name</label>
            <input
              className="field-input"
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="profile-field">
            <label className="field-label">Email</label>
            <input
              className="field-input"
              type="email"
              value={user.email ?? ""}
              disabled
              style={{ opacity: 0.5 }}
            />
            <span className="profile-hint">Email cannot be changed</span>
          </div>

          <div className="profile-field">
            <label className="field-label">Language Preference</label>
            <select
              className="field-input"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary profile-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <><span className="spinner" /> Saving…</> : "💾 Save Changes"}
          </button>
        </div>

        {/* Account info */}
        <div className="profile-card profile-card--info">
          <h2 className="profile-card-title">📊 Account Info</h2>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-info-label">User ID</span>
              <code className="profile-info-value">{user.id?.slice(0, 12)}…</code>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Role</span>
              <span className="profile-info-value">{user.role ?? "user"}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Language</span>
              <span className="profile-info-value">
                {LANGUAGES.find((l) => l.code === (user.language ?? "en"))?.label ?? "English"}
              </span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Joined</span>
              <span className="profile-info-value">{memberSince}</span>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="profile-card profile-card--danger">
          <h2 className="profile-card-title">⚠️ Danger Zone</h2>
          <p className="profile-danger-desc">
            Deleting your account will permanently remove all your trips, packing lists, notes, and data.
            This action cannot be undone.
          </p>
          {showDeleteConfirm ? (
            <div className="profile-delete-confirm">
              <p><strong>Are you sure?</strong> This is permanent.</p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <><span className="spinner" /> Deleting…</> : "Yes, delete my account"}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              🗑️ Delete Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
