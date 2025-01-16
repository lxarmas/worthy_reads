import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';
import Nav from './Nav';
import './Books.css';


function LogIn() {
  const [email, setEmail] = useState( '' );
  const [password, setPassword] = useState( '' );
  const [error, setError] = useState( '' );
  const navigate = useNavigate();

  const handleSubmit = async ( event ) => {
    event.preventDefault();
    try {
      const response = await loginUser( { username: email, password } );
      console.log( 'Login successful:', response );
      // Store the user ID instead of token
      localStorage.setItem( 'userId', response.data.user_id );

      navigate( '/books' ); // Redirect to books page after successful login
    } catch ( error ) {
      console.error( 'Login error:', error.response ? error.response.data : error.message );
      // Update error message based on response
      const errorMessage = error.response ? error.response.data : 'Login failed. Please try again.';
      setError( errorMessage );
    }
  };

  return (
    <div className="container mt-5">
      <Nav />
      <h1 className="text-center">Log In</h1>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={( e ) => setEmail( e.target.value )}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={( e ) => setPassword( e.target.value )}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Login
                </button>
              </form>
              {error && <p className="text-danger mt-3">{error}</p>}
              <div className="text-center mt-3">
                <p>Don't have an account? <a href="/register">Register here</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogIn;
