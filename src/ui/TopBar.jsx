import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../state/AppContext';
import { useTelemetry } from '../state/TelemetryContext';
import { 
  Bell, Menu, User, MapPin, ChevronDown
} from 'lucide-react';

const AgriSenseLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{ position: 'relative', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', borderRadius: '10px', rotate: '45deg', opacity: 0.15 }} />
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#059669" fillOpacity="0.2" />
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7v6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
    <span style={{ fontSize: '1.2rem', fontWeight: 950, color: '#0F172A', letterSpacing: '-0.04em' }}>
      AgriSense <span style={{ color: '#10B981' }}>Pro</span>
    </span>
  </div>
);

const NotificationDot = React.memo(() => {
  const { recommendations } = useTelemetry();
  if (!recommendations || recommendations.length === 0) return null;
  return (
    <div style={{ 
      position: 'absolute', top: '8px', right: '8px', 
      width: '8px', height: '8px',
      background: '#ef4444', 
      borderRadius: '50%', border: '2px solid white'
    }}></div>
  );
});

const TopBar = ({ title }) => {
  const { setIsSidebarOpen } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header style={{ 
      position: 'relative', zIndex: 1000, 
      background: 'rgba(255, 255, 255, 0.98)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1rem', height: '60px',
      flexShrink: 0,
      boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>

      {/* LEFT: MENU & TITLE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {location.pathname === '/dashboard' ? (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(prev => !prev)}
            style={{ background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', border: '1px solid rgba(255, 255, 255, 0.8)', color: '#1E293B', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.02), inset 0 1px 1px rgba(255,255,255,0.9)' }}
          >
            <Menu size={19} strokeWidth={2.5} />
          </motion.button>
        ) : (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(prev => !prev)}
            style={{ background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', border: '1px solid rgba(255, 255, 255, 0.8)', color: '#1E293B', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.02), inset 0 1px 1px rgba(255,255,255,0.9)' }}
          >
            <Menu size={19} strokeWidth={2.5} />
          </motion.button>
        )}
        
        {location.pathname === '/dashboard' ? (
          <AgriSenseLogo />
        ) : (
          <motion.h1 
            key={title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}
          >
            {title}
          </motion.h1>
        )}
      </div>

      {/* 🔔 RIGHT SIDE: ACTIONS & PROFILE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/alerts')}
          style={{ cursor: 'pointer', padding: '8px', background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '12px', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.02), inset 0 1px 1px rgba(255,255,255,0.9)' }}
        >
          <Bell size={20} color="#64748b" strokeWidth={2} />
          <NotificationDot />
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/account')}
          style={{ cursor: 'pointer', padding: '8px', background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.02), inset 0 1px 1px rgba(255,255,255,0.9)' }}
        >
          <User size={20} color="#64748b" strokeWidth={2} />
        </motion.div>
      </div>
    </header>
  );
};

export default TopBar;
