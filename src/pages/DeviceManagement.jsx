/**
 * AgriSense v3.30 Industrial IoT Management Suite
 * High-Density Device Diagnostics, Network Telemetry, and Smart Insight Engine.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, AlertCircle, Signal, Activity, Cpu, 
  Wind, Droplets, Warehouse, RefreshCw, Zap, Settings, 
  Search, Terminal, Database, Clock, Wifi, HardDrive
} from 'lucide-react';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981', secondary: '#3B82F6', warning: '#F59E0B', danger: '#EF4444',
  text: '#0F172A', subtext: '#64748B', bg: '#F8FAFC', border: '#E2E8F0',
  card: '#FFFFFF', surface: '#F1F5F9',
  health: { optimal: '#10B981', stable: '#3B82F6', critical: '#EF4444' }
};

// ─── MOCK ENGINE (Diagnostic Data) ────────────────────────────────────────
const INITIAL_DEVICES = [
  {
    id: 'node-001', name: 'Soil Node Alpha', type: 'Soil Monitor', status: 'optimal',
    rssi: -55, latency: 12, uptime: '14d 2h', packetLoss: 0,
    sensors: [
      { name: 'Moisture', active: true }, { name: 'pH', active: true }, 
      { name: 'N-P-K', active: true }, { name: 'Temp', active: true }
    ]
  },
  {
    id: 'node-002', name: 'Weather Station 1', type: 'Climate Node', status: 'degraded',
    rssi: -78, latency: 45, uptime: '3d 18h', packetLoss: 2.4,
    reason: 'Anemometer not responding',
    sensors: [
      { name: 'Wind', active: false }, { name: 'Humidity', active: true }, 
      { name: 'Pressure', active: true }, { name: 'UV', active: true }
    ]
  },
  {
    id: 'pump-001', name: 'Irrigation Controller', type: 'Flow System', status: 'offline',
    rssi: 0, latency: 0, uptime: '0h', packetLoss: 100,
    reason: 'Power failure • Last seen 12m ago',
    sensors: [
      { name: 'Flow', active: false }, { name: 'Pressure', active: false }, 
      { name: 'Valve', active: false }
    ]
  },
  {
    id: 'store-001', name: 'Storage Unit B', type: 'Environment Control', status: 'optimal',
    rssi: -42, latency: 8, uptime: '45d 6h', packetLoss: 0,
    sensors: [
      { name: 'Ethylene', active: true }, { name: 'CO2', active: true }, 
      { name: 'Temp', active: true }
    ]
  }
];

const DeviceManagement = () => {
  const [devices] = useState(INITIAL_DEVICES);
  const [activeTab, setActiveTab] = useState('all');

  const systemHealth = useMemo(() => {
    const offline = devices.filter(d => d.status === 'offline').length;
    const degraded = devices.filter(d => d.status === 'degraded').length;
    const total = devices.length;
    const score = Math.round(((total - (offline + degraded * 0.5)) / total) * 100);
    return { score, offline, degraded, status: score > 90 ? 'Optimal' : score > 60 ? 'Stable' : 'Critical' };
  }, [devices]);

  const insights = useMemo(() => {
    const logs = [];
    if (systemHealth.offline > 0) logs.push(`${systemHealth.offline} devices offline detected`);
    devices.forEach(d => {
      if (d.status === 'degraded') logs.push(`${d.name}: ${d.reason}`);
    });
    return logs;
  }, [devices, systemHealth]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return COLORS.health.optimal;
      case 'degraded': return COLORS.warning;
      case 'offline': return COLORS.danger;
      default: return COLORS.subtext;
    }
  };

  const SignalBars = ({ rssi }) => {
    const bars = rssi > -60 ? 4 : rssi > -75 ? 3 : rssi > -90 ? 2 : rssi === 0 ? 0 : 1;
    return (
      <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '10px' }}>
        {[1, 2, 3, 4].map(b => (
          <div key={b} style={{ width: '3px', height: `${b * 25}%`, background: b <= bars ? COLORS.primary : COLORS.border, borderRadius: '1px' }} />
        ))}
      </div>
    );
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', padding: '1rem', fontFamily: "'Outfit', sans-serif", color: COLORS.text }}>
      
      {/* ─── SYSTEM OVERVIEW ─── */}
      <section style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: `1px solid ${COLORS.border}`, marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
               <ShieldCheck size={20} color={systemHealth.score > 60 ? COLORS.primary : COLORS.danger} />
               <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>System Integrity</span>
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 950, margin: 0, color: getStatusColor(systemHealth.status.toLowerCase()) }}>{systemHealth.score}%</h2>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.subtext, marginTop: '4px' }}>
              {systemHealth.status} • {systemHealth.offline} Offline • {systemHealth.degraded} Degraded
            </p>
          </div>
          <button style={{ padding: '10px 20px', borderRadius: '12px', background: `${COLORS.primary}10`, border: `1.5px solid ${COLORS.primary}`, color: COLORS.primary, fontSize: '0.8rem', fontWeight: 900, cursor: 'pointer' }}>
            Run Diagnostics
          </button>
        </div>
      </section>

      {/* ─── SMART INSIGHTS ─── */}
      <AnimatePresence>
        {insights.length > 0 && (
          <motion.section initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#FFF7ED', borderRadius: '18px', padding: '1rem', border: '1px solid #FED7AA', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Activity size={16} color="#C2410C" />
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#9A3412', textTransform: 'uppercase' }}>System Insights</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {insights.map((msg, i) => (
                <div key={i} style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#C2410C' }} /> {msg}
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── DEVICE GRID ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {devices.map((device) => (
          <motion.div key={device.id} layout style={{ background: 'white', borderRadius: '24px', padding: '1.2rem', border: `1px solid ${device.status === 'offline' ? COLORS.danger + '30' : COLORS.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', position: 'relative' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {device.type.includes('Soil') ? <Database size={22} color={COLORS.primary} /> : 
                   device.type.includes('Climate') ? <Wind size={22} color={COLORS.secondary} /> :
                   device.type.includes('Flow') ? <Droplets size={22} color={COLORS.warning} /> :
                   <Warehouse size={22} color={COLORS.subtext} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 950, margin: 0 }}>{device.name}</h3>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext, margin: 0 }}>{device.type.toUpperCase()}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end' }}>
                   <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusColor(device.status) }} />
                   <span style={{ fontSize: '0.65rem', fontWeight: 900, color: getStatusColor(device.status) }}>{device.status.toUpperCase()}</span>
                </div>
                {device.reason && <p style={{ fontSize: '0.6rem', color: COLORS.danger, fontWeight: 700, margin: '2px 0 0 0' }}>{device.reason}</p>}
              </div>
            </div>

            {/* Sensors */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
              {device.sensors.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: COLORS.bg, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.active ? COLORS.primary : COLORS.subtext }} />
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: s.active ? COLORS.text : COLORS.subtext }}>{s.name}</span>
                </div>
              ))}
            </div>

            {/* Network Metrics */}
            {device.status !== 'offline' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: COLORS.bg, padding: '0.8rem', borderRadius: '16px', marginBottom: '1.2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.55rem', fontWeight: 800, color: COLORS.subtext, marginBottom: '4px' }}>RSSI</p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}><SignalBars rssi={device.rssi} /></div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.55rem', fontWeight: 800, color: COLORS.subtext, marginBottom: '4px' }}>LATENCY</p>
                  <p style={{ fontSize: '0.7rem', fontWeight: 950, color: device.latency > 40 ? COLORS.warning : COLORS.primary }}>{device.latency}ms</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.55rem', fontWeight: 800, color: COLORS.subtext, marginBottom: '4px' }}>UPTIME</p>
                  <p style={{ fontSize: '0.7rem', fontWeight: 950 }}>{device.uptime}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.55rem', fontWeight: 800, color: COLORS.subtext, marginBottom: '4px' }}>LOSS</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                    {device.packetLoss > 0 && <AlertCircle size={10} color={COLORS.danger} />}
                    <p style={{ fontSize: '0.7rem', fontWeight: 950, color: device.packetLoss > 0 ? COLORS.danger : COLORS.primary }}>{device.packetLoss}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ flex: 1, height: '42px', borderRadius: '12px', border: `1.5px solid ${COLORS.border}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <RefreshCw size={14} color={COLORS.subtext} />
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: COLORS.subtext }}>Restart</span>
              </button>
              <button style={{ flex: 1, height: '42px', borderRadius: '12px', border: `1.5px solid ${COLORS.border}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                <Activity size={14} color={COLORS.subtext} />
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: COLORS.subtext }}>Ping</span>
              </button>
              <button style={{ width: '42px', height: '42px', borderRadius: '12px', border: `1.5px solid ${COLORS.border}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Settings size={16} color={COLORS.subtext} />
              </button>
            </div>

            {device.status === 'offline' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(1px)', borderRadius: '24px', zIndex: 1, display: 'flex', alignItems: 'flex-end', padding: '1rem', pointerEvents: 'none' }}>
                <div style={{ background: '#FEF2F2', padding: '6px 12px', borderRadius: '10px', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wifi size={12} color={COLORS.danger} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.danger }}>Disconnected • Sync failed</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ─── NAVIGATION BAR (Floating) ─── */}
      <nav style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', padding: '8px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: `1px solid ${COLORS.border}`, display: 'flex', gap: '10px', zIndex: 1000 }}>
        {['All', 'Nodes', 'Climate', 'Control'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} style={{ padding: '10px 20px', borderRadius: '14px', border: 'none', background: activeTab === tab.toLowerCase() ? `${COLORS.primary}15` : 'transparent', color: activeTab === tab.toLowerCase() ? COLORS.primary : COLORS.subtext, fontWeight: 950, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.3s' }}>
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default DeviceManagement;
