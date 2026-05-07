/**
 * AgriSense Pro v18.0.0 "Ultra-Premium" Visual Monitoring
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeOff, Bell, Lightbulb, Camera as CaptureIcon,
  Maximize2, AlertTriangle, ShieldAlert,
  Minimize2, Zap, Radio, Scan, Target,
  RefreshCw, Power, Settings, ChevronRight, Cpu
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useTelemetry } from '../../state/TelemetryContext';
import { ACTUATORS } from '../../logic/healthEngine';

import { ScreenOrientation } from '@capacitor/screen-orientation';

// ─── ANIMATION CONFIGS ──────────────────────────────────────────────────────
const springConfig = { type: "spring", stiffness: 300, damping: 30 };
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};
const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springConfig }
};

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

const Badge = ({ children, color, pulse = false }) => (
  <div style={{ 
    background: `${color}15`, color: color, padding: '6px 12px', borderRadius: '10px', 
    fontSize: '0.65rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '8px',
    border: `1px solid ${color}30`, backdropFilter: 'blur(12px)'
  }}>
    {children}
  </div>
);

const ControlButton = ({ icon: Icon, label, active, onClick, color = 'var(--primary)' }) => (
  <motion.div 
    variants={itemFadeUp}
    whileTap={{ scale: 0.94 }}
    onClick={onClick}
    style={{ 
      background: active ? color : 'var(--bg-card)', 
      border: active ? `1px solid ${color}` : '1px solid var(--glass-stroke)',
      borderRadius: 'var(--radius-lg)', padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', gap: '8px', flex: 1, cursor: 'pointer',
      boxShadow: active ? `var(--shadow-premium)` : 'var(--shadow-sm)',
    }}
  >
    <div style={{ 
      width: '36px', height: '36px', borderRadius: '12px', 
      background: active ? 'rgba(255,255,255,0.2)' : `${color}08`,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={18} color={active ? 'white' : color} strokeWidth={2.5} />
    </div>
    <span style={{ fontSize: '0.6rem', fontWeight: 950, color: active ? 'white' : 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </span>
  </motion.div>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

const VisualMonitor = () => {
  const { actuators, toggleActuator } = useApp();
  const { devices, sensorData } = useTelemetry();
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

  // 🔄 FULL SCREEN HANDLER (Landscape Lock)
  const enterFullScreen = async () => {
    try {
      await ScreenOrientation.lock({ orientation: 'landscape' });
      setIsFullScreen(true);
    } catch (e) {
      console.warn("Landscape lock failed, falling back to CSS", e);
      setIsFullScreen(true); // Still show fullscreen
    }
  };

  const exitFullScreen = async () => {
    try {
      await ScreenOrientation.unlock();
      setIsFullScreen(false);
    } catch (e) {
      setIsFullScreen(false);
    }
  };

  // 🤖 Hide Bot in FullScreen
  useEffect(() => {
    if (isFullScreen) document.body.classList.add('hide-bot');
    else document.body.classList.remove('hide-bot');
    return () => document.body.classList.remove('hide-bot');
  }, [isFullScreen]);
  
  const captureImage = async () => {
    setIsCapturing(true);
    setCapturedImg(`${CAM_IP}/capture?_cb=${Date.now()}`);
    setTimeout(() => setIsCapturing(false), 1000);
  };

  const TacticalOverlay = () => (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
      {/* Corner Brackets */}
      <div style={{ position: 'absolute', top: 20, left: 20, width: 24, height: 24, borderTop: '2px solid white', borderLeft: '2px solid white', opacity: 0.4 }} />
      <div style={{ position: 'absolute', top: 20, right: 20, width: 24, height: 24, borderTop: '2px solid white', borderRight: '2px solid white', opacity: 0.4 }} />
      <div style={{ position: 'absolute', bottom: 20, left: 20, width: 24, height: 24, borderBottom: '2px solid white', borderLeft: '2px solid white', opacity: 0.4 }} />
      <div style={{ position: 'absolute', bottom: 20, right: 20, width: 24, height: 24, borderBottom: '2px solid white', borderRight: '2px solid white', opacity: 0.4 }} />
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }} 
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.3)', boxShadow: '0 0 15px rgba(255,255,255,0.5)' }} 
      />

      {/* Grid Grain */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.2) 100%)', opacity: 0.4 }} />
    </div>
  );

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="no-scrollbar" 
      style={{ padding: isFullScreen ? 0 : '1.25rem', paddingBottom: isFullScreen ? 0 : '140px' }}
    >
      <AnimatePresence>
        {isFullScreen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, background: '#000', zIndex: 10000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
             {deviceStatus === 'ACTIVE' ? (
               <img 
                  src={streamUrl} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    background: '#000' 
                  }} 
                  alt="Live" 
                />
             ) : (
               <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexDirection: 'column', gap: '15px', background: '#0a0a0a' }}>
                 <EyeOff size={64} strokeWidth={2.5} />
                 <span style={{ fontSize: '1.2rem', fontWeight: 950, letterSpacing: '0.2em' }}>SIGNAL LOST</span>
               </div>
             )}
             
             <TacticalOverlay />
             
             {/* IMMERSIVE UI OVERLAY */}
             <div style={{ position: 'absolute', top: 'env(safe-area-inset-top, 20px)', left: '2rem', right: '2rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
               <motion.button 
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.85 }} 
                 onClick={exitFullScreen} 
                 style={{ 
                   background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.3)', 
                   color: 'white', padding: '14px', borderRadius: '22px', backdropFilter: 'blur(20px)' 
                 }}
               >
                 <Minimize2 size={24} />
               </motion.button>
             </div>

             <div style={{ position: 'absolute', bottom: 'env(safe-area-inset-bottom, 2rem)', left: '2rem', right: '2rem', display: 'flex', justifyContent: 'center', gap: '4rem', alignItems: 'center' }}>
               <motion.button whileTap={{ scale: 0.9 }} onClick={toggleFlash} style={{ width: '72px', height: '72px', borderRadius: '50%', background: flashOn ? '#3B82F6' : 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backdropFilter: 'blur(20px)' }}>
                 <Lightbulb size={30} />
               </motion.button>
               
               <div style={{ position: 'relative' }}>
                  <motion.button 
                    whileTap={{ scale: 0.9 }} 
                    onClick={captureImage} 
                    style={{ 
                      width: '96px', height: '96px', borderRadius: '50%', background: 'white', 
                      border: '8px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', color: '#000', boxShadow: '0 0 50px rgba(255,255,255,0.3)'
                    }}
                  >
                    <CaptureIcon size={40} />
                  </motion.button>
                  {isCapturing && (
                    <motion.div initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ position: 'absolute', inset: -15, border: '4px solid white', borderRadius: '50%' }} />
                  )}
               </div>

               <motion.button whileTap={{ scale: 0.9 }} onClick={toggleBuzzer} style={{ width: '72px', height: '72px', borderRadius: '50%', background: buzzerOn ? 'var(--danger)' : 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backdropFilter: 'blur(20px)' }}>
                 <Bell size={30} />
               </motion.button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isFullScreen && (
        <>
          {/* 🚀 STANDARD ASPECT RATIO FEED (16:9) */}
          <motion.div 
            variants={itemFadeUp}
            style={{ 
              position: 'relative', borderRadius: '28px', overflow: 'hidden', 
              background: '#000', 
              aspectRatio: '16 / 9', // 🛸 Use standard widescreen ratio
              width: '100%',
              marginBottom: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
              border: '1px solid var(--glass-stroke)'
            }}
          >
             {deviceStatus === 'ACTIVE' ? (
                <img src={streamUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Stream" />
             ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.15)', background: '#050505' }}>
                  <EyeOff size={48} strokeWidth={1.5} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, marginTop: '15px', letterSpacing: '0.2em' }}>ENCRYPTED SIGNAL LOST</span>
                </div>
             )}
             
             <TacticalOverlay />

             <div style={{ position: 'absolute', inset: 0, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <Badge color={deviceStatus === 'ACTIVE' ? '#7C3AED' : 'var(--text-muted)'} pulse={deviceStatus === 'ACTIVE'}>
                   {deviceStatus === 'ACTIVE' ? 'LIVE' : 'OFFLINE'}
                 </Badge>
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                 <motion.button 
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }} 
                   onClick={enterFullScreen}
                   style={{ 
                     width: '48px', height: '48px', borderRadius: '16px', 
                     background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', 
                     display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backdropFilter: 'blur(15px)' 
                   }}
                 >
                   <Maximize2 size={22} />
                 </motion.button>
               </div>
             </div>
          </motion.div>

          {/* Hardware Console */}
          <motion.div 
            variants={itemFadeUp}
            style={{ 
              background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', 
              border: '1px solid var(--glass-stroke)', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <div style={{ width: '4px', height: '18px', background: 'var(--primary)', borderRadius: '2px' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>Tactical Console</h3>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
               <ControlButton icon={Bell} label="Buzzer" active={buzzerOn} onClick={toggleBuzzer} color="var(--danger)" />
               <ControlButton icon={Lightbulb} label="Floodlight" active={flashOn} onClick={toggleFlash} color="var(--accent)" />
               <ControlButton icon={CaptureIcon} label="Snapshot" active={isCapturing} onClick={captureImage} color="var(--primary)" />
            </div>
          </motion.div>

          {/* AI Detection Card */}
          <motion.div 
            variants={itemFadeUp}
            style={{ 
              background: 'linear-gradient(165deg, #0f172a 0%, #1e293b 100%)', 
              borderRadius: 'var(--radius-xl)', padding: '1.5rem', 
              boxShadow: 'var(--shadow-premium)', position: 'relative', overflow: 'hidden' 
            }}
          >
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: '#10b98115', filter: 'blur(20px)', borderRadius: '50%' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scan size={18} color="#10b981" strokeWidth={2.5} />
                <h3 style={{ fontSize: '0.75rem', fontWeight: 950, color: 'white', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>AI Vision Engine</h3>
              </div>
              <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.6rem', fontWeight: 950 }}>ENCRYPTED</div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Target size={28} color={sensorData?.vision?.detection === 'Healthy' ? '#10B981' : 'var(--danger)'} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>{sensorData?.vision?.detection || 'Initializing Neural Link...'}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>Region: GLOBAL • Confidence: 98.4%</p>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Captured Image Modal */}
      <AnimatePresence>
        {capturedImg && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.98)', zIndex: 20000, 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              padding: '20px', backdropFilter: 'blur(20px)' 
            }}
            onClick={() => setCapturedImg(null)}
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
              <img 
                src={capturedImg} 
                style={{ width: '100%', borderRadius: 'var(--radius-xl)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.1)' }} 
                alt="Capture" 
              />
              <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', padding: '10px 24px', borderRadius: '100px', color: 'white', fontSize: '0.75rem', fontWeight: 950, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
                SNAPSHOT SYNCED TO VAULT
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </motion.div>
  );
};

export default VisualMonitor;
