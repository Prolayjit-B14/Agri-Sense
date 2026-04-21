import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  Cpu, Signal, Battery, Search, RefreshCw, Sprout, 
  Camera, Archive, AlertCircle, Power, Sliders, ShieldCheck,
  Database, Activity, Wifi, Info, Zap
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

const ActionBtn = ({ icon: Icon, label, onClick, color = COLORS.subtext }) => (
  <motion.button 
    whileTap={{ scale: 0.95 }}
    style={{
      background: '#F8FAFC', border: `1px solid ${COLORS.border}`, borderRadius: '12px',
      padding: '8px', fontSize: '0.65rem', fontWeight: 800, color: COLORS.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      cursor: 'pointer', flex: 1
    }}
    onClick={onClick}
  >
    <Icon size={14} color={color} /> {label}
  </motion.button>
);

const NodeCard = ({ node, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    style={{ 
      background: 'white', borderRadius: '24px', padding: '1.25rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: `1px solid ${node.status === 'Offline' ? '#FECACA' : COLORS.border}`,
      position: 'relative', overflow: 'hidden'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: `${node.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <node.icon size={22} color={node.color} />
        </div>
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: COLORS.text, margin: 0 }}>{node.name}</h4>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: node.status === 'Online' ? '#10B981' : node.status === 'Standby' ? '#F59E0B' : '#EF4444' }}></div>
           </div>
           <p style={{ fontSize: '0.65rem', fontWeight: 700, color: COLORS.subtext, margin: 0 }}>{node.model} • {node.type.toUpperCase()}</p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
         <p style={{ fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext, margin: 0 }}>LATENCY</p>
         <p style={{ fontSize: '0.75rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>{node.latency}</p>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '8px', marginBottom: '1rem' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', padding: '8px', borderRadius: '10px' }}>
          <Signal size={12} color="#3B82F6" /><span style={{ fontSize: '0.65rem', fontWeight: 900 }}>{node.signal} dBm</span>
       </div>
       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', padding: '8px', borderRadius: '10px' }}>
          <Battery size={12} color="#10B981" /><span style={{ fontSize: '0.65rem', fontWeight: 900 }}>{node.battery}%</span>
       </div>
       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', padding: '8px', borderRadius: '10px' }}>
          <RefreshCw size={12} color={COLORS.subtext} /><span style={{ fontSize: '0.6rem', fontWeight: 800, color: COLORS.subtext }}>{node.lastSeen}</span>
       </div>
    </div>

    <div style={{ display: 'flex', gap: '8px', paddingTop: '1rem', borderTop: `1px solid ${COLORS.border}` }}>
       <ActionBtn icon={RefreshCw} label="Ping" onClick={() => {}} />
       <ActionBtn icon={Power} label="Restart" onClick={() => {}} />
       <ActionBtn icon={Sliders} label="Config" onClick={() => {}} />
    </div>

    {node.status === 'Offline' && (
      <div style={{ position: 'absolute', top: 0, right: 0, background: '#EF4444', color: 'white', padding: '2px 8px', borderBottomLeftRadius: '10px', fontSize: '0.55rem', fontWeight: 900 }}>OFFLINE</div>
    )}
  </motion.div>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const DeviceArea = () => {
  const { sensorData } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const nodes = useMemo(() => [
    { id: 'soil-01', name: 'Soil Node Alpha', type: 'Sensor', model: 'ESP32-S3', status: sensorData?.soil?.moisture > 0 ? 'Online' : 'Offline', battery: 88, signal: -62, latency: '24ms', lastSeen: '2m ago', icon: Sprout, color: '#10B981' },
    { id: 'cam-01', name: 'Vision Node S1', type: 'Camera', model: 'ESP32-CAM', status: 'Online', battery: 94, signal: -42, latency: '120ms', lastSeen: 'Just now', icon: Camera, color: '#3B82F6' },
    { id: 'stor-01', name: 'Storage Vault', type: 'Hub', model: 'ESP32-C3', status: sensorData?.storage?.temp > 0 ? 'Online' : 'Offline', battery: 76, signal: -108, latency: '850ms', lastSeen: '5m ago', icon: Archive, color: '#EF4444' },
    { id: 'relay-01', name: 'Control Relay', type: 'Switch', model: 'ESP32-WROOM', status: 'Standby', battery: 100, signal: -58, latency: '18ms', lastSeen: '12m ago', icon: Zap, color: '#F59E0B' },
  ], [sensorData]);

  const stats = useMemo(() => {
    const total = nodes.length;
    const online = nodes.filter(n => n.status === 'Online').length;
    const offline = nodes.filter(n => n.status === 'Offline').length;
    const health = Math.round(((total - offline) / total) * 100);
    return { total, online, offline, health };
  }, [nodes]);

  const handleScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => { setIsScanning(false); setScanResult(`Found ${nodes.length} verified nodes.`); }, 2500);
  };

  return (
    <div style={{ padding: '1.25rem', background: COLORS.bg, minHeight: '100vh', paddingBottom: '100px' }}>
      
      {/* 1. CLUSTER HERO */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        style={{ 
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', 
          borderRadius: '32px', padding: '1.75rem', color: 'white', marginBottom: '2rem',
          boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.4)', position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.1 }}><Wifi size={160} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Infrastructure Cluster</p>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 950, margin: 0 }}>Node Matrix Alpha</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 950, color: COLORS.primary, lineHeight: 1 }}>{stats.health}%</h2>
            <p style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.6, margin: 0 }}>INTEGRITY</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {[
            { l: 'Total Nodes', v: stats.total, c: 'white' },
            { l: 'Connected', v: stats.online, c: COLORS.primary },
            { l: 'Maintenance', v: stats.offline, c: COLORS.danger }
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: s.c, margin: 0 }}>{s.v}</h3>
               <p style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.6, margin: 0 }}>{s.l.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 2. NODE LIST */}
      <h3 style={{ fontSize: '0.85rem', fontWeight: 950, color: COLORS.text, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
        <Database size={16} color={COLORS.primary} /> Active Node Listing
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {nodes.map((node, i) => <NodeCard key={node.id} node={node} index={i} />)}
      </div>

      {/* 3. SCAN CONTROL */}
      <div style={{ position: 'relative' }}>
          <motion.button 
            onClick={handleScan} disabled={isScanning}
            whileTap={{ scale: 0.96 }}
            style={{ 
              width: '100%', height: '60px', borderRadius: '20px', 
              background: isScanning ? '#CBD5E1' : `linear-gradient(135deg, ${COLORS.primary}, #065F46)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              border: 'none', color: 'white', fontWeight: 950, fontSize: '1rem', cursor: isScanning ? 'not-allowed' : 'pointer',
              boxShadow: isScanning ? 'none' : `0 12px 30px ${COLORS.primary}40`
            }}
          >
            <motion.div animate={isScanning ? { rotate: 360 } : {}} transition={isScanning ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}>
              <RefreshCw size={22} />
            </motion.div>
            {isScanning ? 'DISCOVERING NODES...' : 'SCAN CLUSTER'}
          </motion.button>
          
          <AnimatePresence>
            {scanResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ marginTop: '15px', background: '#ECFDF5', border: `1px solid #BBF7D0`, color: '#065F46', padding: '14px', borderRadius: '16px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ShieldCheck size={18} /> {scanResult}
              </motion.div>
            )}
          </AnimatePresence>
      </div>

    </div>
  );
};

export default DeviceArea;
