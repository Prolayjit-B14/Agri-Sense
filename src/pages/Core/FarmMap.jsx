import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../state/AppContext';
import { MASTER_CONFIG } from '../../setup';
import { 
  Map as MapIcon, Satellite, Navigation, 
  Layers, Compass, Activity, Radio, 
  Camera, Shield, Droplets, MapPin,
  Wifi, Signal, Globe
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
  terminal: '#0F172A'
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

const ControlBtn = ({ icon: Icon }) => (
  <motion.button 
    whileTap={{ scale: 0.9 }}
    style={{ 
      width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(255,255,255,0.9)', 
      border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)', cursor: 'pointer'
    }}
  >
    <Icon size={20} color={COLORS.text} />
  </motion.button>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────

const MapView = () => {
  const { farmInfo } = useApp();

  const devices = useMemo(() => [
    { id: 1, name: 'Soil Alpha', top: '25%', left: '42%', icon: Droplets, color: '#0EA5E9' },
    { id: 2, name: 'Silo Node', top: '65%', left: '78%', icon: Radio, color: '#8B5CF6' },
    { id: 3, name: 'Vision S1', top: '45%', left: '15%', icon: Camera, color: '#F59E0B' },
    { id: 4, name: 'Pump Relay', top: '15%', left: '70%', icon: Activity, color: '#EF4444' },
    { id: 5, name: 'Soil Beta', top: '80%', left: '30%', icon: Droplets, color: '#10B981' },
    { id: 6, name: 'Pest Guard', top: '50%', left: '55%', icon: Shield, color: '#EC4899' },
  ], []);

  return (
    <div style={{ padding: '1.25rem', background: COLORS.bg, minHeight: '100vh', paddingBottom: '100px' }}>
      
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 950, color: COLORS.text, margin: 0 }}>Field GIS</h2>
        <p style={{ color: COLORS.subtext, fontSize: '0.8rem', fontWeight: 700, marginTop: '2px' }}>Geospatial Neural Mapping</p>
      </header>

      {/* 1. GIS ENGINE */}
      <div style={{ 
        height: '480px', position: 'relative', borderRadius: '36px', overflow: 'hidden', 
        border: '4px solid white', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', background: '#E2E8F0' 
      }}>
         <iframe 
            width="100%" height="100%" frameBorder="0" scrolling="no" 
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${MASTER_CONFIG.MAP_LNG-0.005},${MASTER_CONFIG.MAP_LAT-0.005},${MASTER_CONFIG.MAP_LNG+0.005},${MASTER_CONFIG.MAP_LAT+0.005}&layer=mapnik&marker=${MASTER_CONFIG.MAP_LAT},${MASTER_CONFIG.MAP_LNG}`}
            style={{ border: 'none', filter: 'grayscale(0.2) contrast(1.1) brightness(0.95)' }}
         />

         {/* 🎯 NODE MARKERS */}
         {devices.map((dev) => (
            <div key={dev.id} style={{ position: 'absolute', top: dev.top, left: dev.left, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ padding: '4px 10px', background: COLORS.terminal, color: 'white', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 950, marginBottom: '6px', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
                >
                   {dev.name.toUpperCase()}
                </motion.div>
                <div style={{ position: 'relative' }}>
                    <motion.div 
                      animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }} 
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ position: 'absolute', inset: '-8px', background: dev.color, borderRadius: '50%' }} 
                    />
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.2)', position: 'relative' }}>
                       <dev.icon size={18} color={dev.color} strokeWidth={3} />
                    </div>
                </div>
            </div>
         ))}

         {/* HUD CONTROLS */}
         <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <ControlBtn icon={Satellite} />
            <ControlBtn icon={Layers} />
            <ControlBtn icon={Compass} />
         </div>

         <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(15, 23, 42, 0.85)', padding: '12px 18px', borderRadius: '20px', color: 'white', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
               <Globe size={14} color={COLORS.primary} />
               <span style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.6, letterSpacing: '0.05em' }}>REGIONAL GRID</span>
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 950, margin: 0 }}>22.975°N, 88.434°E</p>
         </div>
      </div>

      {/* 2. FLEET METRICS */}
      <h3 style={{ fontSize: '0.8rem', fontWeight: 950, color: COLORS.text, margin: '2.5rem 0 1.25rem 0', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={18} color={COLORS.secondary} /> Fleet Deployment
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
         {[
           { l: 'Active', v: '6', c: COLORS.primary, i: Signal },
           { l: 'Offline', v: '0', c: COLORS.subtext, i: Wifi },
           { l: 'Health', v: '100%', c: COLORS.secondary, i: ShieldCheck }
         ].map((s, i) => (
           <div key={i} style={{ background: 'white', borderRadius: '24px', padding: '1.25rem', border: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 900, color: COLORS.subtext, marginBottom: '6px', textTransform: 'uppercase' }}>{s.l}</p>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 950, color: s.c, margin: 0 }}>{s.v}</h4>
           </div>
         ))}
      </div>

    </div>
  );
};

const ShieldCheck = (props) => <Shield {...props} />; // Alias for consistency

export default MapView;
