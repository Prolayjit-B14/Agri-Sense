import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Sprout, Droplets, 
  X, Map, Settings as SettingsIcon, 
  FileText, Activity, Network,
  CloudRain, Archive,
  LogOut, FlaskConical, Camera,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const { logout, user, isSidebarOpen, setIsSidebarOpen } = useApp();
  const location = useLocation();

  const close = () => setIsSidebarOpen(false);

  const sidebarGroups = [
    {
      title: 'Overview',
      links: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Analytics', path: '/analytics', icon: Activity },
        { name: 'Live Camera', path: '/camera', icon: Camera },
      ]
    },
    {
      title: 'Field Systems',
      links: [
        { name: 'Soil Monitor', path: '/soil-monitoring', icon: Sprout },
        { name: 'Irrigation', path: '/irrigation', icon: Droplets },
        { name: 'Weather', path: '/weather', icon: CloudRain },
        { name: 'Storage', path: '/storage-hub', icon: Archive },
      ]
    },
    {
      title: 'Tools',
      links: [
        { name: 'Devices', path: '/device-area', icon: Network },
        { name: 'Soil Lab', path: '/precision-soil-testing', icon: FlaskConical },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Field Map', path: '/map-view', icon: Map },
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
            style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(8px)' }}
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* DRAWER */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '250px', zIndex: 10002,
          background: '#0F172A', display: 'flex', flexDirection: 'column',
          boxShadow: '20px 0 50px rgba(0,0,0,0.2)', borderRight: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        {/* HEADER */}
        <div style={{
          padding: '32px 20px 24px', 
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(30px)' }} />
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={close}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
          >
            <X size={18} color="white" />
          </motion.button>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.4)', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=200" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="User" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1rem', fontWeight: 900, margin: 0, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Master Farmer'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34D399', boxShadow: '0 0 8px #34D399' }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.9)' }}>Enterprise</span>
              </div>
            </div>
          </div>
        </div>

        {/* NAV LINKS */}
        <div style={{ padding: '20px 14px', overflowY: 'auto', flex: 1 }} className="no-scrollbar">
          {sidebarGroups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', padding: '0 12px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                {group.title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {group.links.map((link, li) => {
                  const NavIcon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <NavLink key={li} to={link.path} onClick={close}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 14px', borderRadius: '14px',
                        background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                        color: isActive ? '#34D399' : 'rgba(255,255,255,0.6)',
                        textDecoration: 'none', fontWeight: isActive ? 800 : 600,
                        fontSize: '0.88rem', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: isActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent'
                      }}
                    >
                      <NavIcon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      <span style={{ flex: 1 }}>{link.name}</span>
                      {isActive && <motion.div layoutId="sidebarDot" style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#34D399' }} />}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div style={{ padding: '16px 14px 32px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavLink to="/settings" onClick={close}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '14px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}
          >
            <SettingsIcon size={18} strokeWidth={2} /> Settings
          </NavLink>
          <button onClick={() => { logout(); close(); }}
            style={{ width: '100%', padding: '14px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', transition: '0.2s' }}
          >
            <LogOut size={18} /> Sign Out
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
