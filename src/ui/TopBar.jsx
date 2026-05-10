import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../state/AppContext';
import { useTelemetry } from '../state/TelemetryContext';
import { 
  Bell, Menu, User, MapPin, ChevronDown, Sun, Moon
} from 'lucide-react';

const AgriSenseLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <span style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
      AgriSense <span style={{ color: 'var(--primary)' }}>Pro</span>
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
      background: 'var(--danger)', 
      borderRadius: '50%', border: '2px solid var(--bg-card)'
    }}></div>
  );
});

const TopBar = ({ title }) => {
  const { user, setIsSidebarOpen, isDarkMode, toggleTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="top-bar" style={{ 
      position: 'relative', zIndex: 1000, 
      background: 'var(--glass)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-main)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1rem', height: '60px',
      flexShrink: 0,
      boxShadow: 'var(--shadow-sm)'
    }}>

      {/* LEFT: MENU & TITLE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {location.pathname === '/dashboard' ? (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(prev => !prev)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-stroke)', color: 'var(--text-main)', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}
          >
            <Menu size={19} strokeWidth={2.5} />
          </motion.button>
        ) : (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(prev => !prev)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-stroke)', color: 'var(--text-main)', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}
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
            style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}
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
          style={{ cursor: 'pointer', padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--glass-stroke)', borderRadius: '12px', position: 'relative', boxShadow: 'var(--shadow-sm)' }}
        >
          <Bell size={20} color="var(--text-muted)" strokeWidth={2} />
          <NotificationDot />
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          style={{ 
            cursor: 'pointer', padding: '8px', background: 'var(--bg-card)', 
            border: '1px solid var(--glass-stroke)', borderRadius: '12px', 
            boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}
        >
          {isDarkMode ? (
            <Sun size={20} color="var(--accent)" strokeWidth={2.5} />
          ) : (
            <Moon size={20} color="var(--primary)" strokeWidth={2.5} />
          )}
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/account')}
          style={{ 
            cursor: 'pointer', width: '38px', height: '38px', 
            borderRadius: '12px', overflow: 'hidden',
            background: 'var(--bg-card)', 
            border: '1px solid var(--glass-stroke)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)' 
          }}
        >
          {user?.photoURL && !user.photoURL.includes('unsplash.com') ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>
              {(user?.name || user?.displayName || user?.email || 'A').charAt(0).toUpperCase()}
            </span>
          )}
        </motion.div>
      </div>
    </header>
  );
};

export default TopBar;
