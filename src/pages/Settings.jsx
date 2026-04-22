import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  Settings as SettingsIcon, Bell, Shield, 
  RefreshCw, Globe, Moon, Sun, 
  Info, Cpu, Terminal, CheckCircle2,
  ChevronRight, LogOut, Code, User,
  Smartphone, Database, Palette
} from 'lucide-react';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  secondary: '#3B82F6',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#1E293B',
  subtext: '#64748B',
  bg: '#F8FAFC',
  border: '#F1F5F9'
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const SettingSection = ({ title, icon: Icon, children }) => (
  <div style={{ marginBottom: '2rem' }}>
    <h3 style={{ fontSize: '0.75rem', fontWeight: 950, color: COLORS.subtext, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Icon size={14} /> {title}
    </h3>
    <div style={{ 
      background: 'white', borderRadius: '24px', padding: '0.5rem',
      border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
    }}>
      {children}
    </div>
  </div>
);

const SettingItem = ({ icon: Icon, label, value, type = 'text', onClick, enabled }) => (
  <div onClick={onClick} style={{ 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    padding: '14px 1.25rem', borderBottom: `1px solid ${COLORS.border}`,
    cursor: onClick ? 'pointer' : 'default'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={COLORS.subtext} />
      </div>
      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.text }}>{label}</span>
    </div>
    {type === 'toggle' ? (
      <div style={{ width: '48px', height: '24px', borderRadius: '12px', background: enabled ? COLORS.primary : '#E2E8F0', position: 'relative', transition: '0.3s', padding: '2px' }}>
        <motion.div animate={{ x: enabled ? 24 : 0 }} style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
      </div>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: COLORS.primary }}>{value}</span>
        {onClick && <ChevronRight size={14} color={COLORS.subtext} />}
      </div>
    )}
  </div>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const SettingsV4_0 = () => {
  const { logout, isDarkMode, toggleTheme, farmInfo, updateBranding } = useApp();

  return (
    <div style={{ padding: '1.25rem', background: COLORS.bg, minHeight: '100vh', paddingBottom: '100px' }}>
      
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>Settings</h2>
        <p style={{ color: COLORS.subtext, fontSize: '0.85rem', fontWeight: 700, marginTop: '4px' }}>System Configuration & Meta</p>
      </header>

      {/* 1. BRANDING HUB */}
      <SettingSection title="App Identity" icon={Palette}>
        <div style={{ padding: '1.25rem' }}>
           <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                 <p style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.subtext, marginBottom: '6px', textTransform: 'uppercase' }}>Master Project Name</p>
                 <input 
                    type="text" value={farmInfo?.projectName || ''} 
                    onChange={(e) => updateBranding({ projectName: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '14px', border: `1px solid ${COLORS.border}`, background: '#F8FAFC', fontWeight: 800, color: COLORS.text, fontSize: '0.9rem', outline: 'none' }} 
                 />
              </div>
              <div>
                 <p style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.subtext, marginBottom: '6px', textTransform: 'uppercase' }}>Farm / Client Identifier</p>
                 <input 
                    type="text" value={farmInfo?.name || ''} 
                    onChange={(e) => updateBranding({ name: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '14px', border: `1px solid ${COLORS.border}`, background: '#F8FAFC', fontWeight: 800, color: COLORS.text, fontSize: '0.9rem', outline: 'none' }} 
                 />
              </div>
              <div style={{ padding: '10px', background: `${COLORS.primary}08`, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Shield size={14} color={COLORS.primary} />
                 <span style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.primary }}>Identity changes are persistent and localized.</span>
              </div>
           </div>
        </div>
      </SettingSection>

      {/* 2. PREFERENCES */}
      <SettingSection title="System Preferences" icon={SettingsIcon}>
        <SettingItem icon={isDarkMode ? Moon : Sun} label="Interstellar Dark Mode" type="toggle" enabled={isDarkMode} onClick={toggleTheme} />
        <SettingItem icon={Bell} label="Push Notifications" type="toggle" enabled={true} />
        <SettingItem icon={Globe} label="Localization" value="Metric (SI)" onClick={() => {}} />
        <SettingItem icon={RefreshCw} label="Gateway Sync Rate" value="1.5s" onClick={() => {}} />
      </SettingSection>

      {/* 3. CONNECTIVITY */}
      <SettingSection title="Protocol Matrix" icon={Terminal}>
        <SettingItem icon={Database} label="MQTT Architecture" value="v3.1.1 (Secure)" />
        <SettingItem icon={Smartphone} label="Capacitor Engine" value="v8.0.2" />
        <SettingItem icon={Cpu} label="Hardware Bridge" value="ESP32-S3" />
      </SettingSection>

      {/* 4. DEVELOPER CREDIT */}
      <motion.div 
        whileTap={{ scale: 0.98 }}
        style={{ 
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', borderRadius: '32px', 
          color: 'white', marginTop: '2rem', padding: '1.75rem',
          boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.3)', position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Code size={26} color={COLORS.primary} />
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.6, textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Engineering Lead</p>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 950, margin: 0 }}>Prolayjit Biswas</h4>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.8 }}>Relase Version</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 950, color: COLORS.primary }}>v{farmInfo?.version || '2.8.0'} ULTRA</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.8 }}>System Integrity</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 950 }}>VERIFIED</span>
        </div>
      </motion.div>

      {/* LOGOUT */}
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={logout}
        style={{ width: '100%', height: '58px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '20px', fontWeight: 950, fontSize: '1rem', marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
      >
        <LogOut size={20} /> Terminate Session
      </motion.button>

    </div>
  );
};

export default SettingsV4_0;
