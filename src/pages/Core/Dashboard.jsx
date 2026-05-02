/**
 * AgriSense Pro v17.1.0 Dashboard
 * High-level overview of farm health, core metrics, and active controls.
 */

// ─── IMPORTS ────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, Droplets, CloudRain, Archive,
  MapPin, Activity, Power, ChevronRight,
  ShieldCheck, RefreshCw, Camera, WifiOff,
  BellRing, Lightbulb, Wifi, ArrowUp, ArrowDown,
  CheckCircle, BarChart3
} from 'lucide-react';

// Context & Utils
import { useApp } from '../../state/AppContext';
import { getHealthColor } from '../../logic/healthEngine';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  primaryDark: '#059669',
  secondary: '#0EA5E9',
  background: '#FFFFFF',
  cardBg: '#FFFFFF',
  textMain: '#0F172A',
  textMuted: '#64748B',
  border: 'rgba(0, 0, 0, 0.04)',
};

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const isActive = status && status !== 'OFFLINE';
  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: '6px', 
      background: isActive ? '#ECFDF5' : '#FEF2F2', 
      padding: '6px 12px', borderRadius: '12px',
      border: `1px solid ${isActive ? '#10B98130' : '#EF444430'}`,
      transition: '0.3s'
    }}>
      <motion.div 
        animate={{ opacity: [1, 0.5, 1] }} 
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#10B981' : '#EF4444' }} 
      />
      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: isActive ? '#059669' : '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
        System {isActive ? 'Active' : 'Offline'}
      </span>
    </div>
  );
};

/**
 * HealthOverview: Circular progress and system status dots
 */
/**
 * HealthOverview: Premium hero card with circular status and system node grid
 */
const HealthOverview = ({ score, systemHealth }) => {
  const { devices } = useApp();
  const isOffline = score === null || score === 0;
  const healthColor = isOffline ? '#EF4444' : getHealthColor(score);

  const visionOnline = devices?.vision_node?.status === 'ACTIVE' || devices?.vision_node?.status === 'PARTIAL';
  const activeNodesCount = Object.values(devices || {})
    .filter(d => d?.device_id?.endsWith('_node') && d?.status === 'ACTIVE').length
    + (visionOnline ? 1 : 0);
  const totalNodesCount = 5;

  const systems = [
    { label: 'Soil',       icon: Sprout,    color: '#10B981', active: systemHealth?.soil      != null },
    { label: 'Weather',    icon: CloudRain, color: '#F97316', active: systemHealth?.weather   != null },
    { label: 'Irrigation', icon: Droplets,  color: '#3B82F6', active: systemHealth?.water     != null },
    { label: 'Storage',    icon: Archive,   color: '#8B5CF6', active: systemHealth?.storage   != null },
    { label: 'Vision',     icon: Camera,    color: '#A855F7', active: visionOnline },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: isOffline ? 'linear-gradient(165deg, #F8FAFC 0%, #F1F5F9 100%)' : 'linear-gradient(165deg, #ECFDF5 0%, #FFFFFF 100%)', borderRadius: '24px', padding: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)',
        marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Left: Circular Progress Area (Compacted) */}
      <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#F1F5F9" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r="44" fill="none"
            stroke={healthColor}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray="276"
            initial={{ strokeDashoffset: 276 }}
            animate={{ strokeDashoffset: 276 - (276 * (isOffline ? 20 : score || 0) / 100) }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center'
        }}>
          {isOffline && <WifiOff size={18} color="#EF4444" style={{ marginBottom: '2px' }} />}
          <div style={{ 
            fontSize: '0.75rem', fontWeight: 900, color: healthColor, 
            textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 
          }}>
            {isOffline ? 'OFF' : (score >= 80 ? 'OPT' : 'OK')}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 950, color: COLORS.textMain, marginTop: '1px' }}>
            {isOffline ? `0/${totalNodesCount}` : `${Math.round(score)}%`}
          </div>
        </div>
      </div>

      {/* Right: Status Text and Icon Grid */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: COLORS.textMain, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {isOffline ? 'System Offline' : 'Operational'}
        </h2>
        <p style={{ margin: '1px 0 0', fontSize: '0.75rem', fontWeight: 600, color: COLORS.textMuted }}>
          {activeNodesCount} of {totalNodesCount} nodes active
        </p>
        
        {/* Node Icon Row (Compacted) */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
          {systems.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  height: '34px', borderRadius: '10px',
                  background: 'white', border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '2px'
                }}>
                  <Icon size={14} color={s.active ? s.color : '#CBD5E1'} strokeWidth={2.5} />
                </div>
                <div style={{ fontSize: '0.45rem', fontWeight: 900, color: COLORS.textMuted, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {s.label.substring(0, 4)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Sparkline: Smooth wavy SVG path with a soft glow/shadow
 */
const Sparkline = ({ color, height = 28, width = 75 }) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} 25`} style={{ overflow: 'visible', filter: `drop-shadow(0 4px 4px ${color}30)` }}>
      <motion.path
        d={`M 0,18 C 10,12 15,22 25,14 S 40,8 55,18 S 65,12 75,18`}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
      />
    </svg>
  );
};

/**
 * WeatherBars: Mini bar chart for the weather card
 */
const WeatherBars = ({ color }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '24px' }}>
    {[6, 12, 18, 24].map((h, i) => (
      <motion.div
        key={i}
        initial={{ height: 0 }}
        animate={{ height: `${h}px` }}
        transition={{ delay: i * 0.1, duration: 0.5 }}
        style={{ width: '6px', background: `${color}40`, borderRadius: '2px' }}
      />
    ))}
  </div>
);

const InsightsCard = ({ sensorData, sensorHistory }) => {
  const getInsights = () => {
    const list = [];
    if (!sensorData || !sensorHistory || sensorHistory.length < 1) {
      return [
        { text: 'Waiting for hardware sync...', icon: Activity, color: '#94A3B8', bg: '#F1F5F9' },
        { text: 'Diagnostic engine starting', icon: RefreshCw, color: '#94A3B8', bg: '#F1F5F9' }
      ];
    }

    // 1. Soil Intelligence
    const currM = sensorData.soil?.moisture;
    const pastM = sensorHistory[0]?.soil?.moisture;
    if (currM != null) {
      const diff = pastM != null ? (currM - pastM) : 0;
      let text = `Soil Moisture: ${currM.toFixed(0)}%`;
      if (Math.abs(diff) >= 1) {
        text = diff < 0 ? `Moisture decreased by ${Math.abs(diff).toFixed(0)}%` : `Moisture increased by ${diff.toFixed(0)}%`;
      } else {
        text = `Soil Moisture: Stable at ${currM.toFixed(0)}%`;
      }
      list.push({
        text,
        icon: diff < 0 ? ArrowDown : (diff > 0 ? ArrowUp : Sprout),
        color: diff < 0 ? '#3B82F6' : '#10B981',
        bg: diff < 0 ? '#EFF6FF' : '#ECFDF5'
      });
    }

    // 2. Thermal Trends
    const currT = sensorData.weather?.temp;
    const pastT = sensorHistory[0]?.weather?.temp;
    if (currT != null) {
      const diff = pastT != null ? (currT - pastT) : 0;
      let text = `Ambient Temp: ${currT.toFixed(1)}°C`;
      if (Math.abs(diff) >= 0.2) {
        text = diff > 0 ? `Temp increased by ${diff.toFixed(1)}°C` : `Temp decreased by ${Math.abs(diff).toFixed(1)}°C`;
      }
      list.push({
        text,
        icon: diff > 0 ? ArrowUp : ArrowDown,
        color: diff > 0 ? '#EF4444' : '#0EA5E9',
        bg: diff > 0 ? '#FEF2F2' : '#F0F9FF'
      });
    }

    // 3. Resource Management
    const level = sensorData.water?.level;
    if (level != null) {
      list.push({
        text: `Irrigation Tank: ${level.toFixed(0)}% Full`,
        icon: Droplets,
        color: '#3B82F6',
        bg: '#EFF6FF'
      });
    }

    // 4. Actionable Intelligence
    const isDry = currM != null && currM < 35;
    const isRaining = sensorData.weather?.rainLevel > 0;
    
    let recText = 'Optimal moisture levels';
    let recIcon = CheckCircle;
    let recColor = '#10B981';
    let recBg = '#ECFDF5';

    if (isRaining) {
      recText = 'Raining: Irrigation suspended';
      recIcon = CloudRain;
      recColor = '#3B82F6';
      recBg = '#EFF6FF';
    } else if (isDry) {
      recText = 'Critical: Irrigation required';
      recIcon = BellRing;
      recColor = '#F59E0B';
      recBg = '#FFFBEB';
    }

    list.push({ text: recText, icon: recIcon, color: recColor, bg: recBg });

    return list.slice(0, 4);
  };

  const activeInsights = getInsights();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', borderRadius: '24px', padding: '1.25rem',
        border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)',
        marginBottom: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
        <div style={{ 
          width: '32px', height: '32px', borderRadius: '10px', background: '#DCFCE7', 
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <BarChart3 size={18} color="#10B981" strokeWidth={2.5} />
        </div>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: COLORS.textMain }}>Today's Insights</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activeInsights.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '28px', height: '28px', borderRadius: '50%', background: item.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <item.icon size={14} color={item.color} strokeWidth={3} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>{item.text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const SensorCard = ({ title, value, icon: Icon, color, status, score, onClick, nodeType }) => {
  const isConnected = status === 'CONNECTED' || status === 'ACTIVE' || status === 'PARTIAL';
  const systemColor = { soil: '#10B981', irrigation: '#3B82F6', water: '#3B82F6', weather: '#F97316', storage: '#8B5CF6', vision: '#A855F7' }[nodeType] || color;
  const healthColor = !isConnected ? '#CBD5E1' : (score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }} onClick={onClick}
      style={{
        background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', borderRadius: '24px', padding: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        display: 'flex', gap: '12px', height: '96px', alignItems: 'center'
      }}
    >
      <div style={{ 
        width: '52px', height: '52px', borderRadius: '16px', background: `${systemColor}08`, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${systemColor}05`, flexShrink: 0
      }}>
        <Icon size={26} color={systemColor} strokeWidth={2.5} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 800, marginBottom: '1px' }}>{title}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 950, color: healthColor, letterSpacing: '-0.05em', lineHeight: 1 }}>
          {score != null ? `${Math.round(score)}%` : '--'}
        </div>
      </div>
    </motion.div>
  );
};

// ─── CAM & CONTROLS CARDS ──────────────────────────────────────────────────
const CamCard = ({ isOnline, onClick }) => (
  <motion.div
    whileTap={{ scale: 0.98 }} onClick={onClick}
    style={{
      background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', borderRadius: '24px', padding: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)',
      cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0',
      height: '186px', width: '100%', boxSizing: 'border-box'
    }}
  >
    <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', height: '100%', background: '#0F172A' }}>
      {isOnline ? (
        <img 
          src="http://192.168.4.2:81/stream" 
          alt="Field" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <img src="file:///C:/Users/polu1/.gemini/antigravity/brain/f861e518-2409-4f42-a157-691898edc51a/farm_field_camera_view_1777741743015.png" alt="Field" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
      )}
      
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: isOnline ? 'transparent' : 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!isOnline && (
          <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
            <WifiOff size={20} color="#fff" />
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 8px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOnline ? '#10B981' : '#EF4444' }} />
        <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'white' }}>{isOnline ? 'LIVE FEED' : 'OFFLINE'}</span>
      </div>
    </div>
  </motion.div>
);

const ControlsCard = ({ actuators, toggleActuator, ACTUATORS }) => {
  const controls = [
    { key: ACTUATORS?.PUMP, label: 'Pump', icon: Droplets, color: '#3B82F6', bg: '#EFF6FF' },
    { key: ACTUATORS?.BUZZER, label: 'Buzz', icon: BellRing, color: '#EF4444', bg: '#FEF2F2' },
    { key: ACTUATORS?.LIGHT, label: 'Light', icon: Lightbulb, color: '#F59E0B', bg: '#FFFBEB' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)', borderRadius: '24px', padding: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)',
        display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center',
        width: '100%', boxSizing: 'border-box', marginBottom: '1.2rem'
      }}
    >
      <div style={{ display: 'flex', gap: '8px' }}>
        {controls.map((c) => {
          const isOn = actuators?.[c.key] ?? false;
          return (
            <div key={c.label} style={{ 
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', 
              padding: '12px 4px', borderRadius: '20px', border: '1px solid #F1F5F9', background: '#FFFFFF' 
            }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.icon size={20} color={c.color} strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A' }}>{c.label}</div>
              <div onClick={() => toggleActuator(c.key)} style={{ 
                width: '36px', height: '18px', borderRadius: '10px', 
                background: isOn ? c.color : '#E2E8F0', position: 'relative', cursor: 'pointer', transition: '0.3s' 
              }}>
                <motion.div animate={{ x: isOn ? 18 : 2 }} style={{ position: 'absolute', top: '2px', left: 0, width: '14px', height: '14px', borderRadius: '50%', background: '#fff' }} />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    sensorData, farmHealthScore, systemHealth,
    toggleActuator, actuators, ACTUATORS,
    user, devices, farmInfo, syncData, currentGPS, sensorHistory
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  const visionOnline = devices?.vision_node?.status === 'ACTIVE' || devices?.vision_node?.status === 'PARTIAL';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    window.location.reload();
  };

  const isPumpActive = actuators ? actuators[ACTUATORS?.PUMP] : false;

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good Morning,';
    if (h < 17) return 'Good Afternoon,';
    if (h < 21) return 'Good Evening,';
    return 'Good Night,';
  };

  return (
    <div style={{ padding: '1.25rem', paddingBottom: '10px', background: COLORS.background, fontFamily: "'Outfit', sans-serif" }}>

      <section style={{ marginBottom: '1.8rem', padding: '0 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '0.9rem', fontWeight: 600, color: COLORS.textMuted, margin: 0 }}>
              {getGreeting()}
            </h1>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: COLORS.textMain, margin: '1px 0 0 0', letterSpacing: '-0.02em' }}>
              {user?.name || 'Guest Farmer'}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSync}
              style={{ 
                cursor: 'pointer', padding: '10px 18px', borderRadius: '18px', 
                background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '10px'
              }}
            >
              <motion.div animate={{ rotate: isSyncing ? 360 : 0 }} transition={{ duration: 1, repeat: isSyncing ? Infinity : 0, ease: "linear" }}>
                <RefreshCw size={18} color={isSyncing ? COLORS.primary : COLORS.textMuted} />
              </motion.div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.textMuted, letterSpacing: '0.05em' }}>SYNC</span>
            </motion.button>
          </div>
        </div>

        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: COLORS.textMuted, fontSize: '0.85rem', fontWeight: 600 }}>
          <MapPin size={15} color={COLORS.primary} />
          <span>{currentGPS?.city || (user?.location?.includes(',') ? 'Field Zone A' : user?.location) || 'Set farm location'}</span>
        </div>
      </section>

      <HealthOverview score={farmHealthScore} systemHealth={systemHealth} />

      <InsightsCard sensorData={sensorData} sensorHistory={sensorHistory} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.2rem' }}>
        <SensorCard
          title="Soil Health" nodeType="soil"
          icon={Sprout} color="#10B981"
          status={devices?.['soil_node']?.status || (sensorData?.soil?.moisture ? 'ACTIVE' : 'OFFLINE')}
          score={systemHealth?.soil}
          onClick={() => navigate('/soil-monitoring')}
        />
        <SensorCard
          title="Irrigation Health" nodeType="irrigation"
          icon={Droplets} color="#0EA5E9"
          status={devices?.['water_node']?.status || (sensorData?.water?.level ? 'ACTIVE' : 'OFFLINE')}
          score={systemHealth?.water}
          onClick={() => navigate('/irrigation')}
        />
        <SensorCard
          title="Weather Health" nodeType="weather"
          icon={CloudRain} color="#14B8A6"
          status={devices?.['weather_node']?.status || (sensorData?.weather?.temp ? 'ACTIVE' : 'OFFLINE')}
          score={systemHealth?.weather}
          onClick={() => navigate('/weather')}
        />
        <SensorCard
          title="Storage Health" nodeType="storage"
          icon={Archive} color="#8B5CF6"
          status={devices?.['storage_node']?.status || (sensorData?.storage?.temp ? 'ACTIVE' : 'OFFLINE')}
          score={systemHealth?.storage}
          onClick={() => navigate('/storage-hub')}
        />
      </div>

      <div style={{ marginBottom: '1.2rem' }}>
        <CamCard
          isOnline={visionOnline}
          onClick={() => navigate('/camera')}
        />
      </div>

      <ControlsCard
        actuators={actuators}
        toggleActuator={toggleActuator}
        ACTUATORS={ACTUATORS}
      />

      <footer style={{ textAlign: 'center', marginTop: '1.5rem', paddingBottom: '10px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          AgriSense Pro • v{farmInfo?.version || '2.8.0'}
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
