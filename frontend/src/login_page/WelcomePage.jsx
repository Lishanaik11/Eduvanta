import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/pic.png'; 

const WelcomePage = () => {
  const navigate = useNavigate();
  
  // Track window width for dynamic inline responsiveness
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  // Handle CTA Click, sending mobile status context to the signup page
  const handleStartTrial = () => {
    navigate('/signup', { state: { fromMobile: isMobile } });
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
        overflowX: 'hidden'
      }}
    >
      {/* BACKGROUND IMAGE CONTAINER - NATURAL IMAGE COLORS */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -1
        }}
        className="moving-bg-layer"
      />

      {/* NAVIGATION BAR */}
      <nav style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: isMobile ? '1rem' : '0',
        padding: isMobile ? '1rem' : '1.5rem 4rem',
        backdropFilter: 'blur(12px)',
        background: 'rgba(255, 255, 255, 0.15)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Brand Logo */}
        <div style={{ 
          fontSize: isMobile ? '1.5rem' : '1.75rem', 
          fontWeight: '800', 
          color: '#ffffff', 
          letterSpacing: '0.5px',
          textShadow: '0 2px 8px rgba(59, 89, 45, 0.5)'
        }}>
          Eduvanta<span style={{ color: '#A3E635' }}>.</span>
        </div>

        {/* Links - Hidden or adjusted spacing on mobile */}
        <div style={{ display: 'flex', gap: isMobile ? '1.5rem' : '3rem', alignItems: 'center' }}>
          <span style={{ 
            cursor: 'pointer', 
            fontWeight: '700', 
            color: '#3B592D', 
            transition: 'all 0.3s ease',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'
          }}>
            Home
          </span>
          <span 
            onClick={() => navigate('/contact')} 
            className="nav-hover-link" 
            style={{ 
              cursor: 'pointer', 
              fontWeight: '600', 
              color: '#475569', 
              transition: 'all 0.3s ease',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'
            }}
          >
            Contact Us
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: isMobile ? '0.75rem' : '1.25rem' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#3B592D',
              border: '2px solid #3B592D',
              padding: isMobile ? '0.4rem 1.25rem' : '0.6rem 1.75rem',
              borderRadius: '50px',
              fontWeight: '700',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}
            className="welcome-btn-secondary"
          >
            Login
          </button>
          <button 
            onClick={handleStartTrial} // Updated to share the same mobile context navigation
            style={{
              background: '#3B592D', 
              color: '#ffffff',
              border: 'none',
              padding: isMobile ? '0.4rem 1.25rem' : '0.6rem 1.75rem',
              borderRadius: '50px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59, 89, 45, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}
            className="welcome-btn-primary"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* HERO CONTENT SECTION */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: isMobile ? 'center' : 'flex-start',
        textAlign: isMobile ? 'center' : 'left',
        padding: isMobile ? '2rem 1.5rem' : '0 6rem',
        maxWidth: '800px',
        position: 'relative',
        zIndex: 2,
        animation: 'fadeInUp 1s ease-out'
      }}>
        <h1 style={{
          fontSize: isMobile ? '2.25rem' : '3.75rem',
          fontWeight: '800',
          lineHeight: '1.2',
          marginBottom: '1.5rem',
          letterSpacing: '-1px',
          color: '#0b5829',
          textShadow: '0 4px 16px rgba(59, 89, 45, 0.35), 0 2px 4px rgba(0, 0, 0, 0.15)' 
        }}>
          Learn a New Skill<br />
          Everyday, Anytime, <br />
          and Anywhere.
        </h1>
        
        <p style={{
          fontSize: isMobile ? '1rem' : '1.125rem',
          color: '#475569', 
          lineHeight: '1.6',
          marginBottom: '2.5rem',
          maxWidth: '600px',
          fontWeight: '500'
        }}>
          1000+ Courses covering all tech domains for you to learn and explore new opportunities. Learn from Industry Experts and land your Dream Job.
        </p>

        {/* Main CTA Action Button */}
        <button 
          onClick={handleStartTrial}
          style={{
            background: '#3B592D',
            color: '#ffffff',
            border: 'none',
            padding: isMobile ? '0.8rem 2rem' : '1rem 2.5rem',
            borderRadius: '50px',
            fontSize: isMobile ? '1rem' : '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(74, 99, 62, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="welcome-btn-cta"
        >
          Start Trial
        </button>

        {/* Live Counters Block */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '1.5rem' : '4rem', 
          marginTop: isMobile ? '3rem' : '4.5rem',
          background: 'rgba(59, 89, 45, 0.15)', 
          padding: isMobile ? '1.5rem 2rem' : '1.5rem 2.5rem',
          borderRadius: '24px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 89, 45, 0.2)',
          width: isMobile ? '100%' : 'auto',
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: '800', color: '#3B592D' }}>1000+</div>
            <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem', fontWeight: '600' }}>Courses to choose from</div>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: '800', color: '#3B592D' }}>5000+</div>
            <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem', fontWeight: '600' }}>Students Trained</div>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: '800', color: '#3B592D' }}>200+</div>
            <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.25rem', fontWeight: '600' }}>Professional Trainers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;