/**
 * AgriSense Pro v17.1.0 - Device Network Hub
 * Clean status overview — no values, no buttons, just node health.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, Sprout, CloudRain, Droplets, HardDrive, 
  Wifi, WifiOff, Camera, Monitor, BellRing, Lightbulb, Zap
} from 'lucide-react';
import { useApp } from '../../state/AppContext';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const C = {
  active:  '#10B981',
  warning: '#F59E0B',
  offline: '#94A3B8',
  critical:'#EF4444',
  bg:      '#F1F5F9',
  card:    '#FFFFFF',
  text:    '#0F172A',
  sub:     '#64748B',
  border:  'rgba(0,0,0,0.05)'
};

// ─── STATUS PILL ─────────────────────────────────────────────────────────
const StatusPill = ({ isOnline }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '4px 10px', borderRadius: '20px',
    background: isOnline ? `${C.active}15` : '#F1F5F9',
  }}>
    <motion.div
      animate={{ opacity: isOnline ? [1, 0.4, 1] : 1 }}
      transition={{ duration: 1.8, repeat: Infinity }}
      style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOnline ? C.active : C.offline }}
    />
    <span style={{ fontSize: '0.55rem', fontWeight: 900, color: isOnline ? C.active : C.offline, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {isOnline ? 'Live' : 'Offline'}
    </span>
  </div>
);

// ─── GENERIC NODE CARD ────────────────────────────────────────────────────
const NodeCard = ({ icon: Icon, label, color, isOnline, children }) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    style={{
      background: C.card, borderRadius: '22px', padding: '1rem',
      border: `1px solid ${isOnline ? `${color}20` : C.border}`,
      boxShadow: '0 6px 20px rgba(0,0,0,0.03)',
      display: 'flex', flexDirection: 'column', gap: '12px'
    }}
  >
    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '12px',
          background: isOnline ? `${color}18` : '#F1F5F9',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={18} color={isOnline ? color : C.offline} />
        </div>
        <span style={{ fontSize: '0.82rem', fontWeight: 900, color: C.text }}>{label}</span>
      </div>
      <StatusPill isOnline={isOnline} />
    </div>

    {/* Body */}
    {children && <div>{children}</div>}
  </motion.div>
);

// ─── SENSOR NODES (status only) ───────────────────────────────────────────
const SoilCard    = ({ device }) => <NodeCard icon={Sprout}    label="Soil Node"    color="#10B981" isOnline={device?.status === 'ACTIVE' || device?.status === 'PARTIAL'} />;
const WeatherCard = ({ device }) => <NodeCard icon={CloudRain} label="Weather Node" color="#14B8A6" isOnline={device?.status === 'ACTIVE' || device?.status === 'PARTIAL'} />;
const WaterCard   = ({ device }) => <NodeCard icon={Droplets}  label="Water Node"   color="#0EA5E9" isOnline={device?.status === 'ACTIVE' || device?.status === 'PARTIAL'} />;
const StorageCard = ({ device }) => <NodeCard icon={HardDrive} label="Storage Node" color="#8B5CF6" isOnline={device?.status === 'ACTIVE' || device?.status === 'PARTIAL'} />;

// ─── CAMERA NODE ─────────────────────────────────────────────────────────
const CameraCard = ({ sensorData }) => {
  // Camera is considered active if we have any recent data
  const isActive = !!(sensorData?.soil || sensorData?.weather);

  return (
    <NodeCard icon={Camera} label="Vision Node" color="#EC4899" isOnline={isActive}>
      <div style={{
        background: '#0F172A', borderRadius: '12px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
      }}>
        {isActive ? (
          <>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EC4899' }}
            />
            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#EC4899', letterSpacing: '0.08em' }}>CAM ACTIVE</span>
          </>
        ) : (
          <>
            <WifiOff size={14} color={C.offline} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: C.offline }}>NO SIGNAL</span>
          </>
        )}
      </div>
    </NodeCard>
  );
};

// ─── INTERFACE NODE ───────────────────────────────────────────────────────
const InterfaceCard = () => {
  const interfaces = [
    { icon: BellRing,  label: 'Buzzer',  color: '#F59E0B' },
    { icon: Lightbulb, label: 'Light',   color: '#EAB308' },
    { icon: Monitor,   label: 'Display', color: '#3B82F6' },
    { icon: Zap,       label: 'Relay',   color: '#10B981' },
  ];

  return (
    <NodeCard icon={Cpu} label="Interface Node" color="#6366F1" isOnline={true}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {interfaces.map(({ icon: Icon, label, color }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: `${color}12`, border: `1px solid ${color}25`,
            padding: '5px 10px', borderRadius: '20px'
          }}>
            <Icon size={11} color={color} />
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
          </div>
        ))}
      </div>
    </NodeCard>
  );
};

// ─── HERO BAR ─────────────────────────────────────────────────────────────
const HeroBar = ({ systemOverview }) => {
  const { active_nodes = 0, offline_nodes = 0 } = systemOverview || {};
  const total = 6; // Soil, Weather, Water, Storage, Camera, Interface
  const isHealthy = active_nodes >= total;
  const isDown    = active_nodes === 0;
  const statusColor = isDown ? C.critical : isHealthy ? C.active : C.warning;
  const statusText  = isDown ? 'System Offline' : isHealthy ? 'All Systems Active' : `${active_nodes} / ${total} Active`;

  return (
    <div style={{
      background: C.card, borderRadius: '22px', padding: '1rem 1.25rem',
      border: `1px solid ${C.border}`, boxShadow: '0 6px 20px rgba(0,0,0,0.03)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <div>
        <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 900, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Network Health</p>
        <h2 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontWeight: 950, color: statusColor }}>{statusText}</h2>
      </div>
      <div style={{ display: 'flex', gap: '14px' }}>
        {[
          { label: 'Live',    val: active_nodes,  color: C.active },
          { label: 'Offline', val: offline_nodes, color: C.offline }
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 950, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '0.55rem', fontWeight: 800, color: C.sub, textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────
const DeviceManagement = () => {
  const { devices, systemOverview, sensorData } = useApp();

  return (
    <div style={{
      padding: '1rem', background: C.bg, minHeight: '100%',
      display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingBottom: '0'
    }}>
      <HeroBar systemOverview={systemOverview} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        <SoilCard    device={devices?.soil_node} />
        <WeatherCard device={devices?.weather_node} />
        <WaterCard   device={devices?.water_node} />
        <StorageCard device={devices?.storage_node} />
        <CameraCard  sensorData={sensorData} />
        <InterfaceCard />
      </div>
    </div>
  );
};

export default DeviceManagement;
