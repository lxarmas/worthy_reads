import React, { useState } from 'react';
import { registerUser } from '../api'; // Ensure the correct path to api.js

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    try {
      const response = await registerUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.email,
        password: formData.password,
      });
      console.log('Registration successful:', response.data);
      // Redirect or show success message here
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Register</h1>

      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  style={{
                    backgroundColor: 'rgb(44, 122, 110)',
                    borderColor: 'rgb(44, 122, 110)',
                  }}
                >
                  Register
                </button>
              </form>
              {error && <p className="text-danger mt-3">{error}</p>}
              <div className="text-center mt-3">
                <p>Already have an account? <a href="/login">Login here</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;