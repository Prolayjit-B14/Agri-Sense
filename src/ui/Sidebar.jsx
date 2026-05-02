import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Settings as SettingsIcon,
  CloudRain, Archive, FlaskConical, Camera,
  Sparkles, BarChart2, Network, Bell,
  Sprout, Droplets, FileText, ShieldCheck,
  ChevronLeft, Leaf, User, PieChart, LayoutDashboard
} from 'lucide-react';
import { useApp } from '../state/AppContext';

const Sidebar = () => {
  const { user, isSidebarOpen, setIsSidebarOpen, farmInfo, mqttStatus } = useApp();
  const location = useLocation();
  const close = () => setIsSidebarOpen(false);

  const farmName     = farmInfo?.projectName || 'Field Zone A';
  const clientName   = user?.name || 'P';
  const isLive       = mqttStatus === 'connected';

  const sidebarGroups = [
    {
      title: 'FIELD',
      links: [
        { name: 'Soil Monitoring',     path: '/soil-monitoring',        icon: Leaf,          color: '#22c55e' },
        { name: 'Weather Station',     path: '/weather',                icon: CloudRain,     color: '#3b82f6' },
        { name: 'Storage Hub',         path: '/storage-hub',            icon: Archive,       color: '#f59e0b' },
        { name: 'Irrigation Control',  path: '/irrigation',             icon: Droplets,      color: '#06b6d4' },
      ]
    },
    {
      title: 'INSIGHTS',
      links: [
        { name: 'Soil Test',           path: '/precision-soil-testing', icon: FlaskConical,  color: '#a855f7' },
        { name: 'Analysis Hub',        path: '/analytics',              icon: PieChart,      color: '#6366f1' },
        { name: 'Farm Report',         path: '/reports',                icon: FileText,      color: '#ec4899' },
      ]
    },
    {
      title: 'SYSTEM',
      links: [
        { name: 'Device Management',   path: '/device-area',            icon: Network,       color: '#64748b' },
        { name: 'Camera Feed',         path: '/camera',                 icon: Camera,        color: '#14b8a6' },
        { name: 'Alerts',              path: '/alerts',                 icon: Bell,          color: '#eab308' },
      ]
    },
    {
      title: 'ACCOUNT',
      links: [
        { name: 'Profile',             path: '/profile',                icon: User,          color: '#8b5cf6' },
        { name: 'Settings',            path: '/settings',               icon: SettingsIcon,  color: '#94a3b8' },
      ]
    }
  ];

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '270px', zIndex: 10002,
          background: '#FFFFFF',
          display: 'flex', flexDirection: 'column',
          boxShadow: isSidebarOpen ? '20px 0 50px rgba(0,0,0,0.05)' : 'none',
        }}
      >
        {/* ── HEADER: USER PROFILE ── */}
        <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div style={{ 
            width: '44px', height: '44px', borderRadius: '50%', background: '#f0fdf4', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 700, color: '#166534', flexShrink: 0
          }}>
            {clientName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1f2937', lineHeight: 1.2 }}>{clientName}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{farmName}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLive ? '#22c55e' : '#94a3b8' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isLive ? '#22c55e' : '#64748b' }}>Live</span>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={close}
            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#94a3b8' }}
          >
            <ChevronLeft size={20} />
          </motion.button>
        </div>

        {/* ── NAVIGATION ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0 20px' }} className="no-scrollbar">
          {sidebarGroups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>{group.title}</span>
                <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {group.links.map((link, li) => {
                  const NavIcon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <NavLink 
                      key={li} 
                      to={link.path} 
                      onClick={close}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 20px',
                        textDecoration: 'none',
                        background: isActive ? `${link.color}12` : 'transparent',
                        borderLeft: isActive ? `4px solid ${link.color}` : '4px solid transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', 
                        background: isActive ? 'transparent' : `${link.color}08`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                      }}>
                        <NavIcon size={22} color={isActive ? link.color : `${link.color}bb`} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 800, 
                        color: isActive ? '#1f2937' : '#4b5563' 
                      }}>
                        {link.name}
                      </span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── FOOTER ── */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Leaf size={20} color="#22c55e" fill="#22c55e" fillOpacity={0.1} />
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10B981', letterSpacing: '0.02em' }}>
              AGRISENSE <span style={{ color: '#1f2937' }}>PRO</span>
            </div>
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, marginLeft: '30px' }}>
            v17.1.0
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
