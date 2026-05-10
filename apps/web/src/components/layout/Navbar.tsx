import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useState } from "react";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar-logo">
          <span className="navbar-logo-icon">✈</span>
          <span className="navbar-logo-text">Traveloop</span>
        </Link>

        {/* Desktop nav */}
        {isAuthenticated ? (
          <div className="navbar-actions">
            <Link to="/trips" className="nav-link">My Trips</Link>
            <Link to="/explore" className="nav-link">Explore</Link>

            {/* Avatar menu */}
            <div className="avatar-menu">
              <button
                className="avatar-btn"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="User menu"
              >
                <span className="avatar-initials">
                  {user?.fullName?.charAt(0).toUpperCase() ?? "U"}
                </span>
              </button>

              {menuOpen && (
                <div className="avatar-dropdown">
                  <p className="avatar-name">{user?.fullName}</p>
                  <p className="avatar-email">{user?.email}</p>
                  <hr className="dropdown-divider" />
                  {user?.role === "admin" && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      ⚙️ Admin
                    </Link>
                  )}
                  <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    👤 Profile & Settings
                  </Link>
                  <button className="dropdown-item dropdown-item--danger" onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="navbar-actions">
            <Link to="/login" className="btn btn-ghost">Sign in</Link>
            <Link to="/signup" className="btn btn-primary">Get started</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
