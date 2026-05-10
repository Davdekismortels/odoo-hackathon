import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useState, useEffect, useRef } from "react";
import { Globe } from "lucide-react";

const NAV_LINKS = [
  { to: "/trips", label: "My Trips" },
  { to: "/explore", label: "Explore" },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close dropdown on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = async () => { await logout(); navigate("/login"); };
  const initials = user?.fullName?.charAt(0).toUpperCase() ?? "U";

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar-logo">
          <Globe size={24} className="navbar-logo-icon" />
          <span className="navbar-logo-text">Traveloop</span>
        </Link>

        {isAuthenticated ? (
          <div className="navbar-actions">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to}
                className={`nav-link${location.pathname.startsWith(link.to) ? " nav-link--active" : ""}`}>
                {link.label}
              </Link>
            ))}

            {/* Avatar dropdown */}
            <div className="avatar-menu" ref={menuRef}>
              <button className="avatar-btn" onClick={() => setMenuOpen((o) => !o)}
                aria-label="User menu" aria-expanded={menuOpen} aria-haspopup="true">
                <span className="avatar-initials">{initials}</span>
              </button>

              {menuOpen && (
                <div className="avatar-dropdown" role="menu">
                  <p className="avatar-name">{user?.fullName}</p>
                  <p className="avatar-email">{user?.email}</p>
                  <hr className="dropdown-divider" />
                  {user?.role === "admin" && (
                    <Link to="/admin" className="dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                      Admin panel
                    </Link>
                  )}
                  <Link to="/profile" className="dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                    Profile &amp; Settings
                  </Link>
                  <button className="dropdown-item dropdown-item--danger" role="menuitem" onClick={handleLogout}>
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
