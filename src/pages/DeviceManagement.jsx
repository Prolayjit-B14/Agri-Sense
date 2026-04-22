/**
 * AgriSense v3.65 Industrial IoT Device Management
 * Real-time Hero Summary and 2x2 Diagnostic Grid.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, Cpu, Wifi, Activity, 
  RefreshCcw, Search, Settings, AlertTriangle, 
  CheckCircle2, AlertCircle, SignalHigh, SignalLow, 
  SignalMedium, Clock, HardDrive, Droplets, CloudRain,
  Sprout, Thermometer, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  active: '#10B981', partial: '#F59E0B', offline: '#EF4444', 
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0', text: '#0F172A', subtext: '#64748B'
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────

const NodeCard = ({ device }) => {
  const { status, metrics, sensors, issues, health_score, node_type, device_id } = device;
  
  const statusColor = status === 'ACTIVE' ? COLORS.active : (status === 'PARTIAL' ? COLORS.partial : COLORS.offline);
  const iconMap = { soil: Sprout, weather: CloudRain, storage: HardDrive, water: Droplets, solar: Zap };

  const NodeIcon = iconMap[node_type] || Cpu;

  const getSignalIcon = (rssi) => {
    if (rssi > -60) return <SignalHigh size={14} color={COLORS.active} />;
    if (rssi > -80) return <SignalMedium size={14} color={COLORS.partial} />;
    return <SignalLow size={14} color={COLORS.offline} />;
  };

  const getStatusDot = (sStatus) => {
    if (sStatus === 'ACTIVE') return '#10B981';
    if (sStatus === 'STALE') return '#F59E0B';
    if (sStatus === 'ERROR') return '#EF4444';
    return '#94A3B8';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ 
        background: 'white', borderRadius: '24px', padding: '1.5rem', 
        border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex', flexDirection: 'column', gap: '1.25rem'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: `${statusColor}10` }}>
            <NodeIcon size={20} color={statusColor} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 950, color: COLORS.text, textTransform: 'capitalize' }}>{node_type} Node</h3>
            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext }}>ID: {device_id}</p>
          </div>
        </div>
        <div style={{ padding: '6px 12px', borderRadius: '8px', background: `${statusColor}15`, color: statusColor, fontSize: '0.65rem', fontWeight: 950, letterSpacing: '0.05em' }}>
          {status}
        </div>
      </div>

      {/* Sensor Row (Strict Single Line) */}
      <div style={{ 
        display: 'flex', gap: '8px', overflowX: 'auto', 
        paddingBottom: '4px', whiteSpace: 'nowrap', msOverflowStyle: 'none', scrollbarWidth: 'none' 
      }}>
        {sensors.map((s, i) => (
          <div key={i} style={{ 
            display: 'flex', alignItems: 'center', gap: '5px', 
            background: COLORS.bg, padding: '3px 7px', borderRadius: '6px', flexShrink: 0 
          }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 900, color: COLORS.subtext }}>{s.name}</span>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: getStatusDot(s.status) }} />
          </div>
        ))}
      </div>


      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ background: COLORS.bg, padding: '10px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext }}>RSSI</span>
            {getSignalIcon(metrics.rssi)}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 950, color: COLORS.text }}>{metrics.rssi} <small style={{ fontWeight: 800, fontSize: '0.6rem' }}>dBm</small></span>
        </div>
        <div style={{ background: COLORS.bg, padding: '10px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext }}>LATENCY</span>
            <Activity size={12} color={metrics.latency > 100 ? COLORS.offline : COLORS.active} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 950, color: COLORS.text }}>{metrics.latency} <small style={{ fontWeight: 800, fontSize: '0.6rem' }}>ms</small></span>
        </div>
        <div style={{ background: COLORS.bg, padding: '10px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext }}>UPTIME</span>
            <Clock size={12} color={COLORS.subtext} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 950, color: COLORS.text }}>{(metrics.uptime / 60000).toFixed(1)} <small style={{ fontWeight: 800, fontSize: '0.6rem' }}>min</small></span>
        </div>
        <div style={{ background: COLORS.bg, padding: '10px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext }}>PACKET LOSS</span>
            <AlertTriangle size={12} color={metrics.packet_loss > 2 ? COLORS.offline : COLORS.active} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 950, color: COLORS.text }}>{metrics.packet_loss} <small style={{ fontWeight: 800, fontSize: '0.6rem' }}>%</small></span>
        </div>
      </div>

      {/* Issues */}
      <div style={{ background: issues[0]?.includes('operational') ? `${COLORS.active}10` : `${COLORS.offline}10`, padding: '12px', borderRadius: '16px', minHeight: '60px' }}>
        <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, color: COLORS.subtext, textTransform: 'uppercase', marginBottom: '4px' }}>Insights & Issues</p>
        {issues.map((issue, i) => (
          <p key={i} style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: issues[0]?.includes('operational') ? COLORS.active : COLORS.offline }}>• {issue}</p>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button disabled={status === 'OFFLINE'} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: COLORS.bg, border: 'none', color: COLORS.text, fontSize: '0.7rem', fontWeight: 950, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: status === 'OFFLINE' ? 0.4 : 1 }}>
          <RefreshCcw size={14} /> RESTART
        </button>
        <button style={{ flex: 1, padding: '10px', borderRadius: '12px', background: COLORS.bg, border: 'none', color: COLORS.text, fontSize: '0.7rem', fontWeight: 950, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Search size={14} /> DIAGNOSE
        </button>
        <button style={{ padding: '10px', borderRadius: '12px', background: COLORS.bg, border: 'none', color: COLORS.text }}>
          <Settings size={14} />
        </button>
      </div>
    </motion.div>
  );
};

const DeviceManagement = () => {
  const { devices = {}, systemOverview } = useApp();

  if (!systemOverview || !devices) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: COLORS.bg }}>
        <div style={{ textAlign: 'center' }}>
          <Activity size={40} color={COLORS.active} className="spin-slow" />
          <p style={{ marginTop: '1rem', fontWeight: 800, color: COLORS.subtext, fontSize: '0.8rem' }}>INITIALIZING DIAGNOSTIC LINK...</p>
        </div>
      </div>
    );
  }

  const statusColor = systemOverview.overall_status === 'HEALTHY' ? COLORS.active : (systemOverview.overall_status === 'DEGRADED' ? COLORS.partial : COLORS.offline);

  const deviceList = Object.values(devices);

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', padding: '1.25rem', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* ─── SYSTEM HERO CARD ─── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        style={{ 
          background: 'white', borderRadius: '28px', padding: '2rem', 
          border: `1px solid ${COLORS.border}`, boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          marginBottom: '1.5rem', position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: `${statusColor}08`, borderRadius: '50%', transform: 'translate(50%, -50%)' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Server size={18} color={statusColor} />
              <span style={{ fontSize: '0.75rem', fontWeight: 950, color: COLORS.subtext, textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Health Overview</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '2.4rem', fontWeight: 950, color: COLORS.text, letterSpacing: '-0.03em' }}>{systemOverview.overall_status}</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', fontWeight: 700, color: COLORS.subtext }}>{systemOverview.health_percent}% operational capacity detected across {systemOverview.total_nodes} nodes.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 950, color: statusColor, lineHeight: 1 }}>{systemOverview.health_percent}<small style={{ fontSize: '1rem', opacity: 0.4 }}>%</small></div>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: COLORS.subtext, textTransform: 'uppercase' }}>Network Integrity</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', borderTop: `1px solid ${COLORS.border}`, paddingTop: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 950, color: COLORS.active }}>{systemOverview.active_nodes}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 900, color: COLORS.subtext, textTransform: 'uppercase' }}>Active</div>
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 950, color: COLORS.partial }}>{systemOverview.partial_nodes}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 900, color: COLORS.subtext, textTransform: 'uppercase' }}>Partial</div>
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 950, color: COLORS.offline }}>{systemOverview.offline_nodes}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 900, color: COLORS.subtext, textTransform: 'uppercase' }}>Offline</div>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button style={{ padding: '10px 20px', borderRadius: '100px', background: COLORS.text, color: 'white', border: 'none', fontSize: '0.7rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={14} /> RUN SYSTEM DIAGNOSTICS
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── 2x2 DEVICE GRID ─── */}
      {deviceList.length > 0 ? (
        <div className="device-grid">
          {deviceList.map(dev => (
            <NodeCard key={dev.device_id} device={dev} />
          ))}
        </div>
      ) : (
        <div style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '32px', border: `1px dashed ${COLORS.border}` }}>
          <p style={{ fontWeight: 800, color: COLORS.subtext }}>NO HARDWARE NODES REGISTERED</p>
          <p style={{ fontSize: '0.7rem', color: COLORS.subtext }}>Waiting for MQTT telemetry handshake...</p>
        </div>
      )}

      <style>{`
        .device-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 768px) {
          .device-grid {
            grid-template-columns: 1fr;
          }
        }
        .spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};


export default DeviceManagement;
