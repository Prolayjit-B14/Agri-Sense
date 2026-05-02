/**
 * AgriSense Pro v17.1.0 – Device Network Dashboard
 * Real-time IoT hardware control interface with High-Fidelity Design.
 * Optimized for mobile viewport (500px max width).
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Sprout, CloudRain, Droplets, Archive,
  Camera, Wifi, WifiOff, BellRing, Lightbulb,
  Monitor, Zap, Signal, Thermometer, FlaskConical,
  Wind, Sun, Waves, Flame, RefreshCw, ExternalLink,
  ChevronDown, MapPin, ShieldCheck, Check, Settings2
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { ACTUATORS } from '../../logic/healthEngine';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  primary: '#10B981',
  primaryLight: '#D1FAE5',
  primaryDeep: '#065F46',
  secondary: '#3B82F6',
  secondaryLight: '#DBEAFE',
  accent: '#8B5CF6',
  accentLight: '#EDE9FE',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  text: '#1E293B',
  sub: '#64748B',
  muted: '#94A3B8',
  bg: '#FFFFFF',
  card: '#FFFFFF',
  border: '#F1F5F9',
  shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
};

// ─── MINI SPARKLINE ────────────────────────────────────────────────────────────
const MiniGraph = ({ color, data = [30, 45, 35, 50, 40, 60, 55] }) => {
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - v}`).join(' ');
  return (
    <div style={{ width: '100%', height: '24px', marginTop: '12px', opacity: 0.8 }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <path
          d={`M 0 100 L ${points} L 100 100 Z`}
          fill={`url(#grad-${color.replace('#', '')})`}
          opacity="0.1"
        />
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// ─── SIGNAL BARS ──────────────────────────────────────────────────────────────
const SignalBars = ({ active }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '16px' }}>
    {[4, 8, 12, 16].map((h, i) => (
      <div
        key={i}
        style={{
          width: '3.5px',
          height: `${h}px`,
          borderRadius: '1.5px',
          background: active ? T.primary : T.danger,
          opacity: active ? 1 : (i === 0 ? 0.6 : 0.4),
          transition: 'all 0.3s ease',
        }}
      />
    ))}
  </div>
);

// ─── NODE CARD ────────────────────────────────────────────────────────────────
const NodeCard = ({ icon: Icon, label, color, isOnline, sensors, actuators, toggleActuator, children, isFullWidth = false }) => (
  <motion.div
    whileHover={{ y: -2 }}
    style={{
      background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)',
      borderRadius: '24px',
      padding: '16px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)',
      display: 'flex',
      flexDirection: 'column',
      gridColumn: isFullWidth ? '1 / -1' : 'auto',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.8)'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={20} color={color} strokeWidth={2} />
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: T.text }}>{label}</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <SignalBars active={isOnline} />
      </div>
    </div>

    {sensors && (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2px',
        marginTop: '8px'
      }}>
        {sensors.map((s, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '2px', 
            flex: 1, 
            minWidth: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'center' }}>
              <s.icon size={8} color={s.iconColor || T.secondary} strokeWidth={3} />
              <span style={{ fontSize: '0.45rem', color: T.sub, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>{s.label}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: T.text, fontWeight: 950, textAlign: 'center', whiteSpace: 'nowrap' }}>{s.value || '---'}</span>
          </div>
        ))}
      </div>
    )}

    {children}
    <MiniGraph color={isOnline ? color : T.muted} />
  </motion.div>
);

// ─── NETWORK HEALTH CARD ──────────────────────────────────────────────────────
const NetworkHealthCard = ({ activeCount, totalCount, mqttStatus }) => {
  const pct = (activeCount / totalCount) * 100;
  const isConnected = mqttStatus === 'connected';

  return (
    <div style={{
      background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)',
      borderRadius: '24px',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)',
      border: '1px solid rgba(255, 255, 255, 0.8)'
    }}>
      {/* Wavy Background Decoration */}
      <svg style={{ position: 'absolute', right: 0, bottom: 0, width: '60%', height: '100%', opacity: 0.1, zIndex: 0 }} viewBox="0 0 200 200">
        <path fill={T.primary} d="M40,-62.1C53.3,-54.5,66.7,-45.2,74.1,-32.7C81.5,-20.3,82.8,-4.7,79.1,9.6C75.4,23.9,66.7,36.9,55.5,47.1C44.4,57.3,30.8,64.7,16.5,68.9C2.2,73.1,-12.8,74.1,-26.1,69.5C-39.4,65,-51,54.9,-60.7,42.8C-70.4,30.7,-78.2,16.6,-80.1,1.9C-82,-12.8,-78.1,-28.1,-68.8,-39.8C-59.5,-51.5,-44.8,-59.6,-30.9,-66.8C-17,-74,-3.8,-80.3,10,-86.1C23.8,-91.9,40,-74.6,40,-62.1Z" transform="translate(100 100)" />
      </svg>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: T.sub, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Network Health
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 950, color: T.primary, letterSpacing: '-0.02em' }}>
                {activeCount}
              </h2>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: T.muted }}>/ {totalCount}</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', fontWeight: 700, color: T.text }}>Devices Active</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{
              padding: '6px 12px',
              borderRadius: '20px',
              background: isConnected ? `${T.primary}15` : `${T.danger}15`,
              border: `1px solid ${isConnected ? `${T.primary}25` : `${T.danger}25`}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Wifi size={14} color={isConnected ? T.primary : T.danger} />
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: isConnected ? T.primary : T.danger, letterSpacing: '0.04em' }}>
                {isConnected ? 'MQTT CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
            
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: `${T.primary}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 16px ${T.primary}10`
            }}>
              <ShieldCheck size={32} color={T.primary} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <div style={{ height: '8px', borderRadius: '4px', background: '#F1F5F9', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ height: '100%', background: T.primary, borderRadius: '4px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── VISION NODE ──────────────────────────────────────────────────────────────
const VisionCard = ({ isOnline, detection }) => {
  const sensors = [
    { label: 'Motion', active: isOnline && detection?.active },
    { label: 'Birds', active: isOnline && detection?.type === 'bird' },
    { label: 'Animals', active: isOnline && detection?.type === 'animal' },
    { label: 'Insects', active: isOnline && detection?.type === 'insect' },
    { label: 'Humans', active: isOnline && detection?.type === 'human' },
  ];

  return (
    <div style={{
      background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)',
      borderRadius: '24px',
      padding: '16px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)',
      gridColumn: '1 / -1',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      border: '1px solid rgba(255, 255, 255, 0.8)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${T.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={20} color="#A855F7" />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: T.text }}>Vision Node</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SignalBars active={isOnline} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', height: '160px' }}>
        <div style={{ 
          flex: 1.5, 
          background: '#0F172A', 
          borderRadius: '16px', 
          position: 'relative', 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {isOnline ? (
            <img 
              src={`http://192.168.4.2:81/stream`} 
              alt="Live" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: T.muted }}>
              <WifiOff size={24} style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700 }}>FEED UNAVAILABLE</p>
            </div>
          )}
          <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 8px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'white' }}>CAMERA 01</span>
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          background: isOnline ? '#FFFFFF' : `${T.danger}05`, 
          borderRadius: '16px', 
          padding: '12px 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          border: `1px solid ${isOnline ? T.border : `${T.danger}10`}`
        }}>
          {!isOnline ? (
            <>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${T.danger}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <WifiOff size={16} color={T.danger} />
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '0.8rem', fontWeight: 800, color: T.text }}>No Signal</h4>
              <p style={{ margin: '0 0 12px', fontSize: '0.55rem', color: T.sub, fontWeight: 600 }}>Camera is offline or out of range.</p>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '0.75rem', fontWeight: 800, color: T.text }}>Active Monitoring</h4>
              {sensors.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: s.active ? 1 : 0.4 }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.active ? T.primary : T.muted }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: T.text }}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

// ─── NODE POWER PANEL ────────────────────────────────────────────────────────
const NodePowerPanel = ({ nodePower, toggleNodePower, devices }) => {
  const nodes = [
    { id: 'soil',    nodeId: 'soil_node',    label: 'Soil',    icon: Sprout,    color: '#10B981' },
    { id: 'weather', nodeId: 'weather_node', label: 'Weather', icon: CloudRain, color: '#F97316' },
    { id: 'water',   nodeId: 'water_node',   label: 'Irrig',   icon: Droplets,  color: '#3B82F6' },
    { id: 'storage', nodeId: 'storage_node', label: 'Storage', icon: Archive,   color: '#8B5CF6' },
    { id: 'vision',  nodeId: 'vision_node',  label: 'Vision',  icon: Camera,    color: '#A855F7' },
  ];

  return (
    <div style={{ 
      marginTop: '8px',
      background: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)',
      padding: '16px',
      borderRadius: '24px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.9)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${T.secondary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings2 size={16} color={T.secondary} />
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 950, color: T.text }}>Node Network Power</span>
      </div>

      <div style={{ 
        display: 'flex',
        gap: '6px'
      }}>
        {nodes.map((n) => {
          const isHardwareActive = devices[n.nodeId]?.status === 'ACTIVE';
          const isPowered = isHardwareActive && nodePower[n.id];
          
          return (
            <motion.button
              key={n.id}
              whileTap={isHardwareActive ? { scale: 0.95 } : {}}
              onClick={() => isHardwareActive && toggleNodePower(n.id)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '14px',
                border: 'none',
                background: isPowered ? `${n.color}15` : '#F1F5F9',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: isHardwareActive ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: `1.5px solid ${isPowered ? n.color : 'transparent'}`,
                opacity: isHardwareActive ? 1 : 0.4
              }}
            >
              <n.icon size={16} color={isPowered ? n.color : T.muted} strokeWidth={2.5} />
              <span style={{ 
                fontSize: '0.6rem', 
                fontWeight: 900, 
                color: isPowered ? n.color : T.muted,
                textTransform: 'uppercase'
              }}>
                {isHardwareActive ? (isPowered ? 'ON' : 'OFF') : 'DEAD'}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// ─── CONTROL PANEL ───────────────────────────────────────────────────────────
const ControlPanel = ({ actuators, toggleActuator, sensorData }) => {
  const controls = [
    { id: ACTUATORS.BUZZER, label: 'Buzzer', icon: BellRing, color: '#EF4444' },
    { id: ACTUATORS.LIGHT, label: 'Light', icon: Lightbulb, color: '#F59E0B' },
    { id: ACTUATORS.PUMP, label: 'Pump', icon: Droplets, color: '#3B82F6' },
    { id: 'oled', label: 'OLED', icon: Monitor, color: '#0EA5E9', isDisplay: true },
  ];

  return (
    <div style={{ marginTop: '12px' }}>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '8px' 
      }}>
        {controls.map((c) => {
          const isOn = c.isDisplay 
            ? (sensorData?.soil?.oledActive === 1 || sensorData?.soil?.oledActive === true)
            : actuators?.[c.id];
          
          return (
            <motion.div 
              key={c.id} 
              style={{
                background: isOn ? c.color : 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)',
                borderRadius: '16px',
                padding: '12px 4px',
                boxShadow: isOn ? `0 8px 20px ${c.color}30` : '0 4px 12px rgba(0,0,0,0.02), inset 0 1px 1px rgba(255,255,255,0.9)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: `1px solid ${isOn ? c.color : 'rgba(255, 255, 255, 0.8)'}`,
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
            >
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '10px', 
                background: isOn ? 'rgba(255,255,255,0.2)' : `${c.color}10`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <c.icon size={18} color={isOn ? 'white' : c.color} strokeWidth={2.5} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 900, 
                  color: isOn ? 'white' : T.text, 
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em'
                }}>
                  {c.label}
                </span>
                <span style={{ 
                  fontSize: '0.5rem', 
                  fontWeight: 900, 
                  color: isOn ? 'rgba(255,255,255,0.8)' : T.muted,
                  textTransform: 'uppercase'
                }}>
                  {isOn ? 'ON' : 'OFF'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const DeviceManager = () => {
  const { 
    sensorData = {}, actuators = {}, toggleActuator, mqttStatus, devices = {},
    nodePower = {}, toggleNodePower 
  } = useApp();

  const soilOnline    = devices['soil_node']?.status    === 'ACTIVE' && nodePower.soil;
  const weatherOnline = devices['weather_node']?.status === 'ACTIVE' && nodePower.weather;
  const waterOnline   = devices['water_node']?.status   === 'ACTIVE' && nodePower.water;
  const storageOnline = devices['storage_node']?.status === 'ACTIVE' && nodePower.storage;
  const visionOnline  = devices['vision_node']?.status  === 'ACTIVE' && nodePower.vision;

  const sd = soilOnline    ? (sensorData?.soil    || {}) : {};
  const wd = weatherOnline ? (sensorData?.weather || {}) : {};
  const id = waterOnline   ? (sensorData?.water   || {}) : {};
  const st = storageOnline ? (sensorData?.storage || {}) : {};

  // ── Helper for precision formatting ──────────────────────────────────────
  const f = (val) => (val != null && !isNaN(val) ? Number(val).toFixed(1) : '---');

  const soilSensors = [
    { label: 'Mois', value: (sd && sd.moisture) ? `${f(sd.moisture)}%` : '---', icon: Droplets, iconColor: T.secondary },
    { label: 'pH',   value: (sd && sd.ph) ? f(sd.ph) : '---', icon: FlaskConical, iconColor: T.accent },
    { label: 'Temp', value: (sd && sd.temp) ? `${f(sd.temp)}°C` : '---', icon: Thermometer, iconColor: T.danger },
    { label: 'NPK',  value: (sd && sd.npk && sd.npk.n) ? `${f(sd.npk.n)}` : '---', icon: Sprout, iconColor: T.primary },
  ];

  const weatherSensors = [
    { label: 'Temp',  value: (wd && wd.temp) ? `${f(wd.temp)}°C` : '---', icon: Thermometer, iconColor: T.danger },
    { label: 'Hum',   value: (wd && wd.humidity) ? `${f(wd.humidity)}%` : '---', icon: Droplets, iconColor: T.secondary },
    { label: 'Rain',  value: (wd && wd.rainLevel) ? `${f(wd.rainLevel)} mm` : '---', icon: CloudRain, iconColor: T.secondary },
    { label: 'Light', value: (wd && wd.lightIntensity) ? `${f(wd.lightIntensity)} lx` : '---', icon: Sun, iconColor: T.warning },
  ];

  const irrigSensors = [
    { label: 'Lvl', value: (id && id.level) ? `${f(id.level)}%` : '---', icon: Waves, iconColor: T.secondary },
  ];

  const storageSensors = [
    { label: 'Temp', value: (st && st.temp) ? `${f(st.temp)}°C` : '---', icon: Thermometer, iconColor: T.danger },
    { label: 'Hum',  value: (st && st.humidity) ? `${f(st.humidity)}%` : '---', icon: Droplets, iconColor: T.secondary },
    { label: 'Gas',  value: (st && st.mq135) ? `${f(st.mq135)} ppm` : '---', icon: Flame, iconColor: T.warning },
  ];

  const activeCount = [soilOnline, weatherOnline, waterOnline, storageOnline, visionOnline].filter(Boolean).length;

  return (
    <div style={{
      padding: '16px',
      background: T.bg,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      paddingBottom: '0px',
      fontFamily: "'Outfit', sans-serif"
    }}>
      
      <NetworkHealthCard
        activeCount={activeCount}
        totalCount={5}
        mqttStatus={mqttStatus}
      />

      <NodePowerPanel nodePower={nodePower} toggleNodePower={toggleNodePower} devices={devices} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '4px' }}>
        <NodeCard icon={Sprout} label="Soil Node" color="#10B981" isOnline={soilOnline} sensors={soilSensors} />
        <NodeCard icon={CloudRain} label="Weather Node" color="#F97316" isOnline={weatherOnline} sensors={weatherSensors} />
        <NodeCard icon={Droplets} label="Irrigation Node" color="#3B82F6" isOnline={waterOnline} sensors={irrigSensors} />
        <NodeCard icon={Archive} label="Storage Node" color="#8B5CF6" isOnline={storageOnline} sensors={storageSensors} />
        <VisionCard isOnline={visionOnline} detection={sensorData?.vision} />
      </div>

      <ControlPanel 
        actuators={actuators} 
        toggleActuator={toggleActuator} 
        sensorData={sensorData} 
      />
    </div>
  );
};

export default DeviceManager;
