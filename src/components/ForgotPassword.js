import React, { useState } from 'react';
import { sendResetEmail } from '../api'; // you'll add this to api.js

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await sendResetEmail({ email });
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError('Failed to send reset link. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="forgot-password-container text-center mt-5">
      <h2 className="fw-bold mb-3" style={{ color: '#2c7a6e' }}>
        Forgot Your Password?
      </h2>
      <p>Enter your email and we’ll send you a link to reset your password.</p>
      <form onSubmit={handleSubmit} className="d-inline-block" style={{ width: '300px' }}>
        <input
          type="email"
          className="form-control mb-3"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="btn btn-success w-100" type="submit">
          Send Reset Link
        </button>
      </form>

      {message && <p className="text-success mt-3">{message}</p>}
      {error && <p className="text-danger mt-3">{error}</p>}
    </div>
  );
}

export default ForgotPassword;
