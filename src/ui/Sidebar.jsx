import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Settings as SettingsIcon,
  CloudRain, Archive, FlaskConical, Camera,
  Sparkles, BarChart2, Network, Bell,
  Sprout, Droplets, FileText, ShieldCheck,
  ChevronLeft, ChevronRight, Leaf, User, PieChart, LayoutDashboard,
  ArrowRight
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
        { name: 'Soil Monitor',        path: '/soil-monitoring',        icon: Sprout,        color: '#10B981' },
        { name: 'Irrigation Control',  path: '/irrigation',             icon: Droplets,      color: '#3B82F6' },
        { name: 'Weather Station',     path: '/weather',                icon: CloudRain,     color: '#F97316' },
        { name: 'Storage Area',        path: '/storage-hub',            icon: Archive,       color: '#8B5CF6' },
      ]
    },
    {
      title: 'INSIGHTS',
      links: [
        { name: 'Soil Test',           path: '/precision-soil-testing', icon: FlaskConical,  color: '#a855f7' },
        { name: 'Farm Advisor',        path: '/crop-advisor',           icon: Sparkles,      color: '#f59e0b' },
        { name: 'Farm Report',         path: '/reports',                icon: FileText,      color: '#ec4899' },
        { name: 'Analytics Hub',       path: '/analytics',              icon: PieChart,      color: '#6366f1' },
      ]
    },
    {
      title: 'SYSTEM',
      links: [
        { name: 'Camera View',         path: '/camera',                 icon: Camera,        color: '#A855F7' },
        { name: 'Device Management',   path: '/device-area',            icon: Network,       color: '#64748b' },
        { name: 'My Account',          path: '/account',                icon: User,          color: '#8b5cf6' },
        { name: 'Alerts',              path: '/alerts',                 icon: Bell,          color: '#eab308' },
        ...(user?.email?.toLowerCase() === 'prolayjitbiswas14112004@gmail.com' ? [
          { name: 'Admin Panel',       path: '/admin',                  icon: ShieldCheck,   color: '#dc2626' }
        ] : [])
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
          background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)',
          display: 'flex', flexDirection: 'column',
          boxShadow: isSidebarOpen ? '20px 0 50px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)' : 'none',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255, 255, 255, 0.8)'
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
            <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
          </motion.button>
        </div>

        {/* ── NAVIGATION ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0 0' }}>
          {sidebarGroups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 18px', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>{group.title}</span>
                <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {group.links.map((link, li) => {
                  const NavIcon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <NavLink 
                      key={li} 
                      to={link.path} 
                      onClick={close}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '12px 18px',
                        textDecoration: 'none',
                        background: isActive ? `${link.color}10` : 'transparent',
                        borderLeft: isActive ? `3px solid ${link.color}` : '3px solid transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '12px', 
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '5px', overflow: 'hidden' }}>
              <img src="/src/assets/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10B981', letterSpacing: '0.02em' }}>
              AGRISENSE <span style={{ color: '#1f2937' }}>PRO</span>
            </div>
          </div>
          
          <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, marginLeft: '28px' }}>
            v{farmInfo?.version || '17.4.9'}
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
