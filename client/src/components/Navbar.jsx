import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🎯</span>
          ResumeAI
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="navbar-toggle"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <div className="navbar-links">
                <Link
                  to="/dashboard"
                  className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                  id="nav-dashboard"
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/upload"
                  className={`navbar-link ${isActive('/upload') ? 'active' : ''}`}
                  id="nav-upload"
                >
                  📄 Upload
                </Link>
                <Link
                  to="/history"
                  className={`navbar-link ${isActive('/history') ? 'active' : ''}`}
                  id="nav-history"
                >
                  📋 History
                </Link>
              </div>
              <div className="navbar-auth">
                <div className="navbar-user">
                  <div className="navbar-user-avatar">
                    {getInitials(user?.name)}
                  </div>
                  <span className="navbar-user-name">{user?.name}</span>
                </div>
                <button
                  className="navbar-logout"
                  onClick={handleLogout}
                  id="nav-logout"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-secondary" id="nav-login">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" id="nav-register">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
