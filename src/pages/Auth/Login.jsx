import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../state/AppContext';
import { 
  Leaf, Lock, Mail, User, 
  ShieldCheck, Chrome, ArrowRight, Eye, EyeOff, Fingerprint
} from 'lucide-react';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [existingGuestId, setExistingGuestId] = useState('');
  const [error, setError] = useState(null);
  
  const { login, guestLogin, register, googleLogin } = useApp();
  const navigate = useNavigate();

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (isSignUp) {
      if (!fullName || !email || !password) return setError("Please fill in all fields.");
      const success = await register(fullName, email, password);
      if (success) navigate('/dashboard');
      else setError("Failed to create account. Email may exist.");
    } else {
      const success = await login(email, password);
      if (success) navigate('/dashboard');
      else setError("Invalid email or password.");
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const success = await googleLogin();
    if (success) navigate('/dashboard');
    else setError("Google login failed.");
  };

  return (
    <div style={{ 
      minHeight: '100dvh', width: '100vw', 
      background: 'linear-gradient(135deg, #065F46 0%, #042F2E 100%)', 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem', fontFamily: "'Outfit', sans-serif",
      position: 'relative', overflow: 'hidden'
    }}>

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* 🍃 PREMIUM LOGO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.04em', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>AgriSense <span style={{ color: '#10B981' }}>Pro</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', fontWeight: 600, marginTop: '8px', letterSpacing: '0.02em' }}>SMART FARM COMMAND CENTER</p>
        </motion.div>

        {/* 🃏 CRYSTAL AUTH CARD */}
        <motion.div 
          layout
          style={{ 
            width: '100%', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(24px)',
            borderRadius: '32px', padding: '2.5rem 2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          <AnimatePresence mode="wait">
            {!isGuestMode ? (
              <motion.div key={isSignUp ? 'signup' : 'login'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem', color: 'white', textAlign: 'center' }}>
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>

                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', padding: '12px', borderRadius: '14px', marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleManualLogin}>
                  {isSignUp && (
                    <div style={{ marginBottom: '1rem', position: 'relative' }}>
                      <User size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)}
                        style={{ width: '100%', height: '56px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', paddingLeft: '48px', color: 'white', fontSize: '0.95rem', outline: 'none', transition: '0.3s' }}
                        onFocus={(e) => e.target.style.borderColor = '#10B981'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                    </div>
                  )}
                  <div style={{ marginBottom: '1rem', position: 'relative' }}>
                    <Mail size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
                      style={{ width: '100%', height: '56px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', paddingLeft: '48px', color: 'white', fontSize: '0.95rem', outline: 'none', transition: '0.3s' }}
                      onFocus={(e) => e.target.style.borderColor = '#10B981'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                  <div style={{ marginBottom: '2rem', position: 'relative' }}>
                    <Lock size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                      style={{ width: '100%', height: '56px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', paddingLeft: '48px', paddingRight: '48px', color: 'white', fontSize: '0.95rem', outline: 'none', transition: '0.3s' }}
                      onFocus={(e) => e.target.style.borderColor = '#10B981'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02, background: '#059669' }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    style={{ 
                      width: '100%', height: '60px', borderRadius: '18px', background: '#10B981', border: 'none', 
                      color: 'white', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', 
                      boxShadow: '0 12px 24px rgba(16, 185, 129, 0.3)', marginBottom: '1.5rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                    }}
                  >
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                    <ArrowRight size={18} />
                  </motion.button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>OR CONTINUE WITH</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <motion.button 
                  whileHover={{ background: 'rgba(255,255,255,0.1)' }}
                  onClick={handleGoogleLogin}
                  style={{ 
                    width: '100%', height: '56px', borderRadius: '16px', background: 'transparent', 
                    border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, 
                    fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', gap: '12px', marginBottom: '0.75rem' 
                  }}
                >
                  <Chrome size={20} /> Google
                </motion.button>

                <motion.button 
                  whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                  onClick={() => setIsGuestMode(true)}
                  style={{ 
                    width: '100%', height: '56px', borderRadius: '16px', background: 'transparent', 
                    border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontWeight: 800, 
                    fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', gap: '8px' 
                  }}
                >
                  <User size={16} /> ENTER AS GUEST
                </motion.button>

                <div style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '2rem' }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: '#10B981', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </span>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="guest" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                 <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'white', textAlign: 'center' }}>
                  Guest Access
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '2rem' }}>
                  Please enter your name to access the monitoring dashboard.
                </p>
                <form onSubmit={async (e) => { 
                  e.preventDefault(); 
                  if(!guestName) return setError("Name required"); 
                  // Normalize ID if provided (e.g., "0001" -> "guest-0001@agrisense.in")
                  let finalId = existingGuestId?.trim();
                  if (finalId && !finalId.includes('@')) {
                    if (!finalId.startsWith('guest-')) finalId = `guest-${finalId.padStart(4, '0')}`;
                    finalId = `${finalId}@agrisense.in`;
                  }
                  await guestLogin(guestName, finalId); 
                  navigate('/dashboard'); 
                }}>
                  <div style={{ marginBottom: '1rem', position: 'relative' }}>
                    <User size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Your Name" value={guestName} onChange={e => setGuestName(e.target.value)} autoFocus
                      style={{ width: '100%', height: '56px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', paddingLeft: '48px', color: 'white', fontSize: '0.95rem', outline: 'none' }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <Fingerprint size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Guest ID (Optional: e.g. 0005)" value={existingGuestId} onChange={e => setExistingGuestId(e.target.value)}
                      style={{ width: '100%', height: '56px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', paddingLeft: '48px', color: 'white', fontSize: '0.95rem', outline: 'none' }}
                    />
                  </div>

                  <button type="submit" style={{ width: '100%', height: '60px', borderRadius: '18px', background: '#10B981', border: 'none', color: 'white', fontWeight: 900, fontSize: '1rem', cursor: 'pointer' }}>
                    CONTINUE AS GUEST
                  </button>
                </form>
                <button onClick={() => setIsGuestMode(false)}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', marginTop: '1rem' }}>
                  BACK TO LOGIN
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 🛡️ SECURITY BADGE */}
      <div style={{ position: 'absolute', bottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.4 }}>
        <ShieldCheck size={16} color="#10B981" />
        <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em' }}>SECURE AGRI-SENSE CONNECTION</span>
      </div>

    </div>
  );
};

export default Login;
