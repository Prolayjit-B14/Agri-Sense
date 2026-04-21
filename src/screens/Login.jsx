import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { MASTER_CONFIG } from '../config';
import { 
  Shield, Lock, Mail, ArrowRight, 
  Leaf, Zap, CheckCircle2, Sparkles
} from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  secondary: '#3B82F6',
  accent: '#6366F1',
  bgGradient: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
  glass: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.1)'
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const LoginV3 = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, farmInfo } = useApp();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/dashboard');
    } else {
      alert(`Access Denied. Please verify credentials.`);
    }
  };

  const particles = React.useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    y: [0, -1000],
    x: [0, (Math.random() - 0.5) * 200],
    duration: 10 + Math.random() * 20,
    left: `${Math.random() * 100}%`
  })), []);

  return (
    <div style={{ 
      background: COLORS.bgGradient, minHeight: '100vh', 
      display: 'flex', flexDirection: 'column', padding: '2rem', 
      justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' 
    }}>
      
      {/* BACKGROUND PARTICLES SIMULATION */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }}>
        {particles.map((p) => (
          <motion.div 
            key={p.id}
            animate={{ y: p.y, x: p.x }}
            transition={{ duration: p.duration, repeat: Infinity, ease: 'linear' }}
            style={{ 
              position: 'absolute', bottom: -20, left: p.left,
              width: '2px', height: '2px', background: 'white', borderRadius: '50%' 
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}
      >
        {/* BRAND HERO */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <motion.div 
            initial={{ y: -20 }} animate={{ y: 0 }}
            style={{ 
              width: '100px', height: '100px', borderRadius: '32px', background: 'rgba(255,255,255,0.05)', 
              margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(12px)', border: `1px solid ${COLORS.glassBorder}`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            <Leaf size={52} color={COLORS.primary} fill={COLORS.primary} />
          </motion.div>
          <h1 style={{ color: 'white', fontSize: '2.8rem', fontWeight: 950, margin: 0, letterSpacing: '-0.05em' }}>
            Agri<span style={{ color: COLORS.primary }}>Sense</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', fontWeight: 700, marginTop: '8px', letterSpacing: '0.02em' }}>
            {MASTER_CONFIG.TAGLINE}
          </p>
        </div>

        {/* LOGIN FORM */}
        <motion.form 
          onSubmit={handleLogin}
          style={{ 
            padding: '2.5rem', background: COLORS.glass, borderRadius: '40px', 
            backdropFilter: 'blur(40px)', border: `1px solid ${COLORS.glassBorder}`,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.1em' }}>Neural ID</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} color="rgba(255,255,255,0.2)" style={{ position: 'absolute', left: '18px' }} />
              <input 
                type="email" placeholder="Email Identifier" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', height: '64px', background: 'rgba(255,255,255,0.04)', borderRadius: '20px', border: `1px solid ${COLORS.glassBorder}`, paddingLeft: '52px', color: 'white', fontSize: '1rem', fontWeight: 700, outline: 'none' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.1em' }}>Security Hash</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} color="rgba(255,255,255,0.2)" style={{ position: 'absolute', left: '18px' }} />
              <input 
                type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', height: '64px', background: 'rgba(255,255,255,0.04)', borderRadius: '20px', border: `1px solid ${COLORS.glassBorder}`, paddingLeft: '52px', color: 'white', fontSize: '1rem', fontWeight: 700, outline: 'none' }} 
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            style={{ width: '100%', height: '68px', borderRadius: '24px', fontSize: '1.2rem', background: `linear-gradient(135deg, ${COLORS.primary}, #065F46)`, border: 'none', color: 'white', fontWeight: 950, boxShadow: `0 20px 40px ${COLORS.primary}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', marginBottom: '1.25rem' }}
          >
            START HARVEST <ArrowRight size={22} />
          </motion.button>

          <motion.button 
            type="button" onClick={() => { if (login('guest', 'guest')) navigate('/dashboard'); }}
            whileHover={{ background: 'rgba(255,255,255,0.05)' }}
            style={{ width: '100%', height: '60px', borderRadius: '24px', fontSize: '0.95rem', background: 'transparent', border: `1px solid ${COLORS.glassBorder}`, color: 'white', fontWeight: 900, cursor: 'pointer', transition: '0.3s' }}
          >
            CONTINUE AS GUEST
          </motion.button>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 900, letterSpacing: '0.15em' }}>
            SECURED ENCRYPTED END-TO-END
          </p>
        </motion.form>

        {/* VERSION TAG */}
        <div style={{ textAlign: 'center', marginTop: '3rem', opacity: 0.4 }}>
          <p style={{ color: 'white', fontSize: '0.75rem', fontWeight: 950, letterSpacing: '2px' }}>V{farmInfo?.version || "2.2.0"} PRO-LEVEL</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginV3;
