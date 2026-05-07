import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Settings as SettingsIcon,
  CloudSun, Database, FlaskConical, Camera,
  Sparkles, BarChart2, Network, Bell,
  Sprout, Waves, FileText, ShieldCheck,
  ChevronLeft, ChevronRight, Leaf, User, PieChart, LayoutDashboard,
  ArrowRight, ArrowLeft, Activity, Cpu, LogOut
} from 'lucide-react';
import { useApp } from '../state/AppContext';
import { useTelemetry } from '../state/TelemetryContext';

const Sidebar = () => {
  const { user, isSidebarOpen, setIsSidebarOpen, farmInfo, logout } = useApp();
  const { mqttStatus } = useTelemetry();
  const location = useLocation();
  const close = () => setIsSidebarOpen(false);

  const farmName     = farmInfo?.name || 'Master Field';
  const clientName   = user?.name || 'Administrator';
  const isLive       = mqttStatus === 'connected';

  const navLinks = [
    { name: 'Dashboard',           path: '/dashboard',              icon: LayoutDashboard, color: '#10B981' },
    { name: 'Soil Monitor',        path: '/soil-monitoring',        icon: Sprout,        color: '#8B5E3C' },
    { name: 'Weather Station',     path: '/weather',                icon: CloudSun,      color: '#3B82F6' },
    { name: 'Storage Hub',         path: '/storage-hub',            icon: Database,       color: '#64748B' },
    { name: 'Irrigation',          path: '/irrigation',             icon: Waves,         color: '#06D6A0' },
    { name: 'Soil Forensics',      path: '/precision-soil-testing', icon: FlaskConical,  color: '#a855f7' },
    { name: 'Farm Advisor',        path: '/crop-advisor',           icon: Sparkles,      color: '#f59e0b' },
    { name: 'Analytics Hub',       path: '/analytics',              icon: PieChart,      color: '#6366f1' },
    { name: 'Farm Reports',        path: '/reports',                icon: FileText,      color: '#ec4899' },
    { name: 'Camera Stream',       path: '/camera',                 icon: Camera,        color: '#7C3AED' },
    { name: 'Device Manager',      path: '/device-area',            icon: Cpu,           color: '#06b6d4' },
    { name: 'Alert Center',        path: '/alerts',                 icon: Bell,          color: '#eab308' },
    ...(user?.email?.toLowerCase() === 'prolayjitbiswas14112004@gmail.com' ? [
      { name: 'Admin Control',     path: '/admin',                  icon: ShieldCheck,   color: '#dc2626' }
    ] : [])
  ];

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 10001, 
              background: 'rgba(0,0,0,0.12)', backdropFilter: 'blur(10px)' 
            }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', zIndex: 10002,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(30px)',
          display: 'flex', flexDirection: 'column',
          boxShadow: isSidebarOpen ? '30px 0 60px rgba(0,0,0,0.06)' : 'none',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255, 255, 255, 0.6)',
          fontFamily: "'Outfit', sans-serif"
        }}
      >
        {/* ── TOP HEADER: PROFILE + CLOSE ── */}
        <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ 
                width: '42px', height: '42px', borderRadius: '12px', 
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.12)'
              }}>
                {user?.photoURL && !user.photoURL.includes('unsplash.com') ? (
                  <img src={user.photoURL} style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>
                    {(user?.name || user?.displayName || user?.email || 'A').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ 
                position: 'absolute', bottom: '-1px', right: '-1px', 
                width: '10px', height: '10px', borderRadius: '50%', 
                background: isLive ? '#10B981' : '#F59E0B', 
                border: '2px solid rgba(255, 255, 255, 0.9)'
              }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 850, color: '#0f172a', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {(clientName || 'Farmer').split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.03em' }}>
                {farmName}
              </div>
            </div>
          </div>

          {/* ❌ CLOSE BUTTON (RIGHT SIDE) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={close}
            style={{ 
              width: '38px', height: '38px', borderRadius: '10px', 
              background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              cursor: 'pointer', color: '#64748b', flexShrink: 0
            }}
          >
            <X size={20} strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* ── NAVIGATION LIST ── */}
        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 12px 30px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navLinks.map((link, i) => {
              const NavIcon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <NavLink 
                  key={i} 
                  to={link.path} 
                  onClick={close}
                  style={{
                    position: 'relative', display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 14px', textDecoration: 'none', borderRadius: '12px',
                    transition: '0.2s'
                  }}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="navActiveGlow"
                      style={{ 
                        position: 'absolute', inset: 0, 
                        background: 'rgba(16, 185, 129, 0.08)', 
                        borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.15)' 
                      }} 
                    />
                  )}
                  
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', 
                        background: isActive ? `${link.color}15` : 'rgba(0,0,0,0.02)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1
                      }}>
                        <NavIcon size={18} color={isActive ? link.color : `${link.color}77`} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span style={{ 
                        fontSize: '0.95rem', fontWeight: isActive ? 800 : 600, 
                        color: isActive ? '#0f172a' : '#64748b', zIndex: 1,
                        transition: '0.2s'
                      }}>
                        {link.name}
                      </span>
                  
                  {isActive && (
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: '#10B981', zIndex: 1 }} 
                    />
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* ── SYSTEM FOOTER ── */}
        <div style={{ padding: '24px', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* OFFICIAL LOGO ICON */}
            <div style={{ position: 'relative', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', borderRadius: '10px', rotate: '45deg', opacity: 0.15 }} />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#059669" fillOpacity="0.2" />
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 7v6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                AgriSense <span style={{ color: '#10B981' }}>Pro</span>
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.1em', marginTop: '2px', textTransform: 'uppercase' }}>
                System Version {farmInfo?.version || '19.1.0'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default Sidebar;
