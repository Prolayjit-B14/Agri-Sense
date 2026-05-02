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
        { name: 'Soil Monitoring',     path: '/soil-monitoring',        icon: Sprout,        color: '#10B981' },
        { name: 'Weather Station',     path: '/weather',                icon: CloudRain,     color: '#F97316' },
        { name: 'Storage Hub',         path: '/storage-hub',            icon: Archive,       color: '#8B5CF6' },
        { name: 'Irrigation Control',  path: '/irrigation',             icon: Droplets,      color: '#3B82F6' },
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
        { name: 'Camera Feed',         path: '/camera',                 icon: Camera,        color: '#A855F7' },
        { name: 'Alerts',              path: '/alerts',                 icon: Bell,          color: '#eab308' },
        { name: 'My Account',          path: '/account',                icon: User,          color: '#8b5cf6' },
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
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '250px', zIndex: 10002,
          background: '#FFFFFF',
          display: 'flex', flexDirection: 'column',
          boxShadow: isSidebarOpen ? '20px 0 50px rgba(0,0,0,0.05)' : 'none',
          overflow: 'hidden'
        }}
      >
        {/* ── HEADER: USER PROFILE ── */}
        <div style={{ padding: '20px 18px 12px', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', background: '#f0fdf4', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 700, color: '#166534', flexShrink: 0
          }}>
            {clientName.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1f2937', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clientName}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{farmName}</div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            onClick={close}
            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#94a3b8' }}
          >
            <ChevronLeft size={18} />
          </motion.button>
        </div>

        {/* ── NAVIGATION ── */}
        <div style={{ flex: 1, overflowY: 'hidden', padding: '5px 0 10px' }}>
          {sidebarGroups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 18px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>{group.title}</span>
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
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '6px 18px',
                        textDecoration: 'none',
                        background: isActive ? `${link.color}10` : 'transparent',
                        borderLeft: isActive ? `3px solid ${link.color}` : '3px solid transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', 
                        background: isActive ? 'transparent' : `${link.color}08`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                      }}>
                        <NavIcon size={18} color={isActive ? link.color : `${link.color}bb`} strokeWidth={isActive ? 2.5 : 2} />
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
        <div style={{ padding: '12px 18px', borderTop: '1px solid #f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <Leaf size={18} color="#22c55e" fill="#22c55e" fillOpacity={0.1} />
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10B981', letterSpacing: '0.02em' }}>
              AGRISENSE <span style={{ color: '#1f2937' }}>PRO</span>
            </div>
          </div>
          <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, marginLeft: '26px' }}>
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
