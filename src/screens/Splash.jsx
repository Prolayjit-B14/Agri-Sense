import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Leaf, Sparkles, Cpu } from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  secondary: '#3B82F6',
  bgGradient: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)'
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const Splash = () => {
  const navigate = useNavigate();
  const { farmInfo } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ 
      height: '100vh', width: '100vw', 
      background: COLORS.bgGradient,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      
      {/* RADIANT GLOW BEHIND LOGO */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ 
          position: 'absolute', width: '300px', height: '300px', 
          background: `radial-gradient(circle, ${COLORS.primary}40 0%, transparent 70%)`,
          borderRadius: '50%', filter: 'blur(40px)'
        }}
      />

      {/* LOGO CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ 
          width: '120px', height: '120px', borderRadius: '40px', background: 'rgba(255,255,255,0.05)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)', marginBottom: '2.5rem', position: 'relative'
        }}
      >
        <Leaf size={64} color={COLORS.primary} fill={COLORS.primary} />
        <motion.div 
          animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', top: '-10px', right: '-10px' }}
        >
          <Sparkles size={24} color={COLORS.primary} />
        </motion.div>
      </motion.div>

      {/* BRANDING */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: 950, margin: 0, letterSpacing: '-0.05em' }}>
          Agri<span style={{ color: COLORS.primary }}>Sense</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Neural Precision Hub
        </p>
      </motion.div>

      {/* BOOT SEQUENCE SIMULATION */}
      <div style={{ position: 'absolute', bottom: '60px', left: 0, right: 0, textAlign: 'center', padding: '0 2rem' }}>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            <Cpu size={14} color={COLORS.primary} />
            <span style={{ fontSize: '0.65rem', fontWeight: 950, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Initializing Biospheric Logic...</span>
         </div>
         <div style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.05)', margin: '0 auto', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3, ease: 'linear' }}
              style={{ height: '100%', background: COLORS.primary, boxShadow: `0 0 10px ${COLORS.primary}` }} 
            />
         </div>
      </div>

    </div>
  );
};

export default Splash;
