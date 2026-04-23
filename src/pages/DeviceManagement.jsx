/**
 * AgriSense v3.80 Industrial IoT Device Management
 * Real-time Hero Summary and Diagnostic Grid.
 * FULL-SCREEN UNIFORM EDITION (No Gaps)
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, Cpu, Wifi, Activity, 
  RefreshCcw, Search, Settings, AlertTriangle, 
  CheckCircle2, AlertCircle, SignalHigh, SignalLow, 
  SignalMedium, Clock, HardDrive, Droplets, CloudRain,
  Sprout, Thermometer, Zap, ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  active: '#10B981', 
  partial: '#F59E0B', 
  error: '#EF4444',
  offline: '#94A3B8', 
  bg: '#F8FAFC', 
  card: '#FFFFFF', 
  border: 'rgba(0,0,0,0.06)', 
  text: '#0F172A', 
  subtext: '#64748B'
};

const NODE_THEMES = {
  soil: { color: '#10B981', icon: Sprout, label: 'Soil Node' },
  weather: { color: '#14B8A6', icon: CloudRain, label: 'Weather Node' },
  storage: { color: '#8B5CF6', icon: HardDrive, label: 'Storage Node' },
  water: { color: '#0EA5E9', icon: Droplets, label: 'Water Node' }
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────

const NodeCard = ({ device }) => {
  const { status, metrics, sensors, node_type } = device;
  const isOffline = status === 'OFFLINE';
  const theme = NODE_THEMES[node_type] || { color: COLORS.active, icon: Cpu, label: 'Logic' };
  
  const statusColor = isOffline ? COLORS.offline : (status === 'PARTIAL' ? COLORS.partial : (status === 'ERROR' ? COLORS.error : theme.color));
  const NodeIcon = theme.icon;

  const getSensorStatusColor = (sStatus) => {
    if (sStatus === 'ACTIVE') return COLORS.active;
    if (sStatus === 'STALE') return COLORS.partial;
    if (sStatus === 'ERROR' || sStatus === 'DAMAGED') return COLORS.error;
    return COLORS.offline; 
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      style={{ 
        background: isOffline ? '#F8FAFC' : 'white', 
        borderRadius: '20px', padding: '0.75rem', 
        border: `1px solid ${isOffline ? '#E2E8F0' : COLORS.border}`, 
        boxShadow: isOffline ? 'none' : '0 10px 25px rgba(0,0,0,0.02)',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        height: '100%', boxSizing: 'border-box', overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ padding: '6px', borderRadius: '10px', background: isOffline ? '#F1F5F9' : `${theme.color}12` }}>
            <NodeIcon size={14} color={isOffline ? COLORS.offline : theme.color} strokeWidth={2.5} />
          </div>
          <h3 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 950, color: isOffline ? COLORS.offline : COLORS.text }}>
            {theme.label}
          </h3>
        </div>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
      </div>

      {!isOffline && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
          <div style={{ background: '#F8FAFC', padding: '5px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.45rem', fontWeight: 900, color: COLORS.subtext, display: 'block', textTransform: 'uppercase' }}>Signal</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 950, color: COLORS.text }}>{metrics.rssi || '---'}</span>
          </div>
          <div style={{ background: '#F8FAFC', padding: '5px', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.45rem', fontWeight: 900, color: COLORS.subtext, display: 'block', textTransform: 'uppercase' }}>Lat</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 950, color: COLORS.text }}>{metrics.latency || '---'}</span>
          </div>
        </div>
      )}

      <div style={{ 
        flex: 1, padding: '8px', background: isOffline ? 'transparent' : '#FCFCFC', 
        borderRadius: '12px', border: isOffline ? '1px dashed #E2E8F0' : '1px solid #F1F5F9',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {sensors && sensors.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: isOffline ? 0.4 : 1 }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: getSensorStatusColor(s.status) }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 800, color: isOffline ? COLORS.offline : COLORS.text, textTransform: 'uppercase' }}>
                {s.name.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const DeviceManagement = () => {
  const { devices = {}, systemOverview } = useApp();

  if (!systemOverview || !devices) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: COLORS.bg }}>
        <Activity size={32} color={COLORS.active} className="spin-slow" />
      </div>
    );
  }

  const statusColor = systemOverview.overall_status === 'HEALTHY' ? COLORS.active : (systemOverview.overall_status === 'DEGRADED' ? COLORS.partial : COLORS.offline);
  const deviceList = Object.values(devices);

  return (
    <div style={{ background: COLORS.bg, height: '100vh', padding: '0.75rem', fontFamily: "'Outfit', sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* ─── SYSTEM HERO CARD ─── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ 
          background: 'white', borderRadius: '24px', padding: '1rem', 
          border: `1px solid ${COLORS.border}`, boxShadow: '0 8px 25px rgba(0,0,0,0.03)',
          marginBottom: '0.75rem', position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', background: `${statusColor}15`, borderRadius: '12px' }}>
              <Server size={20} color={statusColor} strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontSize: '0.6rem', fontWeight: 950, color: COLORS.subtext, textTransform: 'uppercase' }}>Fleet Diagnostics</span>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 950, color: COLORS.text, lineHeight: 1 }}>{systemOverview.overall_status}</h1>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 950, color: statusColor, lineHeight: 1 }}>{systemOverview.health_percent}%</div>
            <span style={{ fontSize: '0.5rem', fontWeight: 900, color: COLORS.subtext, textTransform: 'uppercase' }}>Integrity Score</span>
          </div>
        </div>
      </motion.div>

      {/* ─── FULL-SCREEN 2x2 GRID (Stretches to fill bottom) ─── */}
      <div style={{ 
        flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', 
        gridTemplateRows: 'repeat(2, 1fr)', gap: '0.75rem', paddingBottom: '0.2rem' 
      }}>
        {deviceList.slice(0, 4).map(dev => (
          <NodeCard key={dev.device_id} device={dev} />
        ))}
      </div>

      <style>{`
        .spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DeviceManagement;
