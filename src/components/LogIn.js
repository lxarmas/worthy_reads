import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api';

function LogIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      // ✅ send email + password (not username)
      const response = await loginUser({ email, password });
      console.log('Login successful:', response);

      // ✅ response.data.user.id from your backend
      const userId = response.data?.user?.id;
      if (userId) {
        localStorage.setItem('userId', userId);
      }

      navigate('/books');
    } catch (err) {
      console.error(
        'Login error:',
        err.response ? err.response.data : err.message
      );

      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Login failed. Please try again.';

      setError(errorMessage);
    }
  };

  return (
    <div className="login-container mt-5">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
      />

      <div className="text-center">
        <h1
          className="text-center display-4 fw-bold"
          style={{
            background: 'linear-gradient(to right, #2c7a6e, #3ba599)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'fadeInDown 1s ease-in-out',
          }}
        >
          <i className="bi bi-box-arrow-in-right me-2"></i>
          Welcome Back!
        </h1>
        <p className="login-subtitle">
          Log in to continue exploring your favorite books.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-3">
          <div
            className="card shadow-lg"
            style={{ borderRadius: '34px', border: 'none' }}
          >
            <div
              className="card-body p-5"
              style={{
                background:
                  'linear-gradient(135deg, rgb(170, 202, 197), rgb(110, 203, 192))',
                color: '#2c7a6e',
                borderRadius: '34px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-4">
                  <label htmlFor="email" style={{ fontWeight: 'bold' }}>
                    Email
                  </label>
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

                <div className="form-group mb-4">
                  <label htmlFor="password" style={{ fontWeight: 'bold' }}>
                    Password
                  </label>
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

                <button
                  type="submit"
                  className="btn btn-lg btn-block"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#2c7a6e',
                    fontWeight: 'bold',
                    borderRadius: '50px',
                    border: '2px solid #ffffff',
                  }}
                >
                  Login
                </button>
              </form>

              {error && (
                <p
                  className="text-danger mt-3"
                  style={{ fontWeight: 'bold' }}
                >
                  {error}
                </p>
              )}

              <div className="text-center mt-4">
                <p>
                  <Link
                    to="/forgot-password"
                    style={{
                      color: '#ffffff',
                      textDecoration: 'underline',
                      fontWeight: 'bold',
                    }}
                  >
                    Forgot Password?
                  </Link>
                </p>

                <p>
                  Don’t have an account?{' '}
                  <Link
                    to="/register"
                    style={{
                      color: '#ffffff',
                      textDecoration: 'underline',
                      fontWeight: 'bold',
                    }}
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogIn;
