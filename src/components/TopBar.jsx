import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  Bell, Menu, Search, User
} from 'lucide-react';

const AgriSenseLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#logo-grad)" fillOpacity="0.2" />
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7v6" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 10l3 3 3-3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span style={{ fontSize: '1.25rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #059669, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Agri Sense</span>
  </div>
);

const TopBar = ({ title }) => {
  const { 
    setIsSidebarOpen, recommendations 
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header style={{ 
      position: 'relative', zIndex: 1000, 
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.75rem 1rem', height: '64px',
      flexShrink: 0
    }}>

      {/* 🧭 LEFT SIDE: MENU & TITLE/LOGO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(true)}
          style={{ background: '#f8fafc', border: '1px solid #f1f5f9', color: '#1e293b', cursor: 'pointer', width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Menu size={20} strokeWidth={2.5} />
        </motion.button>
        
        {location.pathname === '/dashboard' ? (
          <AgriSenseLogo />
        ) : (
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: '1.2rem', fontWeight: 950, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}
          >
            {title}
          </motion.h1>
        )}
      </div>

      {/* 🔔 RIGHT SIDE: ACTIONS & PROFILE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/alerts')}
          style={{ cursor: 'pointer', padding: '8px', background: '#f8fafc', borderRadius: '12px', position: 'relative' }}
        >
          <Bell size={20} color="#64748b" strokeWidth={2} />
          {recommendations.length > 0 && (
            <div style={{ 
              position: 'absolute', top: '8px', right: '8px', 
              width: '8px', height: '8px',
              background: '#ef4444', 
              borderRadius: '50%', border: '2px solid white'
            }}></div>
          )}
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer', padding: '8px', background: '#f8fafc', borderRadius: '12px' }}
        >
          <User size={20} color="#64748b" strokeWidth={2} />
        </motion.div>
      </div>
    </header>
  );
};

export default TopBar;
