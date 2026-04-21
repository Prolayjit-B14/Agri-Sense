import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Sprout, Droplets, 
  Brain, Menu, X, Map, Settings as SettingsIcon, 
  FileText, Activity, Radio, DollarSign, 
  CloudRain, Archive, Info, User,
  Bell, LogOut, Microscope, Sun, Camera, 
  ShieldAlert, ChevronRight, Database, Monitor,
  Zap, Waves, Globe, Network, Shield, FlaskConical
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  text: '#1E293B',
  subtext: '#64748B',
  border: '#F1F5F9',
  bg: '#FFFFFF'
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────

const Sidebar = () => {
  const { logout, user, isSidebarOpen, setIsSidebarOpen } = useApp();
  const location = useLocation();

  const sidebarGroups = [
    {
      title: 'Command Center',
      links: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Analytics Hub', path: '/analytics', icon: Activity },
        { name: 'Live Vision', path: '/camera', icon: Camera },
      ]
    },
    {
      title: 'Biospheric Nodes',
      links: [
        { name: 'Soil Monitoring', path: '/soil-monitoring', icon: Sprout },
        { name: 'Irrigation Matrix', path: '/irrigation', icon: Droplets },
        { name: 'Weather Station', path: '/weather', icon: CloudRain },
        { name: 'Storage Vault', path: '/storage-hub', icon: Archive },
        { name: 'Solar Array', path: '/solar-monitoring', icon: Sun },
      ]
    },
    {
      title: 'Engineering & GIS',
      links: [
        { name: 'IoT Matrix', path: '/device-area', icon: Network },
        { name: 'Forensic Soil Test', path: '/precision-soil-testing', icon: FlaskConical },
        { name: 'System Audit', path: '/reports', icon: FileText },
        { name: 'GIS Tracking', path: '/map-view', icon: Map },
      ]
    }
  ];

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)' }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ x: isSidebarOpen ? 0 : '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ 
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', zIndex: 10002,
          background: 'white', boxShadow: '20px 0 60px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column'
        }}
      >
        {/* IDENTITY HUD */}
        <div style={{ padding: '40px 24px', background: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)', color: 'white' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
             <div style={{ width: '56px', height: '56px', borderRadius: '18px', border: '2px solid rgba(255,255,255,0.3)', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=200" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="User" />
             </div>
             <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 950, margin: 0 }}>{user?.name || 'Master Farmer'}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}>
                   <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFF' }} />
                   <span style={{ fontSize: '0.6rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Premium Access</span>
                </div>
             </div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div style={{ padding: '20px 12px', overflowY: 'auto', flex: 1 }} className="no-scrollbar">
          {sidebarGroups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: '25px' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 950, color: COLORS.subtext, padding: '0 15px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{group.title}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {group.links.map((link, li) => {
                  const NavIcon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <NavLink key={li} to={link.path} onClick={() => setIsSidebarOpen(false)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 15px', borderRadius: '14px',
                        background: isActive ? `${COLORS.primary}10` : 'transparent',
                        color: isActive ? COLORS.primary : '#475569',
                        textDecoration: 'none', transition: '0.2s', fontWeight: 850, fontSize: '0.85rem'
                      }}
                    >
                      <NavIcon size={20} strokeWidth={isActive ? 3 : 2} />
                      <span>{link.name}</span>
                      {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* FOOTER ACTIONS */}
        <div style={{ padding: '20px', borderTop: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
           <NavLink to="/settings" onClick={() => setIsSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: COLORS.subtext, textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem' }}>
              <SettingsIcon size={18} /> Settings & Matrix
           </NavLink>
           <button onClick={logout} style={{ width: '100%', padding: '14px', borderRadius: '16px', background: '#FEE2E2', color: '#EF4444', border: 'none', fontWeight: 950, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.9rem' }}>
              <LogOut size={18} /> System Logout
           </button>
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
