/**
 * AgriSense v2.8.0 Visual Monitoring (Neural Vision)
 * Real-time AI-driven incursion detection, neural feed analysis, and pest repellent control.
 */

// ─── IMPORTS ────────────────────────────────────────────────────────────────
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Radio, Activity, 
  Bell, ChevronRight, Eye, 
  EyeOff, Video, Volume2, VolumeX,
  Bug, Bird, Dog, Zap, Wind,
  Clock, Wifi, Cpu
} from 'lucide-react';

// Context & Utils
import { useApp } from '../context/AppContext';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  secondary: '#3B82F6',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#1E293B',
  subtext: '#64748B',
  bg: '#F8FAFC',
  border: '#F1F5F9',
  terminal: '#0F172A'
};

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

const ControlBtn = ({ icon: Icon, onClick, active, color = 'white' }) => (
  <motion.button 
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    style={{
      width: '40px', height: '40px', borderRadius: '12px',
      background: active ? `${COLORS.primary}20` : 'rgba(255,255,255,0.1)',
      border: `1px solid ${active ? COLORS.primary : 'rgba(255,255,255,0.2)'}`,
      color: active ? COLORS.primary : color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', backdropFilter: 'blur(8px)'
    }}
  >
    <Icon size={18} />
  </motion.button>
);

const ActionCard = ({ icon: Icon, label, color, onClick }) => (
  <motion.button 
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={{ 
      background: 'white', border: `1px solid ${color}30`, borderRadius: '20px', 
      padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      boxShadow: `0 4px 15px ${color}08`, flex: 1, cursor: 'pointer'
    }}
  >
    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={18} color={color} />
    </div>
    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: COLORS.text }}>{label}</span>
  </motion.button>
);

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

const VisualMonitoring = () => {
  // ─── STATE ────────────────────────────────────────────────────────────────
  const [isAiOn, setIsAiOn] = useState(true);
  const [isRecording, setIsRecording] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(false);
  
  // ─── DERIVED STATE ────────────────────────────────────────────────────────
  const activeDetections = useMemo(() => [
    { id: 1, type: 'Locust', confidence: 94, x: '20%', y: '35%', w: '100px', h: '100px', severity: 'High' },
    { id: 2, type: 'Pigeon', confidence: 88, x: '65%', y: '50%', w: '80px', h: '80px', severity: 'Med' }
  ], []);

  const timeline = [
    { id: 1, event: 'Locust Cluster identified', time: '17:18:45', cat: 'Pest', icon: Bug, color: COLORS.danger },
    { id: 2, event: 'Bird intrusion detected', time: '17:16:12', cat: 'Animal', icon: Bird, color: COLORS.warning },
    { id: 3, event: 'Stray dog near gate', time: '17:10:05', cat: 'Security', icon: Dog, color: COLORS.secondary },
  ];

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1.25rem', background: COLORS.bg, minHeight: '100vh', paddingBottom: '100px', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* 1. NEURAL FEED HERO */}
      <div style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', background: '#000', marginBottom: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: `2px solid ${COLORS.terminal}` }}>
        <div style={{ height: '380px', position: 'relative' }}>
           <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=1000" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
           />
           
           {/* AI SCANNING SCANLINE */}
           <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }} 
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)`, zIndex: 10, boxShadow: `0 0 15px ${COLORS.primary}` }}
           />

           {/* AI BBOX OVERLAYS */}
           <AnimatePresence>
             {isAiOn && activeDetections.map((det) => (
                <motion.div 
                  key={det.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ 
                    position: 'absolute', left: det.x, top: det.y, width: det.w, height: det.h, 
                    border: `2px solid ${det.severity === 'High' ? COLORS.danger : COLORS.warning}`, 
                    borderRadius: '12px', zIndex: 15, boxShadow: `0 0 20px ${det.severity === 'High' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`
                  }}
                >
                  <div style={{ position: 'absolute', top: '-28px', left: 0, background: det.severity === 'High' ? COLORS.danger : COLORS.warning, color: 'white', fontSize: '0.65rem', fontWeight: 950, padding: '4px 10px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                    {det.type.toUpperCase()} {det.confidence}%
                  </div>
                </motion.div>
             ))}
           </AnimatePresence>

           {/* OVERLAY UI */}
           <div style={{ position: 'absolute', inset: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ background: COLORS.danger, color: 'white', padding: '6px 12px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <div style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%', animation: 'pulse 1s infinite' }} /> LIVE
                    </div>
                    <div style={{ background: 'rgba(15,23,42,0.6)', color: COLORS.primary, padding: '6px 12px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 950, border: `1px solid ${COLORS.primary}40`, backdropFilter: 'blur(10px)' }}>
                       NEURAL: {isAiOn ? 'ACTIVE' : 'IDLE'}
                    </div>
                 </div>
                 <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.7)', fontSize: '0.6rem', fontWeight: 900 }}>
                    <p style={{ margin: 0 }}>FPS: 24.2</p>
                    <p style={{ margin: '4px 0 0 0' }}>LATENCY: 12ms</p>
                 </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                 <div style={{ display: 'flex', gap: '10px' }}>
                    <ControlBtn icon={Video} active={isRecording} onClick={() => setIsRecording(!isRecording)} />
                    <ControlBtn icon={isAudioOn ? Volume2 : VolumeX} active={isAudioOn} onClick={() => setIsAudioOn(!isAudioOn)} />
                    <ControlBtn icon={isAiOn ? Eye : EyeOff} active={isAiOn} onClick={() => setIsAiOn(!isAiOn)} />
                 </div>
                 <div style={{ background: 'rgba(15,23,42,0.6)', padding: '10px 14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                    <p style={{ fontSize: '0.55rem', fontWeight: 900, color: '#94A3B8', margin: '0 0 4px 0' }}>UAV LINK</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Wifi size={14} color={COLORS.primary} /><span style={{ fontSize: '0.75rem', fontWeight: 950, color: 'white' }}>920Mbps</span></div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. ACTION CONTROLS */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '2.5rem' }}>
         <ActionCard icon={Wind} label="REPELLENT" color={COLORS.secondary} onClick={() => {}} />
         <ActionCard icon={Bell} label="ALARM" color={COLORS.danger} onClick={() => {}} />
         <ActionCard icon={Zap} label="SCAN AREA" color={COLORS.warning} onClick={() => {}} />
      </div>

      {/* 3. DETECTION TELEMETRY */}
      <h3 style={{ fontSize: '0.8rem', fontWeight: 950, color: COLORS.text, marginBottom: '1.25rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={18} color={COLORS.secondary} /> Signal Telemetry
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
         <div style={{ background: 'white', borderRadius: '28px', padding: '1.5rem', border: `1px solid ${COLORS.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}><Bug size={18} color={COLORS.danger} /><span style={{ fontSize: '0.55rem', fontWeight: 950, color: COLORS.danger, background: `${COLORS.danger}10`, padding: '2px 8px', borderRadius: '6px' }}>HIGH</span></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 950, margin: 0 }}>12</h3>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext, margin: 0 }}>INCURSIONS TODAY</p>
         </div>
         <div style={{ background: 'white', borderRadius: '28px', padding: '1.5rem', border: `1px solid ${COLORS.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}><Cpu size={18} color={COLORS.primary} /><span style={{ fontSize: '0.55rem', fontWeight: 950, color: COLORS.primary, background: `${COLORS.primary}10`, padding: '2px 8px', borderRadius: '6px' }}>STABLE</span></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 950, margin: 0 }}>98.4%</h3>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: COLORS.subtext, margin: 0 }}>AI CONFIDENCE</p>
         </div>
      </div>

      {/* 4. RECENT LOGS */}
      <h3 style={{ fontSize: '0.8rem', fontWeight: 950, color: COLORS.text, marginBottom: '1.25rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={18} color={COLORS.primary} /> Vision Event History
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
         {timeline.map((item) => (
           <motion.div key={item.id} whileTap={{ scale: 0.98 }} style={{ background: 'white', borderRadius: '24px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: `1px solid ${COLORS.border}` }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: `${item.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><item.icon size={22} color={item.color} /></div>
              <div style={{ flex: 1 }}><h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: COLORS.text, margin: 0 }}>{item.event}</h4><p style={{ fontSize: '0.7rem', fontWeight: 700, color: COLORS.subtext, margin: 0 }}>{item.cat} • {item.time}</p></div>
              <ChevronRight size={18} color="#CBD5E1" />
           </motion.div>
         ))}
      </div>

      <style>{`
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.4; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default VisualMonitoring;
