import React from 'react';
import './header.css';

function Header() {
  return (
    <div className="header-content">
      <div className="header">

        <p className="headerTitle">
          WORTHY READS
        </p>
        <img
          src="/images/logo.png"
          alt="Worthy Reads Logo"
          className="header-logo"
        />
      </div>
    </div>
  );
}

export default Header;
