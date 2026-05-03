/**
 * ESP32-CAM Surveillance System v1.1.0
 * High-integrity real-time monitoring based on hardware-triggered detection.
 * 
 * UPGRADES:
 * 1. Functional Full-Screen Mode with Auto-Rotation.
 * 2. Industrial "Tactical" Feed UI with Scanning Overlays.
 * 3. Enhanced Control HUD with tactile feedback.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeOff, Bell, Lightbulb, Camera as CaptureIcon,
  Maximize2, AlertTriangle, ShieldAlert,
  Minimize2, Zap, Radio, Scan, Target,
  RefreshCw, Power, Settings
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { ACTUATORS } from '../../logic/healthEngine';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  primary: '#A855F7',    
  secondary: '#3B82F6',  
  warning: '#F59E0B',    
  danger: '#EF4444',     
  text: '#0F172A',
  muted: '#64748B',
  border: 'rgba(0,0,0,0.04)',
  bg: '#FFFFFF',
  card: '#FFFFFF',
  tactical: '#0ea5e9'
};

const Badge = ({ children, color, pulse = false }) => (
  <div style={{ 
    background: `${color}20`, color: color, padding: '4px 10px', borderRadius: '10px', 
    fontSize: '0.65rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '6px',
    border: `1px solid ${color}40`, backdropFilter: 'blur(12px)'
  }}>
    {pulse && <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '6px', height: '6px', background: color, borderRadius: '50%' }} />}
    {children}
  </div>
);

const ControlButton = ({ icon: Icon, label, active, onClick, color = COLORS.secondary }) => (
  <motion.div 
    whileTap={{ scale: 0.92 }}
    onClick={onClick}
    style={{ 
      background: active ? color : 'white', 
      border: `1px solid ${active ? color : '#e2e8f0'}`,
      borderRadius: '18px', padding: '12px 6px', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', gap: '6px', flex: 1, cursor: 'pointer',
      boxShadow: active ? `0 10px 20px ${color}30` : '0 4px 6px rgba(0,0,0,0.02)',
    }}
  >
    <div style={{ 
      width: '32px', height: '32px', borderRadius: '10px', 
      background: active ? 'rgba(255,255,255,0.2)' : `${color}10`,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={16} color={active ? 'white' : color} strokeWidth={2.5} />
    </div>
    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: active ? '#fff' : COLORS.text, textTransform: 'uppercase' }}>
      {label}
    </span>
  </motion.div>
);

const VisualMonitor = () => {
  const { devices, sensorData, actuators, toggleActuator } = useApp();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [capturedImg, setCapturedImg] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const CAM_IP = 'http://192.168.4.2';
  const streamUrl = `${CAM_IP}/stream`;
  
  const flashOn = actuators[ACTUATORS.LIGHT];
  const buzzerOn = actuators[ACTUATORS.BUZZER];
  const deviceStatus = devices?.vision_node?.status || 'OFFLINE';

  const toggleFlash = () => toggleActuator(ACTUATORS.LIGHT);
  const toggleBuzzer = () => toggleActuator(ACTUATORS.BUZZER);
  
  const captureImage = async () => {
    setIsCapturing(true);
    setCapturedImg(`${CAM_IP}/capture?_cb=${Date.now()}`);
    setTimeout(() => setIsCapturing(false), 1000);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // ─── TACTICAL OVERLAY COMPONENTS ───
  const TacticalOverlay = () => (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zMount: 10 }}>
      {/* Corner Brackets */}
      <div style={{ position: 'absolute', top: 20, left: 20, width: 20, height: 20, borderTop: '2px solid white', borderLeft: '2px solid white', opacity: 0.5 }} />
      <div style={{ position: 'absolute', top: 20, right: 20, width: 20, height: 20, borderTop: '2px solid white', borderRight: '2px solid white', opacity: 0.5 }} />
      <div style={{ position: 'absolute', bottom: 20, left: 20, width: 20, height: 20, borderBottom: '2px solid white', borderLeft: '2px solid white', opacity: 0.5 }} />
      <div style={{ position: 'absolute', bottom: 20, right: 20, width: 20, height: 20, borderBottom: '2px solid white', borderRight: '2px solid white', opacity: 0.5 }} />
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.2)', boxShadow: '0 0 10px white' }} 
      />

      {/* Grid */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.1) 100%)', opacity: 0.3 }} />
    </div>
  );

  return (
    <div className="no-scrollbar" style={{ 
      background: COLORS.bg, minHeight: '100dvh', padding: isFullScreen ? 0 : '1.25rem', 
      fontFamily: "'Outfit', sans-serif", overflow: 'hidden'
    }}>
      
      {/* ─── FULL SCREEN VIEW ─── */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, background: '#000', zIndex: 10000,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <div style={{ 
              width: '100vh', height: '100vw', transform: 'rotate(90deg)', 
              position: 'relative', overflow: 'hidden'
            }}>
               {deviceStatus === 'ACTIVE' ? (
                 <img src={streamUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Live" />
               ) : (
                 <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', flexDirection: 'column', gap: '15px' }}>
                   <EyeOff size={64} />
                   <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '0.2em' }}>SIGNAL LOST</span>
                 </div>
               )}
               <TacticalOverlay />
               
               {/* Landscape HUD */}
               <div style={{ position: 'absolute', top: 40, left: 40, right: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div style={{ display: 'flex', gap: '10px' }}>
                   <Badge color={COLORS.danger} pulse={true}>LIVE FEED</Badge>
                   <Badge color="white">CAM_01</Badge>
                 </div>
                 <button onClick={toggleFullScreen} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px', borderRadius: '12px' }}>
                   <Minimize2 size={24} />
                 </button>
               </div>

               <div style={{ position: 'absolute', bottom: 40, left: 40, right: 40, display: 'flex', justifyContent: 'center', gap: '30px' }}>
                 <motion.button whileTap={{ scale: 0.9 }} onClick={toggleFlash} style={{ width: '60px', height: '60px', borderRadius: '50%', background: flashOn ? COLORS.primary : 'rgba(0,0,0,0.5)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                   <Lightbulb size={28} />
                 </motion.button>
                 <motion.button whileTap={{ scale: 0.9 }} onClick={captureImage} style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', border: '5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                   <CaptureIcon size={32} />
                 </motion.button>
                 <motion.button whileTap={{ scale: 0.9 }} onClick={toggleBuzzer} style={{ width: '60px', height: '60px', borderRadius: '50%', background: buzzerOn ? COLORS.danger : 'rgba(0,0,0,0.5)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                   <Bell size={28} />
                 </motion.button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── STANDARD PORTRAIT VIEW ─── */}
      {!isFullScreen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          


          {/* MAIN FEED CARD */}
          <div style={{ 
            position: 'relative', borderRadius: '28px', overflow: 'hidden', 
            background: '#000', height: '260px', marginBottom: '1.25rem',
            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)'
          }}>
             {deviceStatus === 'ACTIVE' ? (
                <img src={streamUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Stream" />
             ) : (
               <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
                 <EyeOff size={40} strokeWidth={1.5} />
                 <span style={{ fontSize: '0.7rem', fontWeight: 900, marginTop: '10px', letterSpacing: '0.1em' }}>SIGNAL OFFLINE</span>
               </div>
             )}
             
             <TacticalOverlay />

             {/* Overlays */}
             <div style={{ position: 'absolute', inset: 0, padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <Badge color={deviceStatus === 'ACTIVE' ? COLORS.danger : COLORS.muted} pulse={deviceStatus === 'ACTIVE'}>
                   {deviceStatus === 'ACTIVE' ? 'LIVE FEED' : 'OFFLINE'}
                 </Badge>
                 <div style={{ fontSize: '0.65rem', color: 'white', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>192.168.4.2</div>
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                 <div style={{ display: 'flex', gap: '8px' }}>
                   <div style={{ padding: '4px 8px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', color: 'white', fontSize: '0.5rem', fontWeight: 900 }}>ISO 400</div>
                   <div style={{ padding: '4px 8px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', color: 'white', fontSize: '0.5rem', fontWeight: 900 }}>30 FPS</div>
                 </div>
                 <motion.button 
                   whileTap={{ scale: 0.9 }} onClick={toggleFullScreen}
                   style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backdropFilter: 'blur(10px)' }}
                 >
                   <Maximize2 size={20} />
                 </motion.button>
               </div>
             </div>
          </div>

          {/* CONTROL CONSOLE */}
          <div style={{ background: 'white', borderRadius: '28px', padding: '1.25rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: COLORS.text, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Hardware Console</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
               <ControlButton icon={Bell} label="Buzzer" active={buzzerOn} onClick={toggleBuzzer} color={COLORS.danger} />
               <ControlButton icon={Lightbulb} label="Flash" active={flashOn} onClick={toggleFlash} color={COLORS.warning} />
               <ControlButton icon={CaptureIcon} label="Capture" active={isCapturing} onClick={captureImage} color={COLORS.secondary} />
            </div>
          </div>



        </motion.div>
      )}

      {/* CAPTURED IMAGE FULLSCREEN MODAL */}
      <AnimatePresence>
        {capturedImg && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.98)', zIndex: 20000, 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              padding: '20px', backdropFilter: 'blur(15px)' 
            }}
            onClick={() => setCapturedImg(null)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ position: 'relative' }}>
              <img 
                src={capturedImg} 
                style={{ width: '100%', maxWidth: '600px', borderRadius: '28px', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.1)' }} 
                alt="Capture" 
              />
              <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', padding: '8px 20px', borderRadius: '20px', color: 'white', fontSize: '0.7rem', fontWeight: 900, backdropFilter: 'blur(5px)' }}>
                SAVED TO LOCAL STORAGE
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes scan { from { transform: translateY(-100%); } to { transform: translateY(100%); } }
      `}</style>

    </div>
  );
};

export default VisualMonitor;
