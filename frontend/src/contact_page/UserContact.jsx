import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/pic.png';

const UserContact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    try {
      const response = await fetch(`${backendUrl}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Your message has been sent successfully!');
        setFormData({ firstName: '', lastName: '', email: '', phoneNumber: '', message: '' });
      } else {
        alert(data.message || 'Failed to send message.');
      }
    } catch (error) {
      console.error('Submission Error:', error);
      alert('Error connecting to server. Please try again later.');
    }
  };

  // Sleek text field lines matching the UI spec seamlessly
  const inputStyle = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(71, 85, 105, 0.3)', // Clean line color matching the aesthetic
    color: '#3B592D', // Deep visible forest charcoal for readability over light zones
    padding: '0.5rem 0',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: "'Poppins', sans-serif",
    transition: 'border-color 0.3s ease'
  };

  return (
    <div 
      className="welcome-hero-container"
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        color: '#ffffff',
        fontFamily: "'Poppins', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 0',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      {/* BACKGROUND LAYER FIXED: Matches natural image visibility exactly like your main landing screen */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)), url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -1
        }}
        className="moving-bg-layer"
      />

      {/* TOP BRANDING CONTROLS */}
      <div style={{ position: 'absolute', top: '2rem', left: '4rem', zIndex: 10 }}>
        <div 
          onClick={() => navigate('/')} 
          style={{ 
            fontSize: '1.75rem', 
            fontWeight: '800', 
            cursor: 'pointer', 
            color: '#3B592D', // Balanced logo color visibility
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'
          }}
        >
          Eduvanta<span style={{ color: '#A3E635' }}>.</span>
        </div>
      </div>

      {/* TITLE HEADLINE */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', zIndex: 2 }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          marginBottom: '0.5rem', 
          color: '#0b5829',
          textShadow: '0 2px 8px rgba(255, 255, 255, 0.4)'
        }}>
          Contact Us
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', fontWeight: '500' }}>
          Any question or remarks? Just write us a message!
        </p>
      </div>

      {/* REFINED GLASSMORPHIC MAIN CARD BLOCK */}
      <div 
        style={{
          display: 'flex',
          width: '85%',
          maxWidth: '1100px',
          background: 'rgba(255, 255, 255, 0.25)', // Elegant glassmorphism filter to bridge colors nicely
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          padding: '12px',
          boxShadow: '0 20px 50px rgba(59, 89, 45, 0.15)',
          marginBottom: '2.5rem',
          zIndex: 2
        }}
      >
        {/* LEFT COLUMN: CONTACT INFO BOX (DARK GREEN TINTED GLOW) */}
        <div 
          style={{
            flex: '1',
            background: 'linear-gradient(145deg, rgba(30, 48, 26, 0.9) 0%, rgba(18, 31, 15, 0.95) 100%)', 
            borderRadius: '18px',
            padding: '3.5rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(163, 230, 53, 0.2)'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem', color: '#ffffff' }}>Contact Information</h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '3.5rem' }}>Say something to start a live chat!</p>
            
            {/* Info Grid Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontSize: '1.3rem', color: '#A3E635' }}>✉</span>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0' }}>eduvanta@gmail.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontSize: '1.3rem', color: '#A3E635' }}>📍</span>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.4' }}>Navi Mumbai, Maharashtra</span>
              </div>
            </div>
          </div>

          {/* Social Platforms Links */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem', zIndex: 2 }}>
            <span style={{ cursor: 'pointer', fontSize: '1.25rem', opacity: 0.9 }}>🌐</span>
            <span style={{ cursor: 'pointer', fontSize: '1.25rem', opacity: 0.9 }}>📸</span>
            <span style={{ cursor: 'pointer', fontSize: '1.25rem', opacity: 0.9 }}>💼</span>
          </div>

          {/* Glowing Aura Orb inside the Green Column */}
          <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(163, 230, 53, 0.25)', filter: 'blur(25px)' }} />
        </div>

        {/* RIGHT COLUMN: DISPATCH FORM CONTROLS */}
        <div style={{ flex: '1.6', padding: '3.5rem 3.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Name Input Row */}
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required style={inputStyle} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required style={inputStyle} />
              </div>
            </div>

            {/* Email / Phone Input Row */}
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Phone Number</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required style={inputStyle} />
              </div>
            </div>

            {/* Message Input Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>Message</label>
              <input type="text" name="message" placeholder="Write your message..." value={formData.message} onChange={handleChange} required style={inputStyle} />
            </div>

            {/* Submit Layout Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                type="submit"
                style={{
                  background: '#3B592D',
                  color: '#ffffff',
                  border: 'none',
                  padding: '1rem 2.5rem',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(59, 89, 45, 0.3)',
                  transition: 'transform 0.2s ease, background 0.2s ease'
                }}
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* BACK TO WELCOME FOOTER CONTROL */}
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'rgba(59, 89, 45, 0.1)',
          color: '#3B592D',
          border: '1px solid rgba(59, 89, 45, 0.25)',
          padding: '0.7rem 2rem',
          borderRadius: '50px',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s ease',
          zIndex: 2
        }}
      >
        <span>←</span> Back to Home
      </button>
    </div>
  );
};

export default UserContact;