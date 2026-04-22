import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Sprout, Droplets,
  X, Map, Settings as SettingsIcon,
  FileText, Activity, Network,
  CloudRain, Archive,
  LogOut, FlaskConical, Camera,
  User as UserIcon
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
  const { logout, user, isSidebarOpen, setIsSidebarOpen, farmInfo } = useApp();
  const location = useLocation();

  const close = () => setIsSidebarOpen(false);

  const sidebarGroups = [
    {
      title: 'Field Systems',
      links: [
        { name: 'Soil Monitor', path: '/soil-monitoring', icon: Sprout },
        { name: 'Irrigation Control', path: '/irrigation', icon: Droplets },
        { name: 'Weather Station', path: '/weather', icon: CloudRain },
        { name: 'Storage Monitor', path: '/storage-hub', icon: Archive },
      ]
    },
    {
      title: 'Intelligence & Vision',
      links: [
        { name: 'Farm Report', path: '/reports', icon: FileText },
        { name: 'Feild map', path: '/map-view', icon: Map },
        { name: 'Field Vision', path: '/camera', icon: Camera },
      ]
    }
  ];

  return (
    <>
      {/* BACKDROP */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* DRAWER */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', zIndex: 10002,
          background: 'linear-gradient(165deg, #064E3B 0%, #022C22 100%)', display: 'flex', flexDirection: 'column',
          boxShadow: '20px 0 60px rgba(0,0,0,0.3)'
        }}
      >
        {/* HEADER */}
        <div style={{
          padding: '24px 24px 16px',
          borderBottom: `1px solid ${COLORS.border}`,
          position: 'relative'
        }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={close}
            style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={18} color="rgba(255,255,255,0.6)" />
          </motion.button>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${COLORS.border}` }}>
              <UserIcon size={24} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
                {user?.name || 'Guest User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: COLORS.textMuted, marginTop: '1px' }}>
                Field A-1
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION GROUPS */}
        <div style={{ padding: '16px 12px', overflowY: 'auto', flex: 1 }} className="no-scrollbar">
          {sidebarGroups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 600, color: COLORS.textMuted, padding: '0 10px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {group.title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {group.links.map((link, li) => {
                  const NavIcon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <NavLink key={li} to={link.path} onClick={close}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 12px', borderRadius: '12px',
                        background: isActive ? COLORS.activeBg : 'transparent',
                        color: isActive ? COLORS.primary : 'rgba(255,255,255,0.7)',
                        textDecoration: 'none', fontWeight: isActive ? 600 : 500,
                        fontSize: '0.9rem', transition: '0.2s ease-in-out'
                      }}
                    >
                      <NavIcon size={18} strokeWidth={isActive ? 2 : 1.8} />
                      <span style={{ flex: 1 }}>{link.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* VERSION FOOTER */}
        <div style={{ padding: '16px', textAlign: 'center', opacity: 0.15 }}>
          <div style={{ fontSize: '0.65rem', color: '#FFF', fontWeight: 600, letterSpacing: '0.05em' }}>
            AGRISENSE V{farmInfo?.version || "2.8.0"}
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

