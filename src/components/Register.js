import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const linkStyle = { color: '#ffffff', textDecoration: 'underline', fontWeight: 'bold' };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await registerUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      console.log('Registration successful:', response.data);
      localStorage.setItem('userId', response.data.user_id);
      setShowSuccess(true);
      setTimeout(() => { navigate('/books'); }, 2500);
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">

      {isLoading && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'linear-gradient(135deg, rgb(170,202,197), rgb(110,203,192))', borderRadius: '24px', padding: '2.5rem 3rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', minWidth: '260px' }}>
            <div className="spinner-border" role="status" style={{ color: '#2c7a6e', width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ marginTop: '1.2rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#2c7a6e', marginBottom: 0 }}>Creating your account...</p>
            <p style={{ color: '#2c7a6e', fontSize: '0.9rem', marginBottom: 0 }}>Please wait a moment</p>
          </div>
        </div>
      )}

      {showSuccess && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'linear-gradient(135deg, rgb(170,202,197), rgb(110,203,192))', borderRadius: '24px', padding: '2.5rem 3rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', minWidth: '280px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem', boxShadow: '0 4px 12px rgba(44,122,110,0.3)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" style={{ width: '42px', height: '42px' }}>
                <circle cx="26" cy="26" r="25" fill="none" stroke="#2c7a6e" strokeWidth="2" />
                <path fill="none" stroke="#2c7a6e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" d="M14 27l8 8 16-16" />
              </svg>
            </div>
            <p style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#2c7a6e', marginBottom: '0.4rem' }}>You are registered!</p>
            <p style={{ color: '#2c7a6e', fontSize: '0.95rem', marginBottom: 0 }}>Redirecting you to your books...</p>
          </div>
        </div>
      )}

      <h1 className="text-center display-4 fw-bold" style={{ background: 'linear-gradient(to right, #2c7a6e, #3ba599)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Create an Account
      </h1>

      <div className="row justify-content-center mt-4">
        <div className="col-md-6">
          <div className="card shadow-lg" style={{ borderRadius: '34px', border: 'none' }}>
            <div className="card-body p-5" style={{ background: 'linear-gradient(135deg, rgb(170,202,197), rgb(110,203,192))', color: '#2c7a6e', borderRadius: '34px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="firstName" style={{ fontWeight: 'bold' }}>First Name</label>
                  <input type="text" className="form-control" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter your first name" required disabled={isLoading || showSuccess} />
                </div>

                <div className="form-group mt-3">
                  <label htmlFor="lastName" style={{ fontWeight: 'bold' }}>Last Name</label>
                  <input type="text" className="form-control" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter your last name" required disabled={isLoading || showSuccess} />
                </div>

                <div className="form-group mt-3">
                  <label htmlFor="email" style={{ fontWeight: 'bold' }}>Email</label>
                  <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required disabled={isLoading || showSuccess} />
                </div>

                <div className="form-group mt-3">
                  <label htmlFor="password" style={{ fontWeight: 'bold' }}>Password</label>
                  <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required disabled={isLoading || showSuccess} />
                </div>

                <button type="submit" className="btn btn-lg btn-block mt-4" disabled={isLoading || showSuccess} style={{ backgroundColor: '#ffffff', color: '#2c7a6e', fontWeight: 'bold', borderRadius: '50px', border: '2px solid #ffffff', opacity: isLoading || showSuccess ? 0.7 : 1 }}>
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
              </form>

              {error && (
                <p className="text-danger mt-3" style={{ fontWeight: 'bold' }}>{error}</p>
              )}

              <div className="text-center mt-4">
                <span style={{ color: '#2c7a6e', fontWeight: 'bold' }}>Already have an account? </span>
                <a href="/login" style={linkStyle}>Login here</a>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Register;