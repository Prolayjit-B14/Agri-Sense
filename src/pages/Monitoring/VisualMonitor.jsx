/**
 * ESP32-CAM Surveillance System v1.0.0
 * High-integrity real-time monitoring based on hardware-triggered detection.
 * 
 * DESIGN: Industrial Minimalist, High-Density Telemetry.
 * LOGIC: Polling-based hardware state synchronization.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Radio, Activity, Bell, ChevronRight, Eye, 
  EyeOff, Video, Volume2, VolumeX, Zap, Wind, 
  Clock, Wifi, Cpu, ShieldAlert, Thermometer, Battery,
  RefreshCw, Maximize2, AlertTriangle, Lightbulb, Camera as CaptureIcon,
  Smartphone, MapPin, Info
} from 'lucide-react';
import { useApp } from '../../state/AppContext';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',    // Success / Safe
  secondary: '#3B82F6',  // Control / Info
  warning: '#F59E0B',    // Medium Alert
  danger: '#EF4444',     // High Alert / Live
  text: '#0F172A',
  muted: '#64748B',
  border: 'rgba(0,0,0,0.04)',
  bg: '#F8FAFC',
  card: '#FFFFFF'
};

const RAD = {
  card: '28px',
  inner: '18px',
  btn: '14px'
};

// ─── HELPER COMPONENTS ──────────────────────────────────────────────────────

const Badge = ({ children, color, pulse = false }) => (
  <div style={{ 
    background: `${color}15`, color: color, padding: '4px 10px', borderRadius: '10px', 
    fontSize: '0.65rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '6px',
    border: `1px solid ${color}30`, backdropFilter: 'blur(8px)'
  }}>
    {pulse && <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '6px', height: '6px', background: color, borderRadius: '50%' }} />}
    {children}
  </div>
);

const ControlButton = ({ icon: Icon, label, active, onClick, color = COLORS.secondary }) => (
  <motion.button 
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={{ 
      background: active ? color : COLORS.card, 
      border: `1px solid ${active ? color : 'rgba(0,0,0,0.05)'}`,
      borderRadius: RAD.inner, padding: '16px', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', gap: '10px', flex: 1, cursor: 'pointer',
      boxShadow: active ? `0 8px 20px ${color}30` : '0 4px 12px rgba(0,0,0,0.02)'
    }}
  >
    <div style={{ 
      width: '44px', height: '44px', borderRadius: '12px', 
      background: active ? 'rgba(255,255,255,0.2)' : `${color}10`,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={22} color={active ? 'white' : color} />
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 900, color: active ? 'white' : COLORS.text, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '0.55rem', fontWeight: 700, color: active ? 'rgba(255,255,255,0.8)' : COLORS.muted }}>{active ? 'ON' : 'OFF'}</div>
    </div>
  </motion.button>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

const VisualMonitor = () => {
  // ─── STATE ────────────────────────────────────────────────────────────────
  const CAM_IP = 'http://192.168.4.2';
  const streamUrl = `${CAM_IP}/stream`;
  
  // ─── ESP-CAM HARDWARE TOGGLES ───
  const [flashOn, setFlashOn] = useState(false);
  const [buzzerOn, setBuzzerOn] = useState(false);

  const toggleFlash = async () => {
    const newState = !flashOn;
    setFlashOn(newState);
    try { await fetch(`${CAM_IP}/light?state=${newState ? 'on' : 'off'}`); } catch (e) { console.log('Cam offline'); }
  };

  const toggleBuzzer = async () => {
    const newState = !buzzerOn;
    setBuzzerOn(newState);
    try { await fetch(`${CAM_IP}/buzzer?state=${newState ? 'on' : 'off'}`); } catch (e) { console.log('Cam offline'); }
  };

  const captureImage = async () => {
    try {
      window.open(`${CAM_IP}/capture`, '_blank');
    } catch (e) { console.log('Cam offline'); }
  };

  // ─── SIMULATED AI DETECTION ENGINE ───
  const [detection, setDetection] = useState({ active: false, type: '---', level: 'Normal', zone: 'Field Sector A', duration: 0 });

  useEffect(() => {
    // Poll the ESP-CAM for real trained ML detection data
    const fetchDetection = async () => {
      try {
        const res = await fetch(`${CAM_IP}/detection`);
        if (res.ok) {
          const data = await res.json();
          setDetection({ 
            active: data.active, 
            type: data.type !== "None" ? data.type : "---", 
            level: data.level, 
            zone: 'Sector A', 
            duration: 12 // Or pull from ESP if tracked
          });

          // Auto-trigger buzzer if threat is high
          if (data.active && data.level === 'High' && !buzzerOn) {
            toggleBuzzer();
          }
        }
      } catch (e) {
        // Cam offline or endpoint not ready
      }
    };

    const interval = setInterval(fetchDetection, 3000);
    return () => clearInterval(interval);
  }, [buzzerOn]);

  const deviceStatus = 'ONLINE'; // Assuming local connection
  
  const telemetry = {
    fps: '24', latency: '45',
    detection: detection
  };

  const logs = [
    { id: 1, type: 'Wild Boar Detected', zone: 'Sector B', time: '14:45:22', level: 'High', action: 'Buzzer Triggered' },
    { id: 2, type: 'Bird Flock', zone: 'Sector A', time: '14:32:10', level: 'Medium', action: 'Flash Triggered' },
  ];

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="no-scrollbar" style={{ 
      background: COLORS.bg, minHeight: '100dvh', padding: '1.25rem', 
      paddingBottom: '2.5rem', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' 
    }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', padding: '10px 0' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 950, color: COLORS.text, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visual Monitoring Feed</h1>
      </div>

      {/* 1. LIVE CAMERA FEED SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ 
          position: 'relative', borderRadius: '32px', overflow: 'hidden', 
          background: '#000', marginBottom: '1.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' 
        }}
      >
        <div style={{ height: '240px', position: 'relative' }}>
          <img src={streamUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: telemetry.detection.active ? 0.9 : 0.7 }} alt="Camera Feed" />
          
          {/* CAMERA OVERLAYS */}
          <div style={{ position: 'absolute', inset: 0, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Badge color={COLORS.danger} pulse>LIVE</Badge>
                <Badge color={deviceStatus === 'ONLINE' ? COLORS.primary : COLORS.muted}>
                  {deviceStatus}
                </Badge>
              </div>
              <div style={{ textAlign: 'right', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900 }}>FPS: {telemetry.fps}</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 900 }}>{telemetry.latency}ms</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>AI Engine</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 850, color: 'white' }}>Pest & Animal Watch</div>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Maximize2 size={18} />
              </motion.button>
            </div>
          </div>

          {/* MOTION BOUNDING BOX (Simulated Hardware Detection) */}
          {telemetry.detection.active && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ 
                position: 'absolute', left: '30%', top: '40%', width: '120px', height: '100px',
                border: `2px solid ${COLORS.danger}`, borderRadius: '8px', zIndex: 5,
                boxShadow: `0 0 20px ${COLORS.danger}40`
              }}
            >
              <div style={{ position: 'absolute', top: '-22px', left: 0, background: COLORS.danger, color: 'white', fontSize: '0.5rem', fontWeight: 950, padding: '2px 6px', borderRadius: '4px' }}>
                OBJECT DETECTED
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* 2. REAL-TIME DETECTION STATUS (DYNAMIC CARD) */}
      <AnimatePresence>
        {telemetry.detection.active && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ 
              background: '#FEF2F2', borderRadius: RAD.card, padding: '1.25rem', marginBottom: '1.5rem',
              border: `1px solid ${COLORS.danger}20`, boxShadow: '0 8px 30px rgba(239,68,68,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: COLORS.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.danger, textTransform: 'uppercase' }}>Current Trigger</div>
                  <div style={{ fontSize: '1rem', fontWeight: 950, color: COLORS.text }}>{telemetry.detection.type}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: COLORS.muted }}>RISK LEVEL</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: COLORS.danger }}>{telemetry.detection.level}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'white', padding: '10px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: COLORS.muted }}>ZONE</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: COLORS.text }}>{telemetry.detection.zone}</div>
              </div>
              <div style={{ background: 'white', padding: '10px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: COLORS.muted }}>TIMESTAMP</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: COLORS.text }}>14:52:05</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. SMART INSIGHT PANEL (LOGIC-BASED) */}
      <div style={{ 
        background: COLORS.card, borderRadius: RAD.card, padding: '1.25rem', marginBottom: '1.5rem',
        border: `1px solid ${COLORS.border}`, display: 'flex', gap: '12px', alignItems: 'flex-start'
      }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${COLORS.secondary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Info size={20} color={COLORS.secondary} />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: COLORS.text, marginBottom: '4px' }}>AI Vision Insights</div>
          <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: COLORS.muted, lineHeight: 1.5 }}>
            {telemetry.detection.active 
              ? `Threat recognized: ${telemetry.detection.type}. Automated deterrent protocols recommended.`
              : `Field secure. Neural engine actively scanning for avian and ground threats.`}
          </p>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: COLORS.secondary }}>RECOMMENDED ACTION:</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.text }}>{telemetry.detection.active ? 'TRIGGER REPELLENT' : 'MONITOR ONLY'}</span>
          </div>
        </div>
      </div>

      {/* 4. CAMERA HARDWARE CONTROL PANEL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
        <ControlButton 
          icon={Volume2} label="Repellent Buzzer" active={buzzerOn} color={COLORS.danger}
          onClick={toggleBuzzer} 
        />
        <ControlButton 
          icon={Zap} label="Strobe Flash" active={flashOn} color={COLORS.warning}
          onClick={toggleFlash} 
        />
        <ControlButton 
          icon={CaptureIcon} label="Capture HD" active={false} color={COLORS.secondary}
          onClick={captureImage} 
        />
      </div>


      {/* ALERT OVERLAY SYSTEM (Simulated) */}
      <AnimatePresence>
        {telemetry.detection.active && telemetry.detection.level === 'High' && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            style={{ 
              position: 'fixed', top: '20px', left: '20px', right: '20px', 
              background: COLORS.danger, padding: '14px 20px', borderRadius: '16px',
              display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1000,
              boxShadow: '0 10px 40px rgba(239,68,68,0.4)'
            }}
          >
            <AlertTriangle size={24} color="white" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'white' }}>THREAT DETECTED</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{telemetry.detection.type} in {telemetry.detection.zone}!</div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} style={{ border: 'none', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '8px', color: 'white', fontSize: '0.65rem', fontWeight: 950 }}>VIEW</motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

    </div>
  );
};

export default VisualMonitor;
