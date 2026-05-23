import React, { useState, useEffect } from 'react';
import Signup from './Signup';
import LoginForm from './LoginForm'; 

const LoginPage = ({ initialView = 'signup' }) => {
  // Sync view state based on which route URL was hit in App.jsx
  const [isLogin, setIsLogin] = useState(initialView === 'login');

  useEffect(() => {
    setIsLogin(initialView === 'login');
  }, [initialView]);

  return (
    <div 
      className="login-page-container" 
      style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        width: '100vw',
        fontFamily: "'Inter', sans-serif", 
        backgroundColor: '#f4f7f3', // Base clean brand backdrop
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        boxSizing: 'border-box',
        margin: 0,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      
      {/* ================= BACKGROUND AURORA AMBIENCE ================= */}
      <div style={{
        position: 'absolute',
        width: '750px',
        height: '750px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(88,165,51,0.12) 0%, rgba(244,247,243,0) 70%)',
        top: '-10%',
        right: '-5%',
        zIndex: 1,
        filter: 'blur(40px)',
        animation: 'ambientDriftOne 22s ease-in-out infinite alternate'
      }}></div>
      
      <div style={{
        position: 'absolute',
        width: '800px',
        height: '800px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,89,45,0.08) 0%, rgba(244,247,243,0) 70%)',
        bottom: '-15%',
        left: '-10%',
        zIndex: 1,
        filter: 'blur(50px)',
        animation: 'ambientDriftTwo 26s ease-in-out infinite alternate'
      }}></div>

      {/* ================= EXTRA CSS FOR ULTRA-SMOOTH FLOATING ACTIONS ================= */}
      <style>{`
        /* The main premium card floating motion keyframe */
        @keyframes centralCardFloat {
          0% {
            transform: translateY(0px);
            box-shadow: 0 30px 70px -15px rgba(35, 54, 25, 0.09), 0 15px 30px -10px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.6) inset;
          }
          50% {
            transform: translateY(-12px);
            box-shadow: 0 45px 85px -10px rgba(35, 54, 25, 0.13), 0 25px 40px -12px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.7) inset;
          }
          100% {
            transform: translateY(0px);
            box-shadow: 0 30px 70px -15px rgba(35, 54, 25, 0.09), 0 15px 30px -10px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.6) inset;
          }
        }

        /* Form view entry fade-in layout */
        @keyframes formSmoothGlance {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }

        /* Ambient background drifting coordinates */
        @keyframes ambientDriftOne {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.08); }
          100% { transform: translate(-20px, 15px) scale(0.95); }
        }

        @keyframes ambientDriftTwo {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.05); }
          100% { transform: translate(20px, -15px) scale(0.92); }
        }

        /* Branding card panel moving layers */
        @keyframes organicWaves {
          0% { border-radius: 40% 60% 70% 30% / 45% 45% 55% 55%; transform: scale(1) rotate(0deg); }
          50% { border-radius: 65% 35% 50% 50% / 55% 45% 55% 45%; transform: scale(1.04) rotate(90deg); }
          100% { border-radius: 40% 60% 70% 30% / 45% 45% 55% 55%; transform: scale(1) rotate(360deg); }
        }

        .login-page-container {
          box-sizing: border-box;
        }

        .premium-split-card {
          animation: centralCardFloat 6s ease-in-out infinite;
          will-change: transform, box-shadow;
        }

        .smooth-panel-wrapper {
          animation: formSmoothGlance 0.45s cubic-bezier(0.215, 0.610, 0.355, 1) forwards;
          width: 100%;
          display: flex;
          flex-direction: column;
          justifyContent: center;
        }

        .organic-shape-1 { animation: organicWaves 18s linear infinite; }
        .organic-shape-2 { animation: organicWaves 22s linear infinite reverse; }

        @media (max-width: 900px) {
          .app-branding-side { display: none !important; }
          .form-dynamic-side { padding: 1.5rem !important; }
          .premium-split-card { max-width: 480px !important; min-height: auto !important; margin: 0; animation: none !important; }
        }
      `}</style>

      {/* ================= PREMIUM FLOATING SPLIT VIEW CARD ================= */}
      <div 
        className="premium-split-card"
        style={{ 
          display: 'flex', 
          width: '100%', 
          maxWidth: '1020px', 
          minHeight: '680px',
          background: 'rgba(255, 255, 255, 0.92)', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '32px', 
          overflow: 'hidden',
          position: 'relative',
          zIndex: 5,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        
        {/* LEFT COLUMN: BRANDING & WELCOME SECTION */}
        <div 
          className="app-branding-side"
          style={{ 
            flex: '1.2', 
            background: '#3B592D', 
            padding: '4.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Internal morphing shapes */}
          <div 
            className="organic-shape-1"
            style={{ position: 'absolute', width: '450px', height: '450px', background: 'linear-gradient(135deg, rgba(88,165,51,0.2) 0%, rgba(255,255,255,0) 75%)', top: '-18%', left: '-15%', pointerEvents: 'none' }}
          ></div>
          <div 
            className="organic-shape-2"
            style={{ position: 'absolute', width: '480px', height: '480px', background: 'linear-gradient(135deg, rgba(0,0,0,0.07) 0%, rgba(255,255,255,0) 70%)', bottom: '-22%', right: '-12%', pointerEvents: 'none' }}
          ></div>

          {/* Header Identity Block */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 }}>
              Eduvanta<span style={{ color: '#58a533' }}>.</span>
            </h1>
          </div>

          {/* Dynamic Welcome Message Typography */}
          <div style={{ position: 'relative', zIndex: 2, marginBottom: '2rem' }}>
            <h2 style={{ color: '#ffffff', fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.15', letterSpacing: '-2px', margin: '0 0 1.5rem 0' }}>
              {isLogin ? (
                <>Welcome <br />Back.</>
              ) : (
                <>Join Us <br />Today.</>
              )}
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.05rem', lineHeight: '1.6', fontWeight: '400', maxWidth: '340px', margin: 0 }}>
              {isLogin 
                ? "Access your personalized learning environment and manage your academic database modules."
                : "Discover new instructional modules and expand your academic database architecture."
              }
            </p>
          </div>

          {/* Decorative Subtle Footer Tag */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.8rem', fontWeight: '500', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>
              Secure Infrastructure Portal
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: DYNAMIC FORM PANEL CONTROLLER */}
        <div 
          className="form-dynamic-side"
          style={{ 
            flex: '1', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            background: 'transparent',
            position: 'relative',
            zIndex: 2,
            overflow: 'hidden'
          }}
        >
          {isLogin ? (
            <div key="login-pane" className="smooth-panel-wrapper">
              <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
            </div>
          ) : (
            <div key="signup-pane" className="smooth-panel-wrapper">
              <Signup onSwitchToLogin={() => setIsLogin(true)} />
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default LoginPage;