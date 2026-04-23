/**
 * AgriSense v3.20 Forensic Diagnostic Engine
 * Native Share Bridge, High-Res Canvas Capture, and Consolidated NPK Ledger.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Activity, Droplets, FlaskConical, CheckCircle2, 
  RefreshCw, Undo, Calendar, Clock, Navigation, MapPin, Zap, Download, Atom, Sparkles
} from 'lucide-react';

// Native Bridges
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// Context & Utils
import { useApp } from '../context/AppContext';
import { MASTER_CONFIG } from '../config';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981', secondary: '#3B82F6', warning: '#F59E0B', danger: '#EF4444',
  text: '#0F172A', subtext: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', terminal: '#1E293B',
  nutrient: { n: '#10B981', p: '#A855F7', k: '#EC4899', ph: '#F59E0B', m: '#3B82F6' },
  zone: { vLow: '#EF4444', low: '#F97316', mod: '#F59E0B', opt: '#10B981', high: '#064E3B' }
};

// ─── MATH UTILS ───────────────────────────────────────────────────────────
const calculateShoelaceArea = (points) => {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    let j = (i + 1) % points.length;
    area += points[i].x * points[j].y; area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
};

const isPointInPolygon = (point, vs) => {
  let x = point.x, y = point.y; let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i].x, yi = vs[i].y; let xj = vs[j].x, yj = vs[j].y;
    let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const StepIndicator = ({ currentStep }) => (
  <div style={{ background: 'white', padding: '1rem', borderBottom: `1px solid ${COLORS.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(step => (
        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: currentStep >= step ? COLORS.primary : COLORS.bg, color: currentStep >= step ? 'white' : COLORS.subtext, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>{currentStep > step ? <CheckCircle2 size={16} /> : step}</div>
          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: currentStep >= step ? COLORS.text : COLORS.subtext, textTransform: 'uppercase' }}>{['Map', 'Strategy', 'Collect', 'Zones', 'Report'][step-1]}</span>
        </div>
      ))}
    </div>
  </div>
);

const PrecisionSoilTesting = () => {
  const { sensorData } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [boundaryPoints, setBoundaryPoints] = useState([]);
  const [gpsAccuracy, setGpsAccuracy] = useState(5.0);
  const [samples, setSamples] = useState([]);
  const [selectedDensity, setSelectedDensity] = useState('max');
  const [activeSampleIndex, setActiveSampleIndex] = useState(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectProgress, setCollectProgress] = useState(0);
  const [currentReadings, setCurrentReadings] = useState([]);
  const [analysisLayer, setAnalysisLayer] = useState('Moisture');
  const [lockedBBox, setLockedBBox] = useState(null);
  const [zoom] = useState(19); 
  const [mapCenter] = useState({ lat: MASTER_CONFIG.MAP_LAT || 22.5726, lng: MASTER_CONFIG.MAP_LNG || 88.3639 });

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition((pos) => setGpsAccuracy(pos.coords.accuracy.toFixed(1)), (err) => console.error(err), { enableHighAccuracy: true });
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const calculateBBox = useCallback(() => {
    if (lockedBBox) return lockedBBox;
    const offset = 0.003 / Math.pow(2, zoom - 15);
    return `${mapCenter.lng - offset},${mapCenter.lat - offset},${mapCenter.lng + offset},${mapCenter.lat + offset}`;
  }, [mapCenter, zoom, lockedBBox]);

  const handleAddPoint = (e) => {
    if (currentStep !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setBoundaryPoints([...boundaryPoints, { x, y }]);
  };

  const areaAcre = Math.max(0.01, (calculateShoelaceArea(boundaryPoints) * (15 / Math.pow(2, zoom - 18)) * 0.000247105)).toFixed(2);

  const sampleRequirements = useMemo(() => {
    const acre = parseFloat(areaAcre);
    return { min: Math.max(2, Math.round(acre * 3) + 1), max: Math.max(3, Math.round(acre * 8) + 2) };
  }, [areaAcre]);

  const generateStrategy = (type = 'max') => {
    if (boundaryPoints.length < 3) return;
    setLockedBBox(calculateBBox());
    setSelectedDensity(type);
    const count = type === 'max' ? sampleRequirements.max : sampleRequirements.min;
    const minX = Math.min(...boundaryPoints.map(p => p.x)) + 10; const maxX = Math.max(...boundaryPoints.map(p => p.x)) - 10;
    const minY = Math.min(...boundaryPoints.map(p => p.y)) + 10; const maxY = Math.max(...boundaryPoints.map(p => p.y)) - 10;
    const newSamples = []; let attempts = 0;
    while (newSamples.length < count && attempts < 500) {
      const c = { x: minX + Math.random() * (maxX - minX), y: minY + Math.random() * (maxY - minY) };
      if (isPointInPolygon(c, boundaryPoints)) newSamples.push({ id: newSamples.length + 1, ...c, status: 'pending', readings: null });
      attempts++;
    }
    setSamples(newSamples); if (currentStep === 1) setCurrentStep(2);
  };

  const startCollection = (index) => { setCurrentReadings([]); setCollectProgress(0); setActiveSampleIndex(index); setIsCollecting(true); };

  useEffect(() => {
    let timer;
    if (isCollecting && activeSampleIndex !== null && collectProgress < 100) {
      timer = setTimeout(() => {
        if (!sensorData.soil || sensorData.soil.moisture === '---') return;
        const now = new Date();
        const newVal = {
          moisture: sensorData.soil.moisture !== null ? parseFloat(sensorData.soil.moisture).toFixed(1) : '---',
          ph: sensorData.soil.ph !== null ? parseFloat(sensorData.soil.ph).toFixed(1) : '---',
          n: sensorData.soil.npk?.n !== null ? parseInt(sensorData.soil.npk.n) : '---',
          p: sensorData.soil.npk?.p !== null ? parseInt(sensorData.soil.npk.p) : '---',
          k: sensorData.soil.npk?.k !== null ? parseInt(sensorData.soil.npk.k) : '---',
          date: now.toLocaleDateString(), 
          time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
          gps: `${mapCenter.lat.toFixed(6)}, ${mapCenter.lng.toFixed(6)}`
        };
        setCurrentReadings(prev => [...prev, newVal]); setCollectProgress(prev => prev + 33.4);
      }, 1500);
    } else if (isCollecting && collectProgress >= 100) {
      const finalMean = {
        moisture: (currentReadings.reduce((a, b) => a + parseFloat(b.moisture), 0) / currentReadings.length).toFixed(1),
        ph: (currentReadings.reduce((a, b) => a + parseFloat(b.ph), 0) / currentReadings.length).toFixed(1),
        npk: { n: Math.round(currentReadings.reduce((a, b) => a + b.n, 0) / currentReadings.length), p: Math.round(currentReadings.reduce((a, b) => a + b.p, 0) / currentReadings.length), k: Math.round(currentReadings.reduce((a, b) => a + b.k, 0) / currentReadings.length) },
        date: currentReadings[0]?.date, time: currentReadings[0]?.time, gps: currentReadings[0]?.gps
      };
      setSamples(prev => prev.map((s, i) => i === activeSampleIndex ? { ...s, readings: finalMean, status: 'completed' } : s));
      setIsCollecting(false); setActiveSampleIndex(null); setCurrentReadings([]);
    }
    return () => clearTimeout(timer);
  }, [isCollecting, collectProgress, currentReadings, activeSampleIndex, sensorData.soil, mapCenter]);

  const calculateIDWValue = (x, y, type) => {
    if (samples.length === 0) return 0;
    let num = 0, den = 0;
    samples.forEach(s => {
      const dist = Math.sqrt(Math.pow(x - s.x, 2) + Math.pow(y - s.y, 2));
      const w = 1 / (Math.pow(dist, 2) + 0.1);
      const val = type === 'Moisture' ? parseFloat(s.readings?.moisture || 0) : type === 'PH' ? parseFloat(s.readings?.ph || 0) : (s.readings?.npk?.n || 0);
      num += val * w; den += w;
    });
    return num / den;
  };

  const getZoneColor = (val, type) => {
    const t = type === 'Moisture' ? [15, 25, 35, 50] : type === 'PH' ? [5.5, 6.2, 7.3, 8.0] : [30, 50, 75, 100];
    if (val < t[0]) return COLORS.zone.vLow; if (val < t[1]) return COLORS.zone.low; if (val < t[2]) return COLORS.zone.mod; if (val < t[3]) return COLORS.zone.opt; return COLORS.zone.high;
  };

  const healthReport = useMemo(() => {
    if (samples.length === 0 || samples.some(s => s.status !== 'completed')) return null;
    const avg = (k, sub) => {
      const validSamples = samples.filter(s => s.readings);
      if (validSamples.length === 0) return 0;
      const sum = validSamples.reduce((a, b) => a + (sub ? (b.readings[k]?.[sub] || 0) : (parseFloat(b.readings[k]) || 0)), 0);
      return sum / validSamples.length;
    };
    const m = avg('moisture'); const ph = avg('ph'); const n = avg('npk', 'n'); const p = avg('npk', 'p'); const k = avg('npk', 'k');
    const score = Math.max(0, Math.min(100, Math.round(((m/40)*40) + ((1 - Math.abs(ph-6.8)/2)*30) + ((n/60)*30))));
    return { score, moisture: m.toFixed(1), ph: ph.toFixed(1), n: Math.round(n), p: Math.round(p), k: Math.round(k) };
  }, [samples]);

  const handleExportPDF = async () => {
    const reportElement = document.getElementById('soil-report');
    if (!reportElement) return;

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#F8FAFC' 
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      
      const fileName = `Soil_Audit_${Math.floor(Date.now()/1000)}.pdf`;
      const result = await Filesystem.writeFile({
        path: fileName,
        data: pdfBase64,
        directory: Directory.Cache
      });
      
      await Share.share({
        title: 'Forensic Soil Audit',
        text: 'AgriSense Precision Diagnostic Report',
        url: result.uri,
        dialogTitle: 'Export Soil Report'
      });
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('PDF Generation Failed. Please ensure maps have loaded.');
    }
  };

  const PrimaryCTA = ({ onClick, children, disabled, icon: Icon }) => (
    <button onClick={onClick} disabled={disabled} style={{ width: '100%', height: '58px', borderRadius: '16px', background: COLORS.primary, color: 'white', fontWeight: 950, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: `0 8px 20px ${COLORS.primary}30`, opacity: disabled ? 0.5 : 1 }}>
      {Icon && <Icon size={20} />}{children}
    </button>
  );

  return (
    <div style={{ background: COLORS.bg, minHeight: 'auto', paddingBottom: '20px', fontFamily: "'Outfit', sans-serif" }}>
      <StepIndicator currentStep={currentStep} />
      <div style={{ padding: '1rem' }}>
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="st1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}><h2 style={{ fontSize: '1.3rem', fontWeight: 950 }}>Field Mapping</h2><div style={{ padding: '5px 10px', background: '#F0FDF4', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900 }}>{gpsAccuracy}m</div></div>
              <div onClick={handleAddPoint} style={{ height: '380px', background: '#E2E8F0', borderRadius: '28px', position: 'relative', border: '4px solid white', overflow: 'hidden' }}>
                 <iframe width="100%" height="100%" frameBorder="0" src={`https://www.openstreetmap.org/export/embed.html?bbox=${calculateBBox()}&layer=mapnik`} style={{ filter: 'grayscale(0.3)', pointerEvents: 'none' }} />
                 <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}><polygon points={boundaryPoints.map(p => `${p.x},${p.y}`).join(' ')} fill={`${COLORS.primary}15`} stroke={COLORS.primary} strokeWidth="3" strokeDasharray="6 4" />{boundaryPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="8" fill="white" stroke={COLORS.primary} strokeWidth="3" />)}</svg>
                 <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: COLORS.terminal, color: 'white', padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>{areaAcre} Acres</div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}><button onClick={() => setBoundaryPoints(boundaryPoints.slice(0, -1))} style={{ flex: 1, height: '58px', borderRadius: '16px', border: `1px solid ${COLORS.border}`, background: 'white' }}><Undo size={20} /></button><div style={{ flex: 3 }}><PrimaryCTA onClick={() => generateStrategy('max')} disabled={boundaryPoints.length < 3}>LOCK BOUNDARY</PrimaryCTA></div></div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="st2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ marginBottom: '1rem' }}><h2 style={{ fontSize: '1.3rem', fontWeight: 950 }}>Strategy</h2></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                 <div onClick={() => generateStrategy('min')} style={{ background: selectedDensity === 'min' ? `${COLORS.primary}10` : 'white', padding: '1rem', borderRadius: '20px', border: `2px solid ${selectedDensity === 'min' ? COLORS.primary : COLORS.border}`, textAlign: 'center' }}><p style={{ fontSize: '0.6rem', fontWeight: 900 }}>CORE MIN</p><h3 style={{ fontSize: '1.4rem', fontWeight: 950 }}>{sampleRequirements.min}</h3></div>
                 <div onClick={() => generateStrategy('max')} style={{ background: selectedDensity === 'max' ? `${COLORS.primary}10` : 'white', padding: '1rem', borderRadius: '20px', border: `2px solid ${selectedDensity === 'max' ? COLORS.primary : COLORS.border}`, textAlign: 'center' }}><p style={{ fontSize: '0.6rem', fontWeight: 900 }}>PRECISION MAX</p><h3 style={{ fontSize: '1.4rem', fontWeight: 950 }}>{sampleRequirements.max}</h3></div>
              </div>
              <div style={{ height: '300px', background: 'white', borderRadius: '28px', border: `1px solid ${COLORS.border}`, position: 'relative', marginBottom: '1rem', overflow: 'hidden' }}>
                 <iframe width="100%" height="100%" frameBorder="0" src={`https://www.openstreetmap.org/export/embed.html?bbox=${calculateBBox()}&layer=mapnik`} style={{ filter: 'grayscale(0.4)', pointerEvents: 'none' }} />
                 <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}><polygon points={boundaryPoints.map(p => `${p.x},${p.y}`).join(' ')} fill={`${COLORS.primary}10`} stroke={COLORS.primary} strokeWidth="3" strokeDasharray="6 4" />{samples.map((s, i) => (<g key={i}><circle cx={s.x} cy={s.y} r="14" fill="white" stroke={COLORS.primary} strokeWidth="2" /><text x={s.x} y={s.y + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill={COLORS.primary}>{s.id}</text></g>))}</svg>
              </div>
              <PrimaryCTA onClick={() => setCurrentStep(3)}>BEGIN COLLECTION</PrimaryCTA>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="st3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}><h2 style={{ fontSize: '1.3rem', fontWeight: 950 }}>Data Collection</h2><div style={{ background: COLORS.terminal, color: 'white', padding: '5px 10px', borderRadius: '8px', fontSize: '0.7rem' }}>{samples.filter(s => s.status === 'completed').length}/{samples.length} SAMPLES</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1rem' }}>
                 {samples.map((s, i) => (
                   <div key={i} onClick={() => s.status === 'pending' && !isCollecting && startCollection(i)} style={{ background: 'white', padding: '1.1rem', borderRadius: '20px', border: `1px solid ${activeSampleIndex === i ? COLORS.primary : COLORS.border}`, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: s.status === 'completed' ? COLORS.primary : COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.status === 'completed' ? <CheckCircle2 size={24} color="white" /> : <MapPin size={24} color={COLORS.subtext} />}</div>
                        <div style={{ flex: 1 }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}><div style={{ fontSize: '1rem', fontWeight: 950 }}>Sample #{s.id}</div><div style={{ fontSize: '0.6rem', fontWeight: 900, color: COLORS.subtext }}>{isCollecting && activeSampleIndex === i ? 'COLLECTING...' : (s.status === 'completed' ? 'SYNCED' : 'PENDING')}</div></div>
                           {isCollecting && activeSampleIndex === i ? (
                             <div style={{ marginTop: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: COLORS.primary, fontWeight: 900, marginBottom: '6px' }}><span>LIVE STREAMING...</span><span>{currentReadings.length}/3</span></div>
                                <div style={{ height: '6px', background: COLORS.bg, borderRadius: '10px', overflow: 'hidden' }}><motion.div initial={{ width: 0 }} animate={{ width: `${collectProgress}%` }} style={{ height: '100%', background: COLORS.primary }} /></div>
                             </div>
                           ) : s.status === 'completed' ? (
                             <div style={{ marginTop: '8px' }}>
                               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: COLORS.bg, padding: '8px', borderRadius: '12px', textAlign: 'center', gap: '5px' }}>
                                  <div><p style={{ fontSize: '0.45rem', margin: 0, color: COLORS.subtext }}>MOISTURE</p><p style={{ fontSize: '0.75rem', fontWeight: 950 }}>{s.readings?.moisture}%</p></div>
                                  <div><p style={{ fontSize: '0.45rem', margin: 0, color: COLORS.subtext }}>PH LEVEL</p><p style={{ fontSize: '0.75rem', fontWeight: 950 }}>{s.readings?.ph}</p></div>
                                  <div><p style={{ fontSize: '0.45rem', margin: 0, color: COLORS.subtext }}>NUTRIENTS</p><p style={{ fontSize: '0.75rem', fontWeight: 950 }}>{s.readings?.npk?.n}:{s.readings?.npk?.p}:{s.readings?.npk?.k}</p></div>
                               </div>
                               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: COLORS.subtext, marginTop: '6px', fontWeight: 700 }}><span>{s.readings?.date} {s.readings?.time}</span><span>{s.readings?.gps}</span></div>
                             </div>
                           ) : <div style={{ fontSize: '0.75rem', color: COLORS.subtext, fontWeight: 700 }}>Tap to start sensor handshake...</div>}
                        </div>
                      </div>
                   </div>
                 ))}
              </div>
              <PrimaryCTA onClick={() => setCurrentStep(4)} disabled={samples.some(s => s.status === 'pending')}>ANALYZE GIS ZONES</PrimaryCTA>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div key="st4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}><h2 style={{ fontSize: '1.3rem', fontWeight: 950, margin: 0 }}>GIS Zones</h2><div style={{ display: 'flex', gap: '5px' }}>{['Moisture', 'PH', 'NPK'].map(l => (<button key={l} onClick={() => setAnalysisLayer(l)} style={{ padding: '5px 10px', borderRadius: '8px', border: 'none', background: analysisLayer === l ? COLORS.primary : 'white', color: analysisLayer === l ? 'white' : COLORS.subtext, fontSize: '0.6rem', fontWeight: 900 }}>{l}</button>))}</div></div>
              <div style={{ height: '380px', background: 'white', borderRadius: '28px', border: `1px solid ${COLORS.border}`, position: 'relative', marginBottom: '1rem', overflow: 'hidden' }}><iframe width="100%" height="100%" frameBorder="0" src={`https://www.openstreetmap.org/export/embed.html?bbox=${calculateBBox()}&layer=mapnik`} style={{ filter: 'grayscale(0.6)', pointerEvents: 'none' }} /><svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}><defs><clipPath id="fClp_final_z"><polygon points={boundaryPoints.map(p => `${p.x},${p.y}`).join(' ')} /></clipPath></defs><g clipPath="url(#fClp_final_z)">{Array.from({length: 400}).map((_, i) => { const x = (i % 20) * 20, y = Math.floor(i / 20) * 22, val = calculateIDWValue(x, y, analysisLayer); return <rect key={i} x={x} y={y} width="20" height="22" fill={getZoneColor(val, analysisLayer)} fillOpacity="0.7" />; })}</g><polygon points={boundaryPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="white" strokeWidth="2" /></svg></div>
              <PrimaryCTA onClick={() => setCurrentStep(5)}>GENERATE REPORT</PrimaryCTA>
            </motion.div>
          )}

          {currentStep === 5 && healthReport && (
            <motion.div key="st5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} id="soil-report">
               <header style={{ textAlign: 'center', marginBottom: '1.2rem', paddingTop: '10px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `${COLORS.primary}10`, margin: '0 auto 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${COLORS.primary}` }}><h2 style={{ fontSize: '2.2rem', fontWeight: 950, color: COLORS.primary, margin: 0 }}>{healthReport.score}%</h2></div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 950, margin: '0 0 8px 0' }}>Soil Health Index</h3>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', color: COLORS.subtext, fontSize: '0.65rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 10px' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}><Target size={11} color={COLORS.primary} /> {areaAcre} Acres</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}><Calendar size={11} color={COLORS.primary} /> {new Date().toLocaleDateString()}</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}><Clock size={11} color={COLORS.primary} /> {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}><Navigation size={11} color={COLORS.primary} /> {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}</span>
                  </div>
               </header>

               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '8px', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Moisture', val: `${healthReport.moisture}%`, icon: Droplets, color: COLORS.nutrient.m },
                    { label: 'Soil pH', val: healthReport.ph, icon: FlaskConical, color: COLORS.nutrient.ph },
                    { label: 'Samples', val: samples.length, icon: MapPin, color: COLORS.subtext },
                    { label: 'Nitrogen', val: healthReport.n, icon: Zap, color: COLORS.nutrient.n },
                    { label: 'Phosphorus', val: healthReport.p, icon: Atom, color: COLORS.nutrient.p },
                    { label: 'Potassium', val: healthReport.k, icon: Sparkles, color: COLORS.nutrient.k }
                  ].map((it, i) => (<div key={i} style={{ background: 'white', padding: '0.9rem', borderRadius: '18px', border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}><it.icon size={15} color={it.color} style={{ marginBottom: '5px' }} /><p style={{ fontSize: '0.5rem', fontWeight: 900, color: COLORS.subtext, textTransform: 'uppercase', marginBottom: '2px' }}>{it.label}</p><h4 style={{ fontSize: '0.95rem', fontWeight: 950, margin: 0 }}>{it.val}</h4></div>))}
               </div>

               <div className="report-maps" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
                  <div style={{ height: '220px', background: 'white', borderRadius: '20px', border: `2px solid ${COLORS.border}`, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10, background: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '0.5rem', fontWeight: 950, border: `1px solid ${COLORS.border}` }}>DEPLOYMENT</div>
                    <iframe width="100%" height="100%" frameBorder="0" src={`https://www.openstreetmap.org/export/embed.html?bbox=${calculateBBox()}&layer=mapnik`} style={{ filter: 'grayscale(1) brightness(1.05)' }} />
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}><polygon points={boundaryPoints.map(p => `${p.x/1.1},${p.y/1.1}`).join(' ')} fill="none" stroke="#000" strokeWidth="2" />{samples.map((s, i) => <circle key={i} cx={s.x/1.1} cy={s.y/1.1} r="4" fill="#000" />)}</svg>
                  </div>
                  <div style={{ height: '220px', background: 'white', borderRadius: '20px', border: `2px solid ${COLORS.border}`, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10, background: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '0.5rem', fontWeight: 950, border: `1px solid ${COLORS.border}` }}>HEATMAP</div>
                    <svg style={{ width: '100%', height: '100%' }}><clipPath id="rClp_rep_final"><polygon points={boundaryPoints.map(p => `${p.x},${p.y}`).join(' ')} /></clipPath><g clipPath="url(#rClp_rep_final)">{Array.from({length: 400}).map((_, i) => { const x = (i % 20) * 20, y = Math.floor(i / 20) * 22, val = calculateIDWValue(x*2, y*2, 'Moisture'); return <rect key={i} x={x} y={y} width="20" height="22" fill={getZoneColor(val, 'Moisture')} fillOpacity="0.85" />; })}</g><polygon points={boundaryPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#000" strokeWidth="2" /></svg>
                  </div>
               </div>

               <div style={{ background: 'white', borderRadius: '22px', border: `2px solid ${COLORS.border}`, padding: '0.9rem', marginBottom: '1.5rem' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.6rem', color: '#000' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: `2px solid ${COLORS.bg}`, color: COLORS.subtext }}>
                          <th style={{ padding: '8px' }}>ID</th>
                          <th style={{ padding: '8px' }}>TIMESTAMP</th>
                          <th style={{ padding: '8px' }}>GPS ANCHOR</th>
                          <th style={{ padding: '8px' }}>MOIST</th>
                          <th style={{ padding: '8px' }}>pH</th>
                          <th style={{ padding: '8px' }}>N:P:K</th>
                        </tr>
                      </thead>
                      <tbody>
                        {samples.map((s, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${COLORS.bg}` }}>
                            <td style={{ padding: '8px', fontWeight: 400 }}>#{s.id}</td>
                            <td style={{ padding: '8px', fontWeight: 400 }}>
                               {s.readings?.date}<br/>{s.readings?.time}
                            </td>
                            <td style={{ padding: '8px', fontWeight: 400 }}>
                               {s.readings?.gps}
                            </td>
                            <td style={{ padding: '8px', fontWeight: 950, color: '#000' }}>{s.readings?.moisture}%</td>
                            <td style={{ padding: '8px', fontWeight: 950, color: '#000' }}>{s.readings?.ph}</td>
                            <td style={{ padding: '8px', fontWeight: 950, color: '#000' }}>
                               {s.readings?.npk?.n ?? 0}:{s.readings?.npk?.p ?? 0}:{s.readings?.npk?.k ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
               <div className="no-print"><div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setCurrentStep(1)} style={{ flex: 1, height: '60px', borderRadius: '16px', border: `2px solid ${COLORS.border}`, background: 'white', fontWeight: 950 }}>NEW AUDIT</button><div style={{ flex: 2 }}><PrimaryCTA onClick={handleExportPDF} icon={Download}>EXPORT PDF REPORT</PrimaryCTA></div></div></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PrecisionSoilTesting;
