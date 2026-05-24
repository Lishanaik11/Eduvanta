import React, { useState } from 'react';
// Import useLocation alongside useNavigate
import { useNavigate, useLocation } from 'react-router-dom';

const Signup = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect if the user came from a mobile layout interaction
  const showBackArrow = location.state?.fromMobile;
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const backendUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: String(formData.name).trim(),
          phone: String(formData.phone).trim(),
          email: String(formData.email).trim(),
          password: String(formData.password)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.clear();
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('user', JSON.stringify({ 
          name: data.user?.name || formData.name || 'Student User',
          email: data.user?.email || formData.email,
          phone: data.user?.phone || formData.phone
        }));
        
        alert("Authentication verified successfully!");
        navigate('/dashboard'); 
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert(`Cannot connect to backend server. Make sure it is running on ${backendUrl}`);
    }
  };

  return (
    <div 
      className="form-panel"
      style={{ 
        width: '100%',
        padding: '2.5rem 4rem', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        background: 'transparent',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        .animated-input {
          transition: all 0.2s ease-in-out !important;
        }
        .animated-input:focus {
          border-color: #3B592D !important;
          box-shadow: 0 0 0 4px rgba(59, 89, 45, 0.12) !important;
          outline: none !important;
          background: #ffffff !important;
        }
        .interactive-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .interactive-btn:hover {
          background-color: #2c4322 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(59, 89, 45, 0.25) !important;
        }
        .interactive-btn:active {
          transform: translateY(0px) !important;
        }
        @media (max-width: 900px) {
          .form-panel { padding: 1.5rem !important; }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: '340px', margin: '0 auto' }}>
        
        {/* CLEAN IN-LINE BACK ARROW ROW */}
        {showBackArrow && (
          <div style={{ width: '100%', marginBottom: '1.25rem', display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                background: '#3B592D',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.15rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(59, 89, 45, 0.3)',
                padding: 0
              }}
              aria-label="Go back to welcome page"
            >
              ←
            </button>
          </div>
        )}

        <h2 style={{ color: '#0f172a', fontSize: '1.65rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
          Create Account
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.75rem', fontWeight: '400', lineHeight: '1.4' }}>
          Get started by establishing your secure learning identity profile.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* FIELD MODULE: FULL NAME */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="animated-input"
              style={{ 
                width: '100%', 
                padding: '0.7rem 0.9rem', 
                borderRadius: '10px', 
                border: '1px solid #cbd5e1', 
                fontSize: '0.925rem',
                background: '#f8fafc',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* FIELD MODULE: PHONE NUMBER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>Phone number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="animated-input"
              style={{ 
                width: '100%', 
                padding: '0.7rem 0.9rem', 
                borderRadius: '10px', 
                border: '1px solid #cbd5e1', 
                fontSize: '0.925rem',
                background: '#f8fafc',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* FIELD MODULE: EMAIL ADDRESS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className="animated-input"
              style={{ 
                width: '100%', 
                padding: '0.7rem 0.9rem', 
                borderRadius: '10px', 
                border: '1px solid #cbd5e1', 
                fontSize: '0.925rem',
                background: '#f8fafc',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* FIELD MODULE: SECURE PASSWORD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ color: '#475569', fontSize: '0.85rem', fontWeight: '600' }}>Password</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password" 
                className="animated-input"
                style={{ 
                  width: '100%', 
                  padding: '0.7rem 0.9rem', 
                  paddingRight: '2.5rem',
                  borderRadius: '10px', 
                  border: '1px solid #cbd5e1', 
                  fontSize: '0.925rem',
                  background: '#f8fafc',
                  boxSizing: 'border-box'
                }}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          {/* FIELD MODULE: TERMS AND CONDITIONS */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '0.1rem' }}>
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              style={{ 
                marginTop: '0.15rem',
                accentColor: '#3B592D',
                cursor: 'pointer',
                width: '14px',
                height: '14px'
              }}
              required
            />
            <label htmlFor="agreeToTerms" style={{ color: '#64748b', fontSize: '0.825rem', lineHeight: '1.4', cursor: 'pointer', userSelect: 'none' }}>
              I agree to the <span style={{ textDecoration: 'underline', color: '#3B592D', fontWeight: '600' }}>terms & policy</span>
            </label>
          </div>

          {/* ACTION: PRIMARY SUBMIT */}
          <button 
            type="submit" 
            className="interactive-btn"
            style={{ 
              width: '100%', 
              padding: '0.8rem', 
              backgroundColor: '#3B592D', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '10px', 
              fontWeight: '600', 
              cursor: 'pointer',
              fontSize: '0.95rem',
              marginTop: '0.25rem'
            }}
          >
            Create Account
          </button>

          {/* ROUTE TOGGLE */}
          <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Already have an account?{' '}
            <span 
              onClick={onSwitchToLogin} 
              style={{ color: '#3B592D', fontWeight: '700', cursor: 'pointer', marginLeft: '3px' }}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;