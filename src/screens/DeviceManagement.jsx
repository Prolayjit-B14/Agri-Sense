import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { 
  Cpu, Signal, Battery, RefreshCw, Sprout, 
  Archive, AlertCircle, Power, Sliders, ShieldCheck,
  Database, Activity, Wifi, Info, Zap, CloudRain,
  Thermometer, Droplet, Gauge, Network, Clock, CheckCircle2, XCircle
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
  border: '#F1F5F9',
  glass: 'rgba(255, 255, 255, 0.7)'
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const ActionBtn = ({ icon: Icon, label, onClick, disabled, color = COLORS.subtext }) => (
  <motion.button 
    whileTap={disabled ? {} : { scale: 0.95 }}
    disabled={disabled}
    style={{
      background: disabled ? '#F1F5F9' : 'white', 
      border: `1px solid ${COLORS.border}`, borderRadius: '14px',
      padding: '10px', fontSize: '0.7rem', fontWeight: 850, 
      color: disabled ? '#94A3B8' : COLORS.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      cursor: disabled ? 'not-allowed' : 'pointer', flex: 1,
      boxShadow: disabled ? 'none' : '0 4px 12px rgba(0,0,0,0.02)',
      transition: '0.2s'
    }}
    onClick={onClick}
  >
    <Icon size={16} color={disabled ? '#CBD5E1' : color} /> {label}
  </motion.button>
);

const SensorIndicator = ({ label, status }) => {
  const statusColor = {
    active: '#10B981',
    inactive: '#94A3B8',
    error: '#EF4444',
    timeout: '#F59E0B'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor[status] || '#CBD5E1', boxShadow: status === 'active' ? '0 0 8px #10B981' : 'none' }} />
      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'capitalize' }}>{label}:</span>
      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: statusColor[status] }}>{status}</span>
    </div>
  );
};

const NodeCard = ({ node, index }) => {
  const isOffline = node.connectionState === 'OFFLINE';
  const isPartial = node.connectionState === 'PARTIAL';
  
  const statusConfig = {
    CONNECTED: { label: 'Fully Connected', color: '#10B981', bg: '#DCFCE7' },
    PARTIAL: { label: 'Partially Connected', color: '#F59E0B', bg: '#FEF3C7' },
    OFFLINE: { label: 'Offline', color: '#EF4444', bg: '#FEE2E2' }
  };

  const { label: statusLabel, color: statusColor, bg: statusBg } = statusConfig[node.connectionState];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      style={{ 
        background: 'white', borderRadius: '28px', padding: '1.5rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: `1px solid ${isOffline ? '#FEE2E2' : COLORS.border}`,
        position: 'relative', overflow: 'hidden'
      }}
    >
      {/* Status Badge */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '12px', background: statusBg }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
        <span style={{ fontSize: '0.65rem', fontWeight: 950, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{statusLabel}</span>
      </div>

      {/* Header Info */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: `${node.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <node.icon size={28} color={node.color} />
        </div>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>{node.name}</h4>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.subtext, margin: '2px 0 0 0' }}>{node.model} • {node.purpose}</p>
        </div>
      </div>

      {/* Sensor List */}
      <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h5 style={{ fontSize: '0.65rem', fontWeight: 950, color: COLORS.subtext, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Sensor Matrix</h5>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {node.sensors.map((s, i) => <SensorIndicator key={i} label={s.name} status={s.status} />)}
        </div>
      </div>

      {/* Engineering Metrics */}
      {!isOffline && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext }}>
              <Wifi size={12} /> RSSI
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 950, color: node.rssi < -80 ? COLORS.warning : COLORS.text }}>
              {node.rssi} dBm {node.rssi < -80 && <span style={{ fontSize: '0.6rem', color: COLORS.warning }}>(Weak)</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext }}>
              <Network size={12} /> Packet Loss
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 950, color: node.packetLoss > 5 ? COLORS.danger : COLORS.text }}>
              {node.packetLoss}%
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext }}>
              <Activity size={12} /> Latency
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 950, color: node.latency > 200 ? COLORS.danger : (node.latency > 80 ? COLORS.warning : COLORS.primary) }}>
              {node.latency} ms
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext }}>
              <Clock size={12} /> Uptime
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 950, color: COLORS.text }}>
              {node.uptime}
            </div>
          </div>
        </div>
      )}

      {isOffline && (
        <div style={{ padding: '1.5rem', background: '#FEF2F2', borderRadius: '20px', marginBottom: '1.5rem', textAlign: 'center' }}>
          <AlertCircle size={24} color={COLORS.danger} style={{ marginBottom: '8px' }} />
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 900, color: COLORS.danger }}>DEVICE DISCONNECTED</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.65rem', fontWeight: 700, color: '#F87171' }}>Last seen: {node.lastSeen}</p>
        </div>
      )}

      {/* Control Actions */}
      <div style={{ display: 'flex', gap: '10px', paddingTop: '1.5rem', borderTop: `1px solid ${COLORS.border}` }}>
        <ActionBtn icon={RefreshCw} label="Ping" disabled={isOffline} color={COLORS.secondary} />
        <ActionBtn icon={Power} label="Restart" disabled={isOffline} color={COLORS.danger} />
        <ActionBtn icon={Sliders} label="Config" disabled={isOffline} color={COLORS.primary} />
      </div>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────

const DeviceManagement = () => {
  const { sensorData, mqttStatus, lastGlobalUpdate } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Validate Node Status Logic
  const getSensorStatus = (val, range = null) => {
    if (val === null || val === undefined) return 'inactive';
    if (range && (val < range[0] || val > range[1])) return 'error';
    return 'active';
  };

  const processedNodes = useMemo(() => {
    // 1. Soil Node
    const soilSensors = [
      { name: 'Moisture', status: getSensorStatus(sensorData.soil?.moisture, [0, 100]) },
      { name: 'NPK', status: getSensorStatus(sensorData.soil?.npk?.n, [0, 1000]) },
      { name: 'pH', status: getSensorStatus(sensorData.soil?.ph, [0, 14]) }
    ];
    const isSoilOnline = sensorData.soil?.moisture !== null;
    
    // 2. Weather Node
    const weatherSensors = [
      { name: 'Temperature', status: getSensorStatus(sensorData.weather?.temp, [-40, 85]) },
      { name: 'Humidity', status: getSensorStatus(sensorData.weather?.humidity, [0, 100]) },
      { name: 'Rainfall', status: getSensorStatus(sensorData.weather?.rainLevel, [0, 1000]) },
      { name: 'LDR', status: getSensorStatus(sensorData.weather?.lightIntensity, [0, 10000]) }
    ];
    const isWeatherOnline = sensorData.weather?.temp !== null;

    // 3. Storage Node
    const storageSensors = [
      { name: 'AQI', status: getSensorStatus(sensorData.storage?.aqi, [0, 500]) },
      { name: 'Gas', status: getSensorStatus(sensorData.storage?.mq135, [0, 1000]) },
      { name: 'Temperature', status: getSensorStatus(sensorData.storage?.temp, [-40, 85]) },
      { name: 'Humidity', status: getSensorStatus(sensorData.storage?.humidity, [0, 100]) }
    ];
    const isStorageOnline = sensorData.storage?.temp !== null;

    // 4. Irrigation Node
    const irrigationSensors = [
      { name: 'Water Level', status: getSensorStatus(sensorData.water?.level, [0, 100]) },
      { name: 'Pump Control', status: 'active' } // Virtual sensor for control state
    ];
    const isIrrigationOnline = sensorData.water?.level !== null;

    const nodesMetadata = [
      { id: 'soil', name: 'Soil Node Alpha', model: 'ESP32-S3', purpose: 'Precision Agriculture', sensors: soilSensors, isOnline: isSoilOnline, icon: Sprout, color: '#10B981', rssi: -62, latency: 24, packetLoss: 0, uptime: '12d 4h', lastSeen: '2s ago' },
      { id: 'weather', name: 'Weather Station', model: 'ESP32', purpose: 'Environmental Monitoring', sensors: weatherSensors, isOnline: isWeatherOnline, icon: CloudRain, color: '#3B82F6', rssi: -45, latency: 18, packetLoss: 1, uptime: '45d 2h', lastSeen: 'Just now' },
      { id: 'storage', name: 'Storage Vault', model: 'ESP32-C3', purpose: 'Preservation Safety', sensors: storageSensors, isOnline: isStorageOnline, icon: Archive, color: '#8B5CF6', rssi: -82, latency: 145, packetLoss: 4, uptime: '8d 14h', lastSeen: '15s ago' },
      { id: 'irrigation', name: 'Irrigation Matrix', model: 'ESP32-WROOM', purpose: 'Hydration Control', sensors: irrigationSensors, isOnline: isIrrigationOnline, icon: Zap, color: '#F59E0B', rssi: -55, latency: 42, packetLoss: 0, uptime: '22d 8h', lastSeen: '5s ago' }
    ];

    return nodesMetadata.map(node => {
      let state = 'OFFLINE';
      if (node.isOnline) {
        const allActive = node.sensors.every(s => s.status === 'active');
        state = allActive ? 'CONNECTED' : 'PARTIAL';
      }
      return { ...node, connectionState: state };
    });
  }, [sensorData]);

  const clusterStats = useMemo(() => {
    const total = processedNodes.length;
    const online = processedNodes.filter(n => n.connectionState !== 'OFFLINE').length;
    const fullyHealthy = processedNodes.filter(n => n.connectionState === 'CONNECTED').length;
    const degraded = processedNodes.filter(n => n.connectionState === 'PARTIAL').length;
    const offline = processedNodes.filter(n => n.connectionState === 'OFFLINE').length;
    const integrity = Math.round((online / total) * 100);

    return { total, integrity, fullyHealthy, degraded, offline };
  }, [processedNodes]);

  const handleScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(`Discovered ${clusterStats.total} nodes. Cluster Integrity: ${clusterStats.integrity}%`);
    }, 2000);
  };

  return (
    <div style={{ padding: '1.25rem', background: COLORS.bg, minHeight: '100vh', paddingBottom: '100px' }}>
      
      {/* 1. CLUSTER HEALTH SUMMARY */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ 
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', 
          borderRadius: '36px', padding: '2rem', color: 'white', marginBottom: '2rem',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.5)', position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.05 }}><Wifi size={240} /></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS.primary, boxShadow: `0 0 15px ${COLORS.primary}` }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.7, letterSpacing: '0.1em' }}>CLUSTER INFRASTRUCTURE</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 950, margin: 0, letterSpacing: '-0.02em' }}>Matrix Integrity</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: COLORS.primary, lineHeight: 1 }}>{clusterStats.integrity}%</div>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.6, margin: '4px 0 0 0' }}>SYSTEM SCORE</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: COLORS.primary, marginBottom: '4px' }}>
              <CheckCircle2 size={16} /><h3 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>{clusterStats.fullyHealthy}</h3>
            </div>
            <p style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>HEALTHY</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: COLORS.warning, marginBottom: '4px' }}>
              <AlertCircle size={16} /><h3 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>{clusterStats.degraded}</h3>
            </div>
            <p style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>DEGRADED</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: COLORS.danger, marginBottom: '4px' }}>
              <XCircle size={16} /><h3 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>{clusterStats.offline}</h3>
            </div>
            <p style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>OFFLINE</p>
          </div>
        </div>
      </motion.div>

      {/* 2. NODE MATRIX GRID */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 950, color: COLORS.text, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={20} color={COLORS.primary} /> ACTIVE NODE MATRIX
        </h3>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: COLORS.subtext }}>
          {processedNodes.length} DEPLOYED
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {processedNodes.map((node, i) => <NodeCard key={node.id} node={node} index={i} />)}
      </div>

      {/* 3. DIAGNOSTIC CONTROL */}
      <motion.button 
        whileTap={{ scale: 0.97 }}
        onClick={handleScan}
        disabled={isScanning}
        style={{ 
          width: '100%', height: '64px', borderRadius: '24px', 
          background: isScanning ? '#E2E8F0' : `linear-gradient(135deg, ${COLORS.primary}, #065F46)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          border: 'none', color: 'white', fontWeight: 950, fontSize: '1rem', cursor: 'pointer',
          boxShadow: isScanning ? 'none' : `0 15px 35px ${COLORS.primary}30`
        }}
      >
        <motion.div animate={isScanning ? { rotate: 360 } : {}} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <RefreshCw size={22} />
        </motion.div>
        {isScanning ? 'DIAGNOSING CLUSTER...' : 'FULL SYSTEM SCAN'}
      </motion.button>

      {scanResult && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '1.5rem', background: '#F0FDF4', padding: '1rem', borderRadius: '20px', border: '1px solid #BBF7D0', color: '#166534', fontSize: '0.8rem', fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <ShieldCheck size={20} /> {scanResult}
        </motion.div>
      )}

    </div>
  );
};

export default DeviceManagement;
