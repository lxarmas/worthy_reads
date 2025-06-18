import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Nav.css';

function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState( false );
  const navigate = useNavigate();
  const userId = localStorage.getItem( 'userId' );

  const handleLogout = () => {
    localStorage.removeItem( 'userId' );
    navigate( '/login' );
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link to="/" className="logo-link">
          {/* Optional: Logo */}
        </Link>

        <button className="menu-toggle" onClick={() => setIsMenuOpen( !isMenuOpen )}>
          ☰
        </button>

        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={() => setIsMenuOpen( false )}>Home</Link></li>
          <li><Link to="/about" onClick={() => setIsMenuOpen( false )}>About</Link></li>

          {userId && (
            <li><Link to="/books" onClick={() => setIsMenuOpen( false )}>Books</Link></li>
          )}

          {userId ? (
            <li>
              <button onClick={() => { handleLogout(); setIsMenuOpen( false ); }}>
                Log Out
              </button>
            </li>
          ) : (
            <li>
              <Link to="/login" onClick={() => setIsMenuOpen( false )}>
                Log In
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Nav;
