import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  Settings as SettingsIcon, Bell, Shield, 
  RefreshCw, Globe, Moon, Sun, 
  Info, Cpu, Terminal, CheckCircle2,
  ChevronRight, LogOut, Code, User,
  Smartphone, Database, Palette, Brain
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

const Settings = () => {
  const { logout, isDarkMode, toggleTheme, farmInfo, updateBranding, profileMeta, updateProfileMeta } = useApp();

  return (
    <div style={{ padding: '1.5rem', background: COLORS.bg, minHeight: '100vh', paddingBottom: '100px' }}>
      
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 950, color: COLORS.text, margin: 0, letterSpacing: '-0.02em' }}>Platform Config</h2>
        <p style={{ color: COLORS.subtext, fontSize: '0.8rem', fontWeight: 700, marginTop: '4px' }}>Industrial System v{farmInfo?.version || '2.8.0'}</p>
      </header>

      {/* 1. CORE BRANDING */}
      <SettingSection title="Engine Identity" icon={Palette}>
        <div style={{ padding: '16px' }}>
           <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                 <p style={{ fontSize: '0.55rem', fontWeight: 900, color: COLORS.subtext, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Project Codename</p>
                 <input 
                    type="text" value={farmInfo?.projectName || ''} 
                    onChange={(e) => updateBranding({ projectName: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: `1px solid ${COLORS.border}`, background: '#F8FAFC', fontWeight: 700, color: COLORS.text, fontSize: '0.9rem', outline: 'none' }} 
                 />
              </div>
              <div>
                 <p style={{ fontSize: '0.55rem', fontWeight: 900, color: COLORS.subtext, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Client Identifier</p>
                 <input 
                    type="text" value={farmInfo?.name || ''} 
                    onChange={(e) => updateBranding({ name: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: `1px solid ${COLORS.border}`, background: '#F8FAFC', fontWeight: 700, color: COLORS.text, fontSize: '0.9rem', outline: 'none' }} 
                 />
              </div>
           </div>
        </div>
      </SettingSection>

      {/* 2. INTERFACE & AI */}
      <SettingSection title="Interface & Intelligence" icon={Cpu}>
        <SettingItem icon={isDarkMode ? Moon : Sun} label="Interstellar Dark Mode" type="toggle" enabled={isDarkMode} onClick={toggleTheme} />
        
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={16} color="#8B5CF6" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>AI Sensory Control</h4>
              <p style={{ fontSize: '0.65rem', color: COLORS.subtext, fontWeight: 600, margin: 0 }}>Current Sensitivity: <span style={{ color: COLORS.primary }}>{profileMeta.aiSensitivity}</span></p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '10px' }}>
            {['Low', 'Balanced', 'High'].map(lv => (
              <button key={lv} onClick={() => updateProfileMeta({ aiSensitivity: lv })} style={{ padding: '8px', borderRadius: '8px', border: 'none', background: profileMeta.aiSensitivity === lv ? 'white' : 'transparent', color: profileMeta.aiSensitivity === lv ? COLORS.primary : COLORS.subtext, fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', transition: '0.2s' }}>{lv}</button>
            ))}
          </div>
        </div>

        <SettingItem icon={Bell} label="Push Notifications" type="toggle" enabled={true} />
        <SettingItem icon={RefreshCw} label="Telemetry Sync Rate" value="1.5s" />
      </SettingSection>

      {/* 3. SYSTEM PROTOCOLS */}
      <SettingSection title="Protocol Matrix" icon={Terminal}>
        <SettingItem icon={Database} label="MQTT Gateway" value="Secure (TLS)" />
        <SettingItem icon={Globe} label="Region" value="Global/India" />
        <SettingItem icon={Info} label="Build Environment" value="Production" />
      </SettingSection>

      {/* 4. INDUSTRIAL FOOTER */}
      <div style={{ 
        background: '#0F172A', borderRadius: '28px', padding: '24px', 
        color: 'white', marginTop: '2rem', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Code size={24} color={COLORS.primary} />
          </div>
          <div>
            <p style={{ fontSize: '0.55rem', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase', margin: 0, letterSpacing: '0.1em' }}>Platform Architect</p>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Prolayjit Biswas</h4>
          </div>
        </div>
        <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.6 }}>Engine Version</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: COLORS.primary }}>v{farmInfo?.version || '2.8.0'}</span>
        </div>
      </div>

      <motion.button 
        whileTap={{ scale: 0.96 }}
        onClick={logout}
        style={{ width: '100%', padding: '16px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '16px', fontWeight: 800, fontSize: '0.9rem', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
      >
        <LogOut size={18} /> TERMINATE SESSION
      </motion.button>

    </div>
  );
};

export default Settings;
