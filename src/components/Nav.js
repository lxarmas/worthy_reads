import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Nav.css';

function Nav() {
  const navigate = useNavigate();
  const userId = localStorage.getItem( 'userId' ); // Check if the user is logged in

  const handleLogout = () => {
    localStorage.removeItem( 'userId' ); // Clear the user ID
    navigate( '/login' ); // Redirect to login page
  };

  return (
    <nav className='nav'>
      <ul className='nav-links'>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        {userId && (
          <li><Link to="/books">Books</Link></li>
        )}
        {userId ? (
          <li>
            <button onClick={handleLogout}>Log Out</button>
          </li>
        ) : (
          <li><Link to="/login">Log In</Link></li>
        )}
      </ul>
    </nav>
  );
}

export default Nav;
