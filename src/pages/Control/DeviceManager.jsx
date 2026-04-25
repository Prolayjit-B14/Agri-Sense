/**
 * AgriSense Pro v17.1.0 - Responsive Device Area
 * Optimized for mobile screens with adaptive grid and scrollable container.
 * Fixed "Out of screen" overflow issue.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, Sprout, CloudRain, Droplets, HardDrive, 
  Wifi, Zap, RefreshCw
} from 'lucide-react';
import { useApp } from '../../state/AppContext';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  active: '#10B981',
  warning: '#F59E0B',
  offline: '#94A3B8',
  critical: '#EF4444',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  subtext: '#64748B',
  border: 'rgba(0, 0, 0, 0.05)'
};

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

const DeviceCard = ({ device }) => {
  if (!device) return null;

  const { status, node_type, sensors } = device;
  const isOnline = status === 'ACTIVE' || status === 'PARTIAL';
  const isOffline = status === 'OFFLINE' || status === 'ERROR';
  
  const config = {
    soil: { icon: Sprout, label: 'Soil Node', color: '#10B981' },
    weather: { icon: CloudRain, label: 'Weather Node', color: '#14B8A6' },
    water: { icon: Droplets, label: 'Water Node', color: '#0EA5E9' },
    storage: { icon: HardDrive, label: 'Storage Node', color: '#8B5CF6' }
  }[node_type] || { icon: Cpu, label: 'Control Node', color: '#6366F1' };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      style={{
        background: COLORS.card, borderRadius: '24px', padding: '1rem',
        border: `1px solid ${COLORS.border}`, boxShadow: '0 8px 20px rgba(0,0,0,0.02)',
        display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: 0 // Prevent overflow
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ 
            width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
            background: isOffline ? '#F1F5F9' : `${config.color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {React.createElement(config.icon, { size: 18, color: isOffline ? COLORS.offline : config.color })}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, color: COLORS.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{config.label}</h3>
            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: COLORS.subtext, opacity: 0.6 }}>v2.9.2</span>
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: '5px', borderRadius: '8px', background: isOnline ? `${COLORS.active}10` : '#F1F5F9' }}>
           <Wifi size={16} color={isOnline ? COLORS.active : COLORS.offline} />
        </div>
      </div>

      {/* Sensor Dots */}
      <div style={{ 
        background: '#F8FAFC', borderRadius: '14px', padding: '10px',
        display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '6px'
      }}>
        {sensors?.slice(0, 4).map((s, idx) => {
          let dotColor = COLORS.offline;
          if (!isOffline) {
            if (s.status === 'ACTIVE') dotColor = COLORS.active;
            else if (s.status === 'ERROR') dotColor = COLORS.critical;
            else dotColor = COLORS.warning;
          }
          
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
               <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
               <span style={{ fontSize: '0.6rem', fontWeight: 850, color: COLORS.text, opacity: isOffline ? 0.4 : 1, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                 {s.name?.replace(/_/g, ' ') || 'S'}
               </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const DeviceManagement = () => {
  const { devices, systemOverview } = useApp();

  if (!systemOverview || !devices) return null;

  const getHeroStatus = () => {
    const { active_nodes = 0, total_nodes = 4, offline_nodes = 0 } = systemOverview;
    if (offline_nodes === total_nodes) return { text: "Offline ❌", color: COLORS.critical, sub: "System Down" };
    if (active_nodes === total_nodes) return { text: "Healthy ✅", color: COLORS.active, sub: "All Nodes Active" };
    return { text: "Alert ⚠️", color: COLORS.warning, sub: `${offline_nodes} Disconnected` };
  };

  const hero = getHeroStatus();

  return (
    <div style={{ 
      padding: '1rem', background: COLORS.background, minHeight: '100%', 
      display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '0',
      overflowY: 'auto', // Enable vertical scroll
      maxWidth: '100vw' // Prevent horizontal overflow
    }}>
      
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: COLORS.card, borderRadius: '28px', padding: '1.25rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: `1px solid ${COLORS.border}`,
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 900, color: COLORS.subtext, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Node Status</p>
          <h2 style={{ margin: '4px 0', fontSize: '1.4rem', fontWeight: 950, color: COLORS.text }}>{hero.text}</h2>
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: COLORS.subtext, opacity: 0.7 }}>{hero.sub}</p>
          
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.25rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
               <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: COLORS.active }} />
               <span style={{ fontSize: '1rem', fontWeight: 950 }}>{systemOverview.active_nodes ?? 0}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
               <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: COLORS.warning }} />
               <span style={{ fontSize: '1rem', fontWeight: 950 }}>{systemOverview.partial_nodes ?? 0}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
               <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: COLORS.offline }} />
               <span style={{ fontSize: '1rem', fontWeight: 950 }}>{systemOverview.offline_nodes ?? 0}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Adaptive Grid: 2 columns on mobile, 1 column if extremely narrow */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', // Force 2 columns for high-density
        gap: '0.75rem',
        width: '100%'
      }}>
        <DeviceCard device={devices.soil_node} />
        <DeviceCard device={devices.weather_node} />
        <DeviceCard device={devices.water_node} />
        <DeviceCard device={devices.storage_node} />
      </div>

    </div>
  );
};

export default DeviceManagement;
