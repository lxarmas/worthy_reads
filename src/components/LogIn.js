import React, { useState } from 'react';
import { loginUser } from '../api';

function LogIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const handleSubmit = async (event) => {
  event.preventDefault();
  try {
    const response = await loginUser({ username: email, password }); // Use 'username' if that's what the server expects
    console.log('Login successful:', response);
    localStorage.setItem('token', response.data.token); // Ensure token is correctly returned by server
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
    setError('Login failed. Please try again.');
  }
};


  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          className="form-control"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Login
      </button>
      {error && <p className="text-danger">{error}</p>}
    </form>
  );
}

export default LogIn;
