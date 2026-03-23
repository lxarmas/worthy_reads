import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Nav.css';

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Floating hamburger button — always visible */}
      <button
        className={`wn__burger ${menuOpen ? 'wn__burger--open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Menu"
      >
        <span /><span /><span />
      </button>

      {/* Dark overlay */}
      <div
        className={`wn__overlay ${menuOpen ? 'wn__overlay--in' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Side panel */}
      <div className={`wn__panel ${menuOpen ? 'wn__panel--in' : ''}`}>
        <div className="wn__panel-head">
          <Link to="/" className="wn__wordmark" onClick={() => setMenuOpen(false)}>
            <span className="wn__w-thin">Worthy</span>
            <span className="wn__w-bold">Reads</span>
          </Link>
          <button className="wn__close" onClick={() => setMenuOpen(false)}>✕</button>
        </div>

        <ul className="wn__panel-links">
          {[
            { to: '/', label: 'Home' },
            { to: '/about', label: 'About' },
            ...(userId ? [{ to: '/books', label: 'My Library' }] : []),
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
          {userId ? (
            <button className="wn__panel-logout" onClick={handleLogout}>Sign out</button>
          ) : (
            <Link to="/login" className="wn__panel-cta">Sign in to your library</Link>
          )}
        </div>
      </div>
    </>
  );
}

export default Nav;
