/**
 * Farm Advisor Pro v17.1.0 Main Application Entry
 * Handles routing, global layout, and organized page imports.
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutGrid, LineChart, Cpu,
  Camera, Bell, User, Leaf,
  Settings as SettingsIcon, FlaskConical, Sparkles,
  AlertCircle, AlertTriangle
} from 'lucide-react';

// Context & State
import { AppProvider, useApp } from './state/AppContext';

// Reusable Components
import TopBar from './ui/TopBar';
import Sidebar from './ui/Sidebar';
import AgriBot from './ui/AgriBot';

// Pages - Organized Structure
import Login from './pages/Auth/Login';
import Splash from './pages/Auth/Splash';
import Account from './pages/Auth/Account';
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
      position: 'relative', background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', borderTop: '1px solid rgba(255, 255, 255, 0.8)',
      height: '65px', display: 'flex', justifyContent: 'space-around',
      alignItems: 'center', padding: '0 10px', zIndex: 1000,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.03), inset 0 1px 1px rgba(255,255,255,0.9)', flexShrink: 0
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

// ─── ERROR BOUNDARY ────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("AgriSense Crash Detected:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <AlertCircle size={32} color="#EF4444" />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Interface Conflict</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '8px', marginBottom: '1.5rem' }}>A diagnostic module encountered an unexpected state. Re-synchronizing may resolve the issue.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '12px 24px', borderRadius: '14px', background: '#10B981', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
          >
            RE-SYNC PLATFORM
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainLayout = ({ children }) => {
  const location = useLocation();
  const mainRef = React.useRef(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [location.pathname]);

  const titles = {
    '/dashboard':              'Dashboard',
    '/soil-monitoring':        'Soil Monitor',
    '/irrigation':             'Irrigation Control',
    '/weather':                'Weather Station',
    '/storage-hub':            'Storage Area',
    '/camera':                 'Camera View',
    '/device-area':            'Device Management',
    '/precision-soil-testing': 'Soil Test',
    '/crop-advisor':           'Farm Advisor',
    '/reports':                'Farm Report',
    '/analytics':              'Analytics Hub',
    '/account':                'My Account',
    '/alerts':                 'Alerts',
    '/profile':                'My Account',
    '/settings':               'My Account',
    '/admin':                  'Admin Panel',
  };

  return (
    <div style={{ height: '100dvh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FFFFFF' }}>
      <TopBar title={titles[location.pathname] || 'AgriSense'} />
      <main ref={mainRef} style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%', paddingBottom: '10px' }}>
          <AnimatePresence>
            <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <BottomNav />
      <Sidebar />
      <AgriBot />
    </div>
  );
};

const AppRoutes = () => {
  const app = useApp();
  if (!app) return null; // Safety gate
  const { user, isDataLoading, isDarkMode, cloudSyncStatus, setIsDataLoading } = app;
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

          urlListener = await CapApp.addListener('appUrlOpen', (data) => {
            console.log('🔗 AgriSense Deep Link Detected:', data.url);
            if (data.url.includes('google') || data.url.includes('firebase')) {
              window.location.reload();
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


  const isPublicRoute = ['/', '/login'].includes(location.pathname);


  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={(!user || user.isGuest) ? <Login /> : <Navigate to="/dashboard" />} />
      
      {/* 🛠️ PERSISTENT LAYOUT WRAPPER: Prevents layout re-mounting on every navigation */}
      <Route element={<MainLayout><Outlet /></MainLayout>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<AnalyticsHub />} />
        <Route path="/soil-monitoring" element={<SoilMonitor />} />
        <Route path="/irrigation" element={<IrrigationSystem />} />
        <Route path="/storage-hub" element={<StorageMonitor />} />
        <Route path="/camera" element={<VisualMonitor />} />
        <Route path="/device-area" element={<DeviceManager />} />
        <Route path="/alerts" element={<AlertCenter />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/account" element={<Account />} />
        <Route path="/weather" element={<WeatherMonitor />} />
        <Route path="/precision-soil-testing" element={<SoilForensics />} />
        <Route path="/crop-advisor" element={<FarmAdvisor />} />
        <Route path="/admin" element={user?.email?.toLowerCase() === 'prolayjitbiswas14112004@gmail.com' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
      </Route>

      <Route path="/profile" element={<Navigate to="/account" />} />
      <Route path="/settings" element={<Navigate to="/account" />} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

export default function App() {
  return (
    <Router>
      <AppProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AppProvider>
    </Router>
  );
}
