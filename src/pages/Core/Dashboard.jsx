/**
 * AgriSense Pro v18.0.0 "Ultra-Premium" Dashboard
 * Redesigned for flagship-level mobile experience with cinematic motion.
 */

// ─── IMPORTS ────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, Waves, CloudSun, Database, CloudRain, Droplets,
  MapPin, Activity, Power, ChevronRight,
  ShieldCheck, RefreshCw, Camera, WifiOff,
  BellRing, Lightbulb, Wifi, ArrowUp, ArrowDown,
  CheckCircle, BarChart3, Zap, Navigation
} from 'lucide-react';

// Context & Utils
import { useApp } from '../../state/AppContext';
import { useTelemetry } from '../../state/TelemetryContext';
import { getHealthColor } from '../../logic/healthEngine';

// ─── ANIMATION CONFIGS ──────────────────────────────────────────────────────
const springConfig = { type: "spring", stiffness: 300, damping: 30 };
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};
const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springConfig }
};

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

/**
 * HealthOverview: Cinematic Hero Card
 */
const HealthOverview = React.memo(({ score, systemHealth, devices }) => {
  const activeNodesCount = ['soil_node', 'water_node', 'weather_node', 'storage_node', 'vision_node']
    .filter(id => devices?.[id]?.status === 'ACTIVE' || devices?.[id]?.status === 'PARTIAL').length;
    
  const isOffline = score === null || score === 0 || activeNodesCount === 0;
  const healthColor = isOffline ? '#94A3B8' : getHealthColor(score);
  const visionOnline = devices?.vision_node?.status === 'ACTIVE' || devices?.vision_node?.status === 'PARTIAL';
  
  const totalNodesCount = 5;

  const systems = [
    { label: 'Soil', icon: Sprout, color: '#8B5E3C', active: systemHealth?.soil != null },
    { label: 'Weather', icon: CloudSun, color: '#3B82F6', active: systemHealth?.weather != null },
    { label: 'Irrigation', icon: Waves, color: '#06D6A0', active: systemHealth?.water != null },
    { label: 'Storage', icon: Database, color: '#64748B', active: systemHealth?.storage != null },
    { label: 'Vision', icon: Camera, color: '#7C3AED', active: visionOnline },
  ];

  return (
    <motion.div
      variants={itemFadeUp}
      style={{
        background: isOffline 
          ? 'linear-gradient(165deg, #f8fafc 0%, #f1f5f9 100%)' 
          : `linear-gradient(165deg, ${healthColor}15 0%, #ffffff 100%)`,
        borderRadius: 'var(--radius-xl)', 
        padding: '1.5rem',
        border: '1px solid var(--glass-stroke)',
        boxShadow: 'var(--shadow-premium)',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: `${healthColor}10`, filter: 'blur(40px)', borderRadius: '50%' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
          <svg width="90" height="90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="44" fill="none" stroke={healthColor} strokeWidth="10" strokeLinecap="round" strokeDasharray="276"
              initial={{ strokeDashoffset: 276 }}
              animate={{ strokeDashoffset: 276 - (276 * (isOffline ? 0 : score || 0) / 100) }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.05em' }}>
              {isOffline ? '--' : Math.round(score)}%
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              {isOffline ? 'System Offline' : 'Operational Status'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
            {isOffline ? 'Critical Fault' : (score >= 80 ? 'Excellent' : 'Stable Growth')}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {activeNodesCount} of {totalNodesCount} nodes broadcasting
          </p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
        {systems.map((s) => {
          const Icon = s.icon;
          const isActive = s.active && !isOffline;
          return (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '100%', height: '40px', borderRadius: '14px', background: isActive ? `${s.color}10` : 'rgba(0,0,0,0.02)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: isActive ? `1px solid ${s.color}20` : '1px solid transparent'
              }}>
                <Icon size={18} color={isActive ? s.color : '#94A3B8'} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
});

const SensorCard = React.memo(({ title, icon: Icon, color, status, score, onClick, nodeType }) => {
  const isConnected = status === 'CONNECTED' || status === 'ACTIVE' || status === 'PARTIAL';
  const systemColor = !isConnected ? '#94A3B8' : ({ soil: '#8B5E3C', irrigation: '#06D6A0', water: '#06D6A0', weather: '#3B82F6', storage: '#64748B', vision: '#7C3AED' }[nodeType] || color);
  const healthColor = !isConnected ? '#E2E8F0' : (score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444');

  return (
    <motion.div
      variants={itemFadeUp}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        background: isConnected 
          ? `linear-gradient(165deg, #ffffff 0%, ${systemColor}08 50%, ${systemColor}12 100%)` 
          : 'linear-gradient(165deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: 'var(--radius-xl)', padding: '1.25rem',
        border: '1px solid var(--glass-stroke)', boxShadow: 'var(--shadow-md)',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: '1rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '44px', height: '44px', borderRadius: '14px', 
          background: isConnected ? `${systemColor}12` : 'rgba(0,0,0,0.03)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          border: isConnected ? `1px solid ${systemColor}20` : '1px solid transparent'
        }}>
          <Icon size={22} color={systemColor} strokeWidth={2.5} />
        </div>
        <div style={{ fontSize: '0.8rem', color: isConnected ? 'var(--text-muted)' : '#94A3B8', fontWeight: 700 }}>{title}</div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 950, color: isConnected ? 'var(--text-main)' : '#94A3B8', letterSpacing: '-0.05em' }}>
            {score != null && isConnected ? Math.round(score) : '--'}
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#94A3B8' }}>%</span>
        </div>
      </div>

      {/* Progress Bar Mini */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: isConnected ? `${score || 0}%` : '0%' }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ height: '100%', background: healthColor, borderRadius: '3px' }} 
        />
      </div>
    </motion.div>
  );
});

const CamCard = React.memo(({ isOnline, onClick }) => (
  <motion.div
    variants={itemFadeUp}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{
      background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '0.75rem',
      border: '1px solid var(--glass-stroke)', boxShadow: 'var(--shadow-md)',
      cursor: 'pointer', position: 'relative', overflow: 'hidden',
      height: '220px', width: '100%'
    }}
  >
    <div style={{ position: 'relative', borderRadius: 'calc(var(--radius-xl) - 8px)', overflow: 'hidden', height: '100%', background: '#0F172A' }}>
      {isOnline ? (
        <motion.img 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          src="http://192.168.4.2:81/stream" 
          alt="Field" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <img src="file:///C:/Users/polu1/.gemini/antigravity/brain/f861e518-2409-4f42-a157-691898edc51a/farm_field_camera_view_1777741743015.png" alt="Field" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
      )}
      
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
        background: isOnline ? 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, transparent 70%, rgba(0,0,0,0.3) 100%)' : 'rgba(15, 23, 42, 0.4)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        {!isOnline && (
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
            <WifiOff size={24} color="#fff" />
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', top: '16px', left: '16px', padding: '6px 12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'white', letterSpacing: '0.05em' }}>Vision Feed</span>
      </div>

      <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)' }}>
          <Navigation size={18} color="#fff" />
        </div>
      </div>
    </div>
  </motion.div>
));

const ControlsCard = React.memo(({ actuators, toggleActuator, ACTUATORS }) => {
  const controls = [
    { key: ACTUATORS?.PUMP, label: 'Pump', icon: Droplets, color: '#3B82F6', bg: '#EFF6FF' },
    { key: ACTUATORS?.BUZZER, label: 'Siren', icon: BellRing, color: '#EF4444', bg: '#FEF2F2' },
    { key: ACTUATORS?.LIGHT, label: 'Light', icon: Lightbulb, color: '#F59E0B', bg: '#FFFBEB' },
  ];

  return (
    <motion.div
      variants={itemFadeUp}
      style={{
        background: 'linear-gradient(165deg, #ffffff 0%, #f8fafc 100%)', 
        borderRadius: 'var(--radius-xl)', padding: '1.25rem',
        border: '1px solid var(--glass-stroke)', boxShadow: 'var(--shadow-md)',
        display: 'flex', flexDirection: 'column', gap: '1rem',
        width: '100%', boxSizing: 'border-box', marginBottom: '1.2rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={18} color="var(--primary)" strokeWidth={2.5} />
        </div>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)' }}>Quick Controls</h3>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        {controls.map((c) => {
          const isOn = actuators?.[c.key] ?? false;
          return (
            <div key={c.label} style={{ 
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', 
              padding: '16px 8px', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)', 
              background: isOn ? `${c.color}08` : 'rgba(0,0,0,0.01)',
              transition: '0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isOn ? `0 4px 12px ${c.color}10` : 'none'
            }}>
              <div style={{ 
                width: '46px', height: '46px', borderRadius: '16px', 
                background: isOn ? c.color : 'rgba(0,0,0,0.04)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isOn ? `0 8px 16px ${c.color}30` : 'none',
                transition: '0.4s'
              }}>
                <c.icon size={22} color={isOn ? '#fff' : '#94A3B8'} strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isOn ? 'var(--text-main)' : '#94A3B8' }}>{c.label}</div>
              <motion.div 
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleActuator(c.key)} 
                style={{ 
                  width: '40px', height: '22px', borderRadius: '12px', 
                  background: isOn ? c.color : '#E2E8F0', position: 'relative', cursor: 'pointer', transition: '0.3s' 
                }}
              >
                <motion.div 
                  animate={{ x: isOn ? 20 : 2 }} 
                  transition={springConfig}
                  style={{ position: 'absolute', top: '2px', left: 0, width: '18px', height: '18px', borderRadius: '50%', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
                />
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
});

const InsightsCard = React.memo(({ sensorData, sensorHistory, navigate }) => {
  const activeInsights = useMemo(() => {
    const list = [];
    if (!sensorData || !sensorHistory || sensorHistory.length < 1) {
      return [
        { text: 'Synchronizing intelligence...', icon: Activity, color: '#94A3B8', bg: '#F1F5F9' },
        { text: 'Analyzing crop patterns', icon: RefreshCw, color: '#94A3B8', bg: '#F1F5F9' }
      ];
    }

    // 1. Soil Intelligence
    const currM = sensorData.soil?.moisture;
    const pastM = sensorHistory[0]?.soil?.moisture;
    if (currM != null) {
      const diff = (pastM != null) ? (currM - pastM) : 0;
      let text = `Soil Moisture: ${Number(currM).toFixed(0)}%`;
      if (Math.abs(diff) >= 1) {
        text = diff < 0 ? `Moisture decreased by ${Math.abs(diff).toFixed(0)}%` : `Moisture increased by ${diff.toFixed(0)}%`;
      }
      list.push({
        text,
        icon: diff < 0 ? ArrowDown : (diff > 0 ? ArrowUp : Sprout),
        color: diff < 0 ? 'var(--secondary)' : 'var(--primary)',
        bg: diff < 0 ? 'var(--secondary-soft)' : 'var(--primary-soft)'
      });
    }

    // 2. Thermal Trends
    const currT = sensorData.weather?.temp;
    const pastT = sensorHistory[0]?.weather?.temp;
    if (currT != null) {
      const diff = pastT != null ? (currT - pastT) : 0;
      let text = `Ambient Temp: ${currT.toFixed(1)}°C`;
      if (Math.abs(diff) >= 0.2) {
        text = diff > 0 ? `Temp rose by ${diff.toFixed(1)}°C` : `Temp fell by ${Math.abs(diff).toFixed(1)}°C`;
      }
      list.push({
        text,
        icon: diff > 0 ? ArrowUp : ArrowDown,
        color: diff > 0 ? 'var(--danger)' : 'var(--secondary)',
        bg: diff > 0 ? 'rgba(239, 68, 68, 0.08)' : 'var(--secondary-soft)'
      });
    }

    // 3. Resource Management
    const level = sensorData.water?.level;
    if (level != null) {
      list.push({
        text: `Irrigation Tank: ${level.toFixed(0)}% Full`,
        icon: Droplets,
        color: 'var(--secondary)',
        bg: 'var(--secondary-soft)'
      });
    }

    // 4. Actionable Intelligence
    const isDry = currM != null && currM < 35;
    const isRaining = sensorData.weather?.rainLevel > 0;
    
    let recText = 'Crop conditions optimal';
    let recIcon = CheckCircle;
    let recColor = 'var(--primary)';
    let recBg = 'var(--primary-soft)';

    if (isRaining) {
      recText = 'Precipitation: Irrigation paused';
      recIcon = CloudRain;
      recColor = 'var(--secondary)';
      recBg = 'var(--secondary-soft)';
    } else if (isDry) {
      recText = 'Alert: Low Soil Moisture';
      recIcon = BellRing;
      recColor = 'var(--accent)';
      recBg = 'rgba(245, 158, 11, 0.08)';
    }

    list.push({ text: recText, icon: recIcon, color: recColor, bg: recBg });

    return list.slice(0, 4);
  }, [sensorData, sensorHistory]);

  return (
    <motion.div
      variants={itemFadeUp}
      style={{
        background: 'linear-gradient(165deg, var(--primary-soft) 0%, #ffffff 100%)', 
        borderRadius: 'var(--radius-xl)', 
        padding: '1.5rem',
        border: '1px solid var(--glass-stroke)', 
        boxShadow: 'var(--shadow-lg)',
        marginBottom: '2rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
        <div style={{ 
          width: '36px', height: '36px', borderRadius: '12px', background: 'white', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <BarChart3 size={20} color="var(--primary)" strokeWidth={2.5} />
        </div>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>Intelligence</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {activeInsights.map((item, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + (i * 0.1) }}
            style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
          >
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '10px', background: item.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <item.icon size={16} color={item.color} strokeWidth={3} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.text}</span>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/reports')} 
        className="btn-premium"
        style={{
          width: '100%', marginTop: '1.5rem', background: 'white', color: 'var(--primary)',
          boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(0,0,0,0.02)'
        }}
      >
        ANALYSIS REPORT <ChevronRight size={16} />
      </motion.button>
    </motion.div>
  );
}, (prev, next) => prev.sensorData === next.sensorData && prev.sensorHistory === next.sensorHistory);

const WelcomeHeader = React.memo(() => {
  const { user } = useApp();
  const [time] = React.useState(new Date());
  const h = time.getHours();
  const greeting = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : h < 21 ? 'Good Evening' : 'Good Night';
  const firstName = (user?.name || user?.email || 'Farmer').split(' ')[0].split('@')[0];
  
  return (
    <div>
      <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-muted)', margin: 0, letterSpacing: '0.02em' }}>
        {greeting.toUpperCase()}
      </h1>
      <div style={{ fontSize: '2rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
        {firstName}
      </div>
    </div>
  );
});

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, farmInfo, actuators, toggleActuator, currentGPS, syncData, ACTUATORS } = useApp();
  const { sensorData, farmHealthScore, systemHealth, devices, sensorHistory } = useTelemetry();

  const [isSyncing, setIsSyncing] = useState(false);
  const visionOnline = devices?.vision_node?.status === 'ACTIVE' || devices?.vision_node?.status === 'PARTIAL';

  const handleSync = () => {
    setIsSyncing(true);
    syncData();
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{ padding: '1.25rem', paddingBottom: '140px' }}
    >
      {/* Header Section */}
      <motion.section variants={itemFadeUp} style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <WelcomeHeader />
          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 800 }}>
            <MapPin size={16} fill="var(--primary-soft)" />
            <span>{currentGPS?.city || 'Locating Field...'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {user?.email?.toLowerCase() === 'prolayjitbiswas14112004@gmail.com' && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/admin')}
              style={{ 
                width: '48px', height: '48px', borderRadius: '16px', 
                background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <ShieldCheck size={24} color="#dc2626" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSync}
            style={{ 
              width: '48px', height: '48px', borderRadius: '16px', 
              background: 'white', border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <motion.div animate={{ rotate: isSyncing ? 360 : 0 }} transition={{ duration: 1, repeat: isSyncing ? Infinity : 0, ease: "linear" }}>
              <RefreshCw size={24} color={isSyncing ? 'var(--primary)' : 'var(--text-muted)'} />
            </motion.div>
          </motion.button>
        </div>
      </motion.section>

      {/* Hero Health Overview */}
      <HealthOverview score={farmHealthScore} systemHealth={systemHealth} devices={devices} />

      {/* Sensor Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <SensorCard
          title="Soil Health" nodeType="soil"
          icon={Sprout} color="#8B5E3C"
          status={devices?.['soil_node']?.status || (sensorData?.soil?.moisture ? 'ACTIVE' : 'OFFLINE')}
          score={systemHealth?.soil}
          onClick={() => navigate('/soil-monitoring')}
        />
        <SensorCard
          title="Irrigation Health" nodeType="irrigation"
          icon={Waves} color="#06D6A0"
          status={devices?.['water_node']?.status || (sensorData?.water?.level ? 'ACTIVE' : 'OFFLINE')}
          score={systemHealth?.water}
          onClick={() => navigate('/irrigation')}
        />
        <SensorCard
          title="Weather Health" nodeType="weather"
          icon={CloudSun} color="#3B82F6"
          status={devices?.['weather_node']?.status || (sensorData?.weather?.temp ? 'ACTIVE' : 'OFFLINE')}
          score={systemHealth?.weather}
          onClick={() => navigate('/weather')}
        />
        <SensorCard
          title="Storage Health" nodeType="storage"
          icon={Database} color="#64748B"
          status={devices?.['storage_node']?.status || (sensorData?.storage?.temp ? 'ACTIVE' : 'OFFLINE')}
          score={systemHealth?.storage}
          onClick={() => navigate('/storage-hub')}
        />
      </div>

      {/* Camera View */}
      <CamCard
        isOnline={visionOnline}
        onClick={() => navigate('/camera')}
      />

      {/* Spacing */}
      <div style={{ height: '1.5rem' }} />

      {/* Controls */}
      <ControlsCard
        actuators={actuators}
        toggleActuator={toggleActuator}
        ACTUATORS={ACTUATORS}
      />

      {/* Intelligence/Insights */}
      <InsightsCard sensorData={sensorData} sensorHistory={sensorHistory} navigate={navigate} />

      <footer style={{ textAlign: 'center', marginTop: '1rem', paddingBottom: '10px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', opacity: 0.5 }}>
          AgriSense Pro Architecture • v{farmInfo?.version || '18.0.0'}
        </div>
      </footer>
    </motion.div>
  );
};

export default Dashboard;
