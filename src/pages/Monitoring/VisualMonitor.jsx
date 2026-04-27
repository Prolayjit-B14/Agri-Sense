/**
 * ESP32-CAM Surveillance System v1.0.0
 * High-integrity real-time monitoring based on hardware-triggered detection.
 * 
 * DESIGN: Industrial Minimalist, High-Density Telemetry.
 * LOGIC: Polling-based hardware state synchronization.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeOff, Bell, Lightbulb, Camera as CaptureIcon,
  Maximize2, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { ACTUATORS } from '../../logic/healthEngine';

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

const ControlButton = ({ icon: Icon, label, active, onClick, color = COLORS.secondary, offText = "OFF", isAction = false }) => (
  <motion.div 
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={{ 
      background: active ? color : COLORS.card, 
      border: `1px solid ${active ? color : COLORS.border}`,
      borderRadius: '14px', padding: '10px 4px', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', gap: '5px', flex: 1, cursor: 'pointer',
      boxShadow: active ? `0 4px 12px ${color}25` : '0 1px 4px rgba(0,0,0,0.03)',
      userSelect: 'none',
    }}
  >
    <div style={{ 
      width: '30px', height: '30px', borderRadius: '10px', 
      background: active ? 'rgba(255,255,255,0.2)' : `${color}10`,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={14} color={active ? 'white' : color} strokeWidth={2.5} />
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.55rem', fontWeight: 900, color: active ? '#fff' : COLORS.text, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
        {label}
      </div>
    </div>
  </motion.div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

const VisualMonitor = () => {
  // ─── STATE ────────────────────────────────────────────────────────────────
  const CAM_IP = 'http://192.168.4.2';
  const streamUrl = `${CAM_IP}/stream`;
  
  const { devices, sensorData, actuators, toggleActuator } = useApp();

  // ─── ESP-CAM HARDWARE TOGGLES ───
  const flashOn = actuators[ACTUATORS.LIGHT];
  const buzzerOn = actuators[ACTUATORS.BUZZER];

  const toggleFlash = useCallback(() => toggleActuator(ACTUATORS.LIGHT), [toggleActuator]);
  const toggleBuzzer = useCallback(() => toggleActuator(ACTUATORS.BUZZER), [toggleActuator]);
  
  const [capturedImg, setCapturedImg] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureImage = async () => {
    try {
      setIsCapturing(true);
      const timestamp = Date.now();
      setCapturedImg(`${CAM_IP}/capture?_cb=${timestamp}`);
      setTimeout(() => setIsCapturing(false), 1000);
    } catch (e) { 
      setIsCapturing(false);
      console.log('Cam offline'); 
    }
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
  }, [buzzerOn, toggleBuzzer]);

  const deviceStatus = devices?.vision_node?.status || 'OFFLINE';
  
  const telemetry = {
    fps: deviceStatus === 'ACTIVE' ? '30' : '---', 
    latency: devices?.vision_node?.metrics?.latency || '---',
    detection: sensorData?.vision || detection
  };

  const logs = []; // No mock history logs

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="no-scrollbar" style={{ 
      background: COLORS.bg, minHeight: '100%', padding: '1.25rem', 
      paddingBottom: '0', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' 
    }}>
      
      {/* 1. LIVE CAMERA FEED SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ 
          position: 'relative', borderRadius: '32px', overflow: 'hidden', 
          background: '#000', marginBottom: '1.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' 
        }}
      >
        <div style={{ height: '240px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A' }}>
          {deviceStatus === 'ACTIVE' ? (
            <img src={streamUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: telemetry.detection.active ? 0.9 : 0.7 }} alt="Camera Feed" />
          ) : (
            <div style={{ textAlign: 'center', color: '#475569' }}>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                <EyeOff size={48} strokeWidth={1.5} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Signal Lost</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.6 }}>Check hardware power & network</div>
            </div>
          )}
          
          {/* CAMERA OVERLAYS */}
          <div style={{ position: 'absolute', inset: 0, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Badge color={deviceStatus === 'ACTIVE' ? COLORS.primary : COLORS.muted}>
                  {deviceStatus === 'ACTIVE' ? 'ONLINE' : deviceStatus}
                </Badge>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
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
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: COLORS.text }}>
                  {telemetry.detection.timestamp ? new Date(telemetry.detection.timestamp).toLocaleTimeString() : '---'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. CAMERA HARDWARE CONTROL PANEL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '1.5rem' }}>
        <ControlButton 
          icon={Bell} label="Buzzer" active={buzzerOn} color={COLORS.danger}
          onClick={toggleBuzzer} 
        />
        <ControlButton 
          icon={Lightbulb} label="Light" active={flashOn} color={COLORS.primary}
          onClick={toggleFlash} 
        />
        <ControlButton 
          icon={CaptureIcon} label="Capture" active={isCapturing} color={COLORS.secondary}
          onClick={captureImage} isAction={true}
        />
      </div>

      {/* ENVIRONMENTAL TELEMETRY REMOVED PER USER REQUEST */}


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

      {/* CAPTURED IMAGE FULLSCREEN MODAL */}
      <AnimatePresence>
        {capturedImg && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.95)', zIndex: 9999, 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              padding: '20px', backdropFilter: 'blur(10px)' 
            }}
            onClick={() => setCapturedImg(null)}
          >
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              src={capturedImg} 
              style={{ width: '100%', maxWidth: '500px', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.1)' }} 
              alt="Hardware Capture" 
            />
            <div style={{ 
              marginTop: '30px', color: 'white', fontWeight: 900, 
              letterSpacing: '0.15em', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)',
              padding: '10px 20px', borderRadius: '30px'
            }}>
              TAP ANYWHERE TO CLOSE
            </div>
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
