import React, { useState } from 'react';

const AdminLogin = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false); // State to handle eye toggle masking status
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    agreeToTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSwitchMode = () => {
    setIsLoginMode(!isLoginMode);
    setShowPassword(false); // Reset eye toggle masking on view flips
    setFormData({ username: '', email: '', password: '', agreeToTerms: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    /* =========================================
        SELECT API ENDPOINT
    ========================================= */
    const endpoint = isLoginMode ? '/api/admin/login' : '/api/admin/signup';

    /* =========================================
        BUILD PAYLOAD
    ========================================= */
    const payload = isLoginMode
      ? {
          username: formData.username.trim(),
          password: formData.password
        }
      : {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password
        };

    try {
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      /* =========================================
          SUCCESS
      ========================================= */
      if (response.ok) {
        alert(data.message || 'Action executed successfully!');

        /* -----------------------------
            SIGNUP SUCCESS
        ----------------------------- */
        if (!isLoginMode) {
          setIsLoginMode(true);
        }

        /* -----------------------------
            LOGIN SUCCESS
        ----------------------------- */
        else {
          console.log('Admin Authorized:', data.admin);

          /* SAVE JWT TOKEN */
          localStorage.setItem('token', data.token);

          /* SAVE ADMIN INFO */
          localStorage.setItem('admin', JSON.stringify(data.admin));

          /* REDIRECT TO DASHBOARD */
          window.location.href = '/admin-dashboard';
        }
      }

      /* =========================================
          FAILED RESPONSE
      ========================================= */
      else {
        alert(data.message || 'Authentication error.');
      }
    }

    /* =========================================
        NETWORK ERROR
    ========================================= */
    catch (error) {
      console.error('Admin Portal Network Error:', error);
      alert(`Cannot establish secure handshake with administration node running on ${backendUrl}`);
    }
  };

  return (
    <div 
      className="admin-page-container" 
      style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        width: '100vw',
        fontFamily: "'Inter', sans-serif", 
        backgroundColor: '#ffffff', 
        margin: 0,
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* GLOBAL INTERACTIVE STYLES & ULTRA-FAST PREMIUM ANIMATIONS */}
      <style>{`
        /* High-speed morphing keyframes for rapid fluid movement */
        @keyframes adminOrganicWaves {
          0% { border-radius: 40% 60% 70% 30% / 45% 45% 55% 55%; transform: scale(1) rotate(0deg); }
          50% { border-radius: 65% 35% 50% 50% / 55% 45% 55% 44%; transform: scale(1.08) rotate(180deg); }
          100% { border-radius: 40% 60% 70% 30% / 45% 45% 55% 55%; transform: scale(1) rotate(360deg); }
        }

        /* Ultra-fast form toggle slide-in fade (0.15s) */
        @keyframes adminTextGlance {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0px); }
        }

        .admin-sidebar {
          position: relative;
          overflow: hidden;
        }

        /* Doubled the animation speed for crisp, continuous liquid fluidity */
        .admin-organic-shape-1 { animation: adminOrganicWaves 4s linear infinite; }
        .admin-organic-shape-2 { animation: adminOrganicWaves 5s linear infinite reverse; }

        .admin-dynamic-text-node {
          animation: adminTextGlance 0.15s cubic-bezier(0.2, 1, 0.2, 1) forwards;
        }

        /* Instant input glow response */
        .admin-input-focus {
          transition: all 0.08s ease-out !important;
        }
        
        .admin-input-focus:focus {
          border-color: #22341A !important;
          box-shadow: 0 0 0 4px rgba(34, 52, 26, 0.22) !important;
          outline: none !important;
          background: #ffffff !important;
        }
        
        /* Snappy action button responses */
        .admin-primary-btn {
          transition: all 0.08s cubic-bezier(0.2, 1, 0.2, 1) !important;
        }
        
        .admin-primary-btn:hover {
          background-color: #162211 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 14px rgba(34, 52, 26, 0.35) !important;
        }
        
        .admin-primary-btn:active {
          transform: translateY(0px) !important;
          box-shadow: 0 2px 4px rgba(34, 52, 26, 0.2) !important;
        }
        
        @media (max-width: 950px) {
          .admin-sidebar { display: none !important; }
          .admin-form-side { width: 100% !important; padding: 2rem !important; }
          .admin-form-card { max-width: 420px !important; }
        }
      `}</style>

      {/* LEFT COLUMN: BRANDING & SYSTEM CONFIG PANEL */}
      <div 
        className="admin-sidebar"
        style={{ 
          width: '40%', 
          background: '#22341A', 
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '4.5rem 4rem', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}
      >
        {/* Lighter, high-contrast dynamic shapes that glow against the deep green background */}
        <div 
          className="admin-organic-shape-1"
          style={{ position: 'absolute', width: '480px', height: '480px', background: 'linear-gradient(135deg, rgba(130, 214, 84, 0.35) 0%, rgba(255,255,255,0) 80%)', top: '-18%', left: '-15%', pointerEvents: 'none', zIndex: 1 }}
        ></div>
        <div 
          className="admin-organic-shape-2"
          style={{ position: 'absolute', width: '500px', height: '500px', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255,255,255,0) 75%)', bottom: '-22%', right: '-12%', pointerEvents: 'none', zIndex: 1 }}
        ></div>

        {/* TOP CORNER BRANDING */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1.5px', margin: 0, lineHeight: '1' }}>
            Eduvanta<span style={{ color: '#58a533' }}>.</span>
          </h1>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'rgba(255, 255, 255, 0.95)', fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.6rem', borderRadius: '4px', marginTop: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Control Console
          </div>
        </div>

        {/* CENTER DECORATIVE DYNAMIC PANEL */}
        <div key={isLoginMode ? "login-meta" : "signup-meta"} className="admin-dynamic-text-node" style={{ margin: 'auto 0', position: 'relative', zIndex: 2 }}>
          <h2 style={{ color: '#ffffff', fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.15', marginBottom: '1.5rem', letterSpacing: '-2px' }}>
            {isLoginMode ? <>Welcome <br />Back.</> : <>Join Us <br />Today.</>}
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.05rem', lineHeight: '1.6', margin: 0, maxWidth: '340px', fontWeight: '400' }}>
            {isLoginMode 
              ? "Access administrative nodes, authorize institutional frameworks, and supervise database infrastructure pipelines."
              : "Provision a root level configuration instance to override parameters and organize schemas."
            }
          </p>
        </div>

        {/* BOTTOM METADATA */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.8rem', fontWeight: '500', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>
            Secure Infrastructure Portal
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: DYNAMIC FORM INTAKE CONSOLE */}
      <div 
        className="admin-form-side"
        style={{ 
          width: '60%', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff'
        }}
      >
        <div key={isLoginMode ? "login-form-card" : "signup-form-card"} className="admin-form-card admin-dynamic-text-node" style={{ width: '100%', maxWidth: '380px' }}>
          <h2 style={{ color: '#111827', fontSize: '1.85rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
            {isLoginMode ? 'Admin Sign In' : 'Register Administrator'}
          </h2>
          <p style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '2.25rem', lineHeight: '1.5' }}>
            {isLoginMode 
              ? "Provide security access parameters to enter the server node dashboard." 
              : "Establish master account access credentials across your system environments."
            }
          </p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* USERNAME INPUT MODULE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ color: '#374151', fontSize: '0.85rem', fontWeight: '600' }}>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter admin username"
                className="admin-input-focus"
                style={{ 
                  width: '100%', 
                  padding: '0.8rem 1rem', 
                  borderRadius: '10px', 
                  border: '1px solid #d1d5db', 
                  fontSize: '0.925rem',
                  background: '#ffffff',
                  color: '#111827',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            {/* EMAIL INPUT MODULE (SIGNUP ONLY) */}
            {!isLoginMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ color: '#374151', fontSize: '0.85rem', fontWeight: '600' }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter admin email address"
                  className="admin-input-focus"
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem 1rem', 
                    borderRadius: '10px', 
                    border: '1px solid #d1d5db', 
                    fontSize: '0.925rem',
                    background: '#ffffff',
                    color: '#111827',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
            )}

            {/* PASSWORD INPUT MODULE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ color: '#374151', fontSize: '0.85rem', fontWeight: '600' }}>Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter secure password" 
                  className="admin-input-focus"
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem 1rem', 
                    paddingRight: '2.75rem',
                    borderRadius: '10px', 
                    border: '1px solid #d1d5db', 
                    fontSize: '0.925rem',
                    background: '#ffffff',
                    color: '#111827',
                    boxSizing: 'border-box'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* CORPORATE COMPLIANCE CHECKBOX (SIGNUP ONLY) */}
            {!isLoginMode && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '0.2rem' }}>
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  style={{ 
                    marginTop: '0.2rem',
                    accentColor: '#22341A',
                    cursor: 'pointer',
                    width: '14px',
                    height: '14px'
                  }}
                  required
                />
                <label htmlFor="agreeToTerms" style={{ color: '#4b5563', fontSize: '0.825rem', lineHeight: '1.4', cursor: 'pointer', userSelect: 'none' }}>
                  I clear corporate compliance <span style={{ textDecoration: 'underline', color: '#22341A', fontWeight: '600' }}>terms & policies</span>
                </label>
              </div>
            )}

            {/* ACTION SUBMIT BUTTON */}
            <button 
              type="submit" 
              className="admin-primary-btn" 
              style={{ 
                width: '100%', 
                padding: '0.85rem', 
                backgroundColor: '#22341A', 
                color: 'white', 
                border: 'none', 
                borderRadius: '10px', 
                fontWeight: '600', 
                cursor: 'pointer',
                fontSize: '0.975rem',
                marginTop: '0.5rem'
              }}
            >
              {isLoginMode ? 'Sign In to Dashboard' : 'Register Admin Account'}
            </button>

            {/* INTERACTIVE MODE TOGGLE SWITCH */}
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>
              {isLoginMode ? "Need an administrator profile? " : "Already verified? "}
              <span 
                onClick={handleSwitchMode} 
                style={{ color: '#22341A', fontWeight: '700', cursor: 'pointer', marginLeft: '3px', textDecoration: 'underline' }}
              >
                {isLoginMode ? 'Create Account' : 'Login Here'}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;