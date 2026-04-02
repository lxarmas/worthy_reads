import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../api';
import './Nav.css';

function Nav({ user, setUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      setUser(null);
      setMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error.message || error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <button
        className={`wn__burger ${menuOpen ? 'wn__burger--open' : ''}`}
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Menu"
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      <div
        className={`wn__overlay ${menuOpen ? 'wn__overlay--in' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      <div className={`wn__panel ${menuOpen ? 'wn__panel--in' : ''}`}>
        <div className="wn__panel-head">
          <Link to="/" className="wn__wordmark" onClick={() => setMenuOpen(false)}>
            <span className="wn__w-thin">Worthy</span>
            <span className="wn__w-bold">Reads</span>
          </Link>

          <button
            className="wn__close"
            onClick={() => setMenuOpen(false)}
            type="button"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <ul className="wn__panel-links">
          {[
            { to: '/', label: 'Home' },
            { to: '/about', label: 'About' },
            ...(user ? [{ to: '/books', label: 'My Library' }] : []),
          ].map(({ to, label }, i) => (
            <li key={to} style={{ animationDelay: `${0.06 + i * 0.05}s` }}>
              <Link
                to={to}
                className={`wn__panel-link ${isActive(to) ? 'wn__panel-link--on' : ''}`}
              >
                <span>{label}</span>
                <span className="wn__panel-arr">→</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="wn__panel-foot">
          {user ? (
            <>
              <div className="wn__panel-user">
                Signed in as {user.username || user.email}
              </div>
              <button
                className="wn__panel-logout"
                onClick={handleLogout}
                type="button"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </>
          ) : (
            <Link to="/login" className="wn__panel-cta">
              Sign in to your library
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default Nav;