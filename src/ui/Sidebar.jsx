import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Sprout, Droplets,
  X, Map, Settings as SettingsIcon,
  FileText, Activity, Network,
  CloudRain, Archive,
  LogOut, FlaskConical, Camera,
  User as UserIcon, Cpu, Sparkles
} from 'lucide-react';

import { useApp } from '../context/AppContext';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  background: '#022C22', // Deep agricultural green
  textMuted: 'rgba(255, 255, 255, 0.4)',
  activeBg: 'rgba(16, 185, 129, 0.12)',
  border: 'rgba(255, 255, 255, 0.06)'
};

const Sidebar = () => {
  const { logout, user, isSidebarOpen, setIsSidebarOpen } = useApp();
  const location = useLocation();

  const close = () => setIsSidebarOpen(false);

  const sidebarGroups = [
    {
      title: 'Field Systems',
      links: [
        { name: 'Soil Monitor', path: '/soil-monitoring', icon: Sprout },
        { name: 'Irrigation System', path: '/irrigation', icon: Droplets },
        { name: 'Weather Station', path: '/weather', icon: CloudRain },
        { name: 'Storage Monitor', path: '/storage-hub', icon: Archive },
      ]
    },
    {
      title: 'Intelligence & Vision',
      links: [
        { name: 'Farm Reports', path: '/reports', icon: FileText },
        { name: 'Field Vision', path: '/camera', icon: Camera },
        { name: 'Bharat Advisor', path: '/crop-advisor', icon: Sparkles },
        { name: 'Product Journey', path: '/traceability', icon: Map },
      ]
    },
    {
      title: 'Infrastructure',
      links: [
        { name: 'Device Manager', path: '/device-area', icon: Network },
        { name: 'Settings', path: '/settings', icon: SettingsIcon },
        { name: 'Soil Forensics', path: '/precision-soil-testing', icon: FlaskConical },
      ]
    }
  ];

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '270px', zIndex: 10002,
          background: 'linear-gradient(165deg, #064E3B 0%, #022C22 100%)', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: isSidebarOpen ? '20px 0 60px rgba(0,0,0,0.4)' : 'none',
          borderRight: '1px solid rgba(255,255,255,0.03)'
        }}
      >
        <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${COLORS.border}`, position: 'relative' }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={close} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.03)', border: 'none', borderRadius: '10px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="rgba(255,255,255,0.3)" />
          </motion.button>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <img src={user?.photo || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=200'} style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover', border: `1px solid ${COLORS.border}` }} />
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>{user?.name || 'Guest Farmer'}</div>
              <div style={{ fontSize: '0.68rem', color: COLORS.textMuted, marginTop: '1px', fontWeight: 600 }}>{user?.location || 'Set farm location'}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 10px', overflowY: 'auto', flex: 1 }} className="no-scrollbar">
          {sidebarGroups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '0.62rem', fontWeight: 800, color: '#FFFFFF', opacity: 0.35, padding: '0 12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{group.title}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {group.links.map((link, li) => {
                  const NavIcon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <NavLink key={li} to={link.path} onClick={close}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '9px 12px', borderRadius: '10px', background: isActive ? COLORS.activeBg : 'transparent', color: isActive ? COLORS.primary : 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: isActive ? 700 : 600, fontSize: '0.88rem' }}>
                      <div style={{ width: '32px', display: 'flex', justifyContent: 'center' }}><NavIcon size={18} /></div>
                      <span style={{ flex: 1 }}>{link.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 20px', borderTop: `1px solid ${COLORS.border}`, background: 'rgba(0,0,0,0.12)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#FFF', fontWeight: 700, letterSpacing: '0.06em', opacity: 0.15 }}>ADVISOR ENGINE V17.1.0</div>
            <div style={{ fontSize: '0.55rem', color: COLORS.primary, fontWeight: 800, marginTop: '2px', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.3 }}>AgriSense Industrial</div>
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
