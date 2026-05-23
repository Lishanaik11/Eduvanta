import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onSwitchToSignup }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // State to toggle password text masking visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear previous user session
        localStorage.clear();

        // SAVE COMPLETE USER OBJECT
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: data.user?.id,
            name: data.user?.name || 'Student User',
            email: data.user?.email || '',
            phone: data.user?.phone || 'Not Provided'
          })
        );

        // Optional extra direct key
        localStorage.setItem('userId', data.user?.id);

        alert(`Welcome back, ${data.user?.name || 'Student'}!`);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert(`Cannot connect to backend server. Make sure it is running on ${backendUrl}`);
    }
  };

  return (
    <div className="signup-card">
      <h2 className="form-title">Welcome Back</h2>
      
      <form onSubmit={handleSubmit}>
        {/* FIELD: EMAIL */}
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="form-input"
            required
          />
        </div>

        {/* FIELD: PASSWORD WITH EYE ICON */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password" 
              className="form-input"
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                /* Hidden Eye SVG Layout */
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
              ) : (
                /* Open Eye SVG Layout */
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Login
        </button>

        <p className="switch-text" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
          Don't have an account?{' '}
          <span 
            onClick={onSwitchToSignup} 
            style={{ color: '#3B592D', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Signup
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;