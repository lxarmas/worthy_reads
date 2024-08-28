import React from 'react';
import { Link } from 'react-router-dom';
import './Nav.css'

function Nav() {
    return (
     <nav className="nav">
        <ul className='nav-links'>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/login">Log In</Link></li>
                <li><Link to="/books">Books</Link></li>

        </ul>
    </nav>
    )
}
export default Nav;