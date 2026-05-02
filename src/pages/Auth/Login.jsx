import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../state/AppContext';

import { 
  Leaf, Lock, Mail, User, 
  ShieldCheck, MapPin, Chrome
} from 'lucide-react';

// ─── DESIGN TOKENS (SAMPLED FROM SCREENSHOT) ──────────────────────────────
const COLORS = {
  background: '#042F2E', // Deep Forest Green
  card: '#0D3D36',       // Dark Teal Card
  primary: '#10B981',    // Emerald Green
  input: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  textMain: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.4)',
};

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState(null);
  
  const { login, guestLogin, register } = useApp();
  const navigate = useNavigate();

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (isSignUp) {
      if (!fullName || !email || !password) {
        return setError("Please fill all deployment fields");
      }
      const success = await register(fullName, email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError("Account creation failed. Email may exist.");
      }
    } else {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError("Invalid industrial credentials");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const success = await googleLogin();
    if (success) navigate('/dashboard');
    else setError("Google authentication failed.");
  };

  const handleGuestEntry = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return setError("Please enter your name");
    guestLogin(guestName);
    navigate('/dashboard');
  };

  return (
    <div style={{ 
      minHeight: '100dvh', width: '100vw', background: COLORS.background,
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      padding: '2rem 1.5rem', fontFamily: "'Outfit', sans-serif",
      color: 'white', position: 'relative'
    }}>
      
      {/* 🍃 COMPACT LOGO */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '1.2rem' }}
      >
        <div style={{ 
          width: '60px', height: '60px', borderRadius: '18px',
          background: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${COLORS.inputBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem'
        }}>
          <Leaf size={30} color={COLORS.primary} strokeWidth={2.5} />
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>AgriSense</h1>
      </motion.div>

      {/* 🃏 AUTH CARD */}
      <motion.div 
        layout
        style={{ 
          width: '100%', maxWidth: '360px', background: COLORS.card,
          borderRadius: '32px', padding: '1.8rem 1.5rem',
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)', border: `1px solid ${COLORS.inputBorder}`
        }}
      >
        <AnimatePresence mode="wait">
          {!isGuestMode ? (
            <motion.div key={isSignUp ? 'signup' : 'login'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 800, marginBottom: '1.2rem', color: COLORS.primary, textTransform: 'uppercase' }}>
                {isSignUp ? 'New Deployment' : 'Farmer Login'}
              </h2>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '10px', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleManualLogin}>
                {isSignUp && (
                  <div style={{ marginBottom: '0.75rem', position: 'relative' }}>
                    <User size={18} color={COLORS.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)}
                      style={{ width: '100%', height: '52px', background: COLORS.input, border: `1px solid ${COLORS.inputBorder}`, borderRadius: '16px', paddingLeft: '44px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                )}
                <div style={{ marginBottom: '0.75rem', position: 'relative' }}>
                  <Mail size={18} color={COLORS.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', height: '52px', background: COLORS.input, border: `1px solid ${COLORS.inputBorder}`, borderRadius: '16px', paddingLeft: '44px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '1.2rem', position: 'relative' }}>
                  <Lock size={18} color={COLORS.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', height: '52px', background: COLORS.input, border: `1px solid ${COLORS.inputBorder}`, borderRadius: '16px', paddingLeft: '44px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <button type="submit" style={{ width: '100%', height: '56px', borderRadius: '16px', background: COLORS.primary, border: 'none', color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: `0 8px 24px ${COLORS.primary}40`, marginBottom: '1rem' }}>
                  {isSignUp ? 'CREATE ACCOUNT' : 'SECURE SIGN IN'}
                </button>
              </form>





              <button onClick={() => setIsGuestMode(true)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.1)`, color: 'rgba(255,255,255,0.4)', padding: '12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', marginTop: '0.5rem' }}>
                GUEST ACCESS
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.82rem', marginTop: '1.2rem' }}>
                <p style={{ color: COLORS.textMuted, margin: 0 }}>
                  {isSignUp ? 'Already a member? ' : "New here? "}
                  <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: COLORS.primary, fontWeight: 800, cursor: 'pointer' }}>
                    {isSignUp ? 'SIGN IN' : 'JOIN NOW'}
                  </span>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="guest" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <h2 style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 800, marginBottom: '1.2rem', color: COLORS.primary, textTransform: 'uppercase' }}>
                Guest Entry
              </h2>
              <p style={{ fontSize: '0.8rem', color: COLORS.textMuted, textAlign: 'center', marginBottom: '1.5rem' }}>
                Please enter your name to access the industrial dashboard as a guest.
              </p>
              <form onSubmit={handleGuestEntry}>
                <div style={{ marginBottom: '1.2rem', position: 'relative' }}>
                  <User size={18} color={COLORS.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" placeholder="Your Name" value={guestName} onChange={e => setGuestName(e.target.value)} autoFocus
                    style={{ width: '100%', height: '52px', background: COLORS.input, border: `1px solid ${COLORS.inputBorder}`, borderRadius: '16px', paddingLeft: '44px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <button type="submit" style={{ width: '100%', height: '56px', borderRadius: '16px', background: COLORS.primary, border: 'none', color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>
                  ENTER DASHBOARD
                </button>
              </form>
              <button onClick={() => setIsGuestMode(false)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: COLORS.textMuted, padding: '12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>
                BACK TO LOGIN
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 🛡️ FOOTER */}
      <div style={{ marginTop: 'auto', paddingBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.3, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em' }}>
        <ShieldCheck size={14} /> INDUSTRIAL MODE ACTIVE
      </div>

    </div>
  );
};

export default Login;

