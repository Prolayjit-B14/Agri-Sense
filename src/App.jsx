/**
 * Farm Advisor Pro v17.1.0 Main Application Entry
 * Handles routing, global layout, and organized page imports.
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutGrid, LineChart, Cpu,
  Camera, Bell, User, Leaf,
  Settings as SettingsIcon, FlaskConical, Sparkles
} from 'lucide-react';

// Context & State
import { AppProvider, useApp } from './state/AppContext';

// Reusable Components
import TopBar from './ui/TopBar';
import Sidebar from './ui/Sidebar';

// Pages - Organized Structure
import Login from './pages/Auth/Login';
import Splash from './pages/Auth/Splash';
import Profile from './pages/Auth/Profile';
import Settings from './pages/Auth/Settings';
import AdminDashboard from './pages/Auth/AdminDashboard';


import { MASTER_CONFIG } from './setup';

import Dashboard from './pages/Core/Dashboard';
import AlertCenter from './pages/Core/AlertCenter';


import SoilMonitor from './pages/Monitoring/SoilMonitor';
import WeatherMonitor from './pages/Monitoring/WeatherMonitor';
import StorageMonitor from './pages/Monitoring/StorageMonitor';
import VisualMonitor from './pages/Monitoring/VisualMonitor';

import IrrigationSystem from './pages/Control/IrrigationSystem';
import DeviceManager from './pages/Control/DeviceManager';

import AnalyticsHub from './pages/Analytics/AnalyticsHub';
import Reports from './pages/Analytics/Reports';

import SoilForensics from './pages/Advisory/SoilForensics';
import FarmAdvisor from './pages/Advisory/FarmAdvisor';


const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'Home', path: '/dashboard', icon: LayoutGrid, color: '#22c55e' },
    { id: 'Soil Test', path: '/precision-soil-testing', icon: FlaskConical, color: '#a855f7' },
    { id: 'Advisor', path: '/crop-advisor', icon: Sparkles, color: '#f59e0b' },
    { id: 'Analytics', path: '/analytics', icon: LineChart, color: '#3b82f6' },
    { id: 'Devices', path: '/device-area', icon: Cpu, color: '#06b6d4' },
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
              alignItems: 'center', gap: '2px', color: isActive ? item.color : '#94A3B8',
              padding: '4px 0', flex: 1, cursor: 'pointer', transition: '0.3s',
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} color={isActive ? item.color : '#94A3B8'} />
            <span style={{ fontSize: '0.55rem', fontWeight: isActive ? 950 : 700, textTransform: 'uppercase' }}>{item.id}</span>
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
    '/analytics': 'Analytics Hub',
    '/irrigation':             'Irrigation System',
    '/weather':                'Weather Station',
    '/soil-monitoring':        'Soil Monitor',
    '/storage-hub':            'Storage Hub',
    '/device-area':            'Device Network',
    '/camera':                 'Field Vision',
    '/alerts':                 'Alert Center',
    '/profile':                'My Profile',
    '/settings':               'System Settings',
    '/reports':                'Farm Reports',
    '/precision-soil-testing': 'Soil Forensics',
    '/crop-advisor':           'AI Field Advisor',
    '/analytics':              'Analytics Hub',
  };

  return (
    <div style={{ height: '100dvh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F8FAFC' }}>
      <TopBar title={titles[location.pathname] || 'AgriSense'} />
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
  const { user, isDataLoading, isDarkMode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // ✋ LOADING GUARD: Wait for Cloud Sync to finish
    if (isDataLoading) return;

    // 🚀 DIRECT ACCESS: No more forced onboarding.
  }, [user, isDataLoading, location.pathname, navigate]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  useEffect(() => {
    let backListener;
    let urlListener;

    const initListeners = async () => {
      try {
        if (CapApp) {
          // 🔙 Back button handling
          backListener = await CapApp.addListener('backButton', () => {
            if (['/dashboard', '/login', '/'].includes(location.pathname)) {
              CapApp.exitApp();
            } else {
              navigate(-1);
            }
          });

          // 🔗 Deep Link handling (Fixes White Screen after Login)
          urlListener = await CapApp.addListener('appUrlOpen', (data) => {
            console.log('🔗 AgriSense Deep Link Detected:', data.url);
            if (data.url.includes('google') || data.url.includes('firebase')) {
              window.location.reload(); // Force refresh to pick up auth state
            }
          });
        }
      } catch (e) {
        console.warn("Capacitor listeners failed:", e);
      }
    };
    initListeners();
    return () => {
      backListener?.remove();
      urlListener?.remove();
    };
  }, [location.pathname, navigate]);


  if (isDataLoading) {
    return (
      <div style={{ 
        height: '100dvh', width: '100vw', background: '#042F2E', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Outfit', sans-serif", color: 'white'
      }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ marginBottom: '2rem' }}
        >
          <Leaf size={60} color="#10B981" />
        </motion.div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Syncing with Cloud</h2>
        <p style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '0.5rem' }}>Establishing secure handshake...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={(!user || user.isGuest) ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
      <Route path="/analytics" element={<MainLayout><AnalyticsHub /></MainLayout>} />
      <Route path="/soil-monitoring" element={<MainLayout><SoilMonitor /></MainLayout>} />
      <Route path="/irrigation" element={<MainLayout><IrrigationSystem /></MainLayout>} />
      <Route path="/storage-hub" element={<MainLayout><StorageMonitor /></MainLayout>} />
      <Route path="/camera" element={<MainLayout><VisualMonitor /></MainLayout>} />
      <Route path="/device-area" element={<MainLayout><DeviceManager /></MainLayout>} />
      <Route path="/alerts" element={<MainLayout><AlertCenter /></MainLayout>} />
      <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
      <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
      <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
      <Route path="/weather" element={<MainLayout><WeatherMonitor /></MainLayout>} />
      <Route path="/precision-soil-testing" element={<MainLayout><SoilForensics /></MainLayout>} />
      <Route path="/crop-advisor" element={<MainLayout><FarmAdvisor /></MainLayout>} />
      <Route path="/admin" element={user?.email?.toLowerCase() === 'prolayjitbiswas14112004@gmail.com' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

export default function App() {
  return (
    <Router>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </Router>
  );
}
