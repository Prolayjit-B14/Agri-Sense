/**
 * AgriSense v2.8.0 Main Application Entry
 * Handles routing, global layout, and capacitor event listeners.
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutGrid, LineChart, Cpu,
  Camera, Bell, User,
  Settings as SettingsIcon, FlaskConical
} from 'lucide-react';

// Context & State
import { AppProvider, useApp } from './context/AppContext';

// Reusable Components
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';

// Pages (Main Screens)
import Login from './pages/Login';
import Splash from './pages/Splash';
import Dashboard from './pages/Dashboard';
import SoilMonitoring from './pages/SoilMonitoring';
import IrrigationControl from './pages/IrrigationControl';
import VisualMonitoring from './pages/VisualMonitoring';
import Profile from './pages/Profile';
import MapView from './pages/MapView';
import Alerts from './pages/Alerts';
import WeatherMonitoring from './pages/WeatherMonitoring';
import DeviceManagement from './pages/DeviceManagement';
import AnalyticsHub from './pages/AnalyticsHub';
import Settings from './pages/Settings';
import PrecisionSoilTesting from './pages/PrecisionSoilTesting';
import Reports from './pages/Reports';
import StorageMonitoring from './pages/StorageMonitoring';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    style={{ height: '100%', width: '100%' }}
  >
    {children}
  </motion.div>
);

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'Home', path: '/dashboard', icon: LayoutGrid },
    { id: 'Soil Test', path: '/precision-soil-testing', icon: FlaskConical },
    { id: 'Analytics', path: '/analytics', icon: LineChart },
    { id: 'Devices', path: '/device-area', icon: Cpu },
    { id: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <nav style={{
      position: 'relative', background: '#FFFFFF', borderTop: '1px solid #F1F5F9',
      height: '65px', display: 'flex', justifyContent: 'space-around',
      alignItems: 'center', padding: '0 10px', zIndex: 1000,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.03)', flexShrink: 0
    }}>
      {tabs.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <motion.button
            key={item.path} whileTap={{ scale: 0.9 }}
            onClick={() => navigate(item.path)}
            style={{
              background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '2px', color: isActive ? '#10B981' : '#94A3B8',
              padding: '4px 0', flex: 1, cursor: 'pointer', transition: '0.3s'
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span style={{ fontSize: '0.55rem', fontWeight: isActive ? 950 : 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.id}</span>
          </motion.button>
        );
      })}
    </nav>
  );
};

const MainLayout = ({ children }) => {
  const location = useLocation();
  const mainRef = React.useRef(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [location.pathname]);

  const titles = {
    '/dashboard': 'Dashboard',
    '/analytics': 'Analytics',
    '/irrigation': 'Irigataion Control',
    '/weather': 'Weather Station',
    '/soil-monitoring': 'Soil Monitor',
    '/storage-hub': 'Storage Monitor',
    '/device-area': 'Device Managmenet',
    '/camera': 'Camera',
    '/alerts': 'Alerts',
    '/profile': 'Profile',
    '/settings': 'Settings',
    '/reports': 'Farm Report',
    '/map-view': 'Feild map',
    '/precision-soil-testing': 'Soil Test'
  };

  return (
    <div style={{ height: '100dvh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F8FAFC' }}>
      <TopBar title={titles[location.pathname] || 'Agri Sense'} />
      <main ref={mainRef} style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%', paddingBottom: '10px' }}>
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <BottomNav />
      <Sidebar />
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let listener;
    const initListener = async () => {
      try {
        if (CapApp && typeof CapApp.addListener === 'function') {
          listener = await CapApp.addListener('backButton', () => {
            if (['/dashboard', '/login', '/'].includes(location.pathname)) {
              CapApp.exitApp();
            } else {
              navigate(-1);
            }
          });
        }
      } catch (e) {
        console.warn("Capacitor listener setup failed:", e);
      }
    };

    initListener();
    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, [location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
      <Route path="/analytics" element={<MainLayout><AnalyticsHub /></MainLayout>} />
      <Route path="/soil-monitoring" element={<MainLayout><SoilMonitoring /></MainLayout>} />
      <Route path="/irrigation" element={<MainLayout><IrrigationControl /></MainLayout>} />
      <Route path="/storage-hub" element={<MainLayout><StorageMonitoring /></MainLayout>} />
      <Route path="/camera" element={<MainLayout><VisualMonitoring /></MainLayout>} />
      <Route path="/device-area" element={<MainLayout><DeviceManagement /></MainLayout>} />
      <Route path="/map-view" element={<MainLayout><MapView /></MainLayout>} />
      <Route path="/alerts" element={<MainLayout><Alerts /></MainLayout>} />
      <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
      <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
      <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
      <Route path="/weather" element={<MainLayout><WeatherMonitoring /></MainLayout>} />
      <Route path="/precision-soil-testing" element={<MainLayout><PrecisionSoilTesting /></MainLayout>} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}
