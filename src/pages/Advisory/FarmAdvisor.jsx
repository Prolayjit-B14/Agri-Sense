/**
 * Farm Advisor v17.1.0 - Industrial Agronomy Decision Suite
 * Comprehensive Overhaul: Integrating Match, Fertilizer, Compost, and Pest Engines.
 * 
 * Aesthetics: Industrial Premium, Consistent Padding/Margins, Framer Motion.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  MapPin, Zap, Calculator, RefreshCw, Activity, Target, Plus, Minus,
  Bug, ShieldCheck, Leaf, Sprout, Globe, AlertCircle, CheckCircle2,
  XCircle, Waves, Clock, FlaskConical, BarChart3, CloudRain, Thermometer,
  ChevronDown, TrendingUp, Droplets, Search, X, ChevronRight, Scale, Microscope,
  Sparkles, Info, TrendingDown, Apple, Flower, Wheat, Citrus, Grape, Carrot, Nut, Banana, AlertTriangle,
  Coffee, Brain, Cloud, Trees, TreePine, TreeDeciduous, Shrub, Clover, Shell, Milk, Sun, Cherry, Bean
} from 'lucide-react';
import { useApp } from '../../state/AppContext';

// ─── ASSET IMPORTS ──────────────────────────────────────────────────────────
import cropCsv from '../../data/geo/CropSuitabilityData_Final.csv?url';
import { CROP_SPECS, METADATA, ALIASES } from '../../data/core/CropDatabase';
import { 
  MONTHS, isAvailable, isAvailableLoc, getCropIcon, getDemandIcon, 
  getDemandColor, formatCropName, parseCSV, aggregateCropProfiles 
} from '../../data/core/AgronomyUtils';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const COLORS = {
  primary: '#10B981',
  primaryDark: '#059669',
  secondary: '#0EA5E9',
  danger: '#EF4444',
  warning: '#F59E0B',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  textMain: '#0F172A',
  textMuted: '#64748B',
  border: 'rgba(0, 0, 0, 0.04)',
};

const RAD = {
  card: '24px',
  inner: '18px',
  btn: '14px'
};

const getCropSpec = (name) => {
  if (!name || typeof name !== 'string') return { label: 'unknown' };
  const normalized = name.toLowerCase().trim();
  const target = ALIASES[normalized] || normalized;
  return { ...(CROP_SPECS[target] || {}), label: target };
};

// ─── BOTTOM SHEET COMPONENT ─────────────────────────────────────────────────

const CropBottomSheet = ({ isOpen, onClose, crops, onSelect, selectedCrop }) => {
  const [search, setSearch] = useState('');
  const filtered = (crops || []).filter(c => c.toLowerCase().includes(search.toLowerCase())).sort();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, backdropFilter: 'blur(4px)' }}
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', bottom: 0, left: 0, right: 0, 
              background: '#FFFFFF', borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
              zIndex: 1001, maxHeight: '85vh', display: 'flex', flexDirection: 'column',
              padding: '1.5rem', boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ width: '40px', height: '4px', background: '#E2E8F0', borderRadius: '2px', alignSelf: 'center', marginBottom: '1.5rem' }} />
            
            <div style={{ position: 'sticky', top: 0, background: 'white', zIndex: 2, paddingBottom: '1rem' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px' }} />
                <input 
                  autoFocus
                  placeholder="Search 86 Industrial Crops..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ 
                    width: '100%', padding: '14px 14px 14px 48px', borderRadius: '16px',
                    border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none',
                    fontSize: '1rem', fontWeight: 600, color: '#0F172A'
                  }}
                />
                {search && <X size={18} color="#94A3B8" style={{ position: 'absolute', right: '16px' }} onClick={() => setSearch('')} />}
              </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '2rem' }} className="no-scrollbar">
              {filtered.map(c => {
                const isSel = c === selectedCrop;
                const spec = getCropSpec(c);
                const { icon: CropIcon, color: cropColor } = getCropIcon(spec.type, c);
                
                return (
                  <motion.div 
                    key={c}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { onSelect(c); onClose(); }}
                    style={{ 
                      padding: '16px', borderRadius: '16px', marginBottom: '8px',
                      background: isSel ? `${cropColor}10` : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      border: isSel ? `1px solid ${cropColor}30` : '1px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ 
                        width: '48px', height: '48px', borderRadius: '12px', 
                        background: isSel ? '#FFFFFF' : `${cropColor}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <CropIcon size={24} color={cropColor} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '1rem', fontWeight: isSel ? 800 : 600, color: isSel ? '#0F172A' : '#1E293B' }}>{formatCropName(spec.label || c)}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{spec.type || 'Crop'}</span>
                      </div>
                    </div>
                    {isSel && <CheckCircle2 size={20} color={cropColor} />}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

const FarmAdvisor = () => {
  const { sensorData, user } = useApp();
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [db, setDb] = useState({ crops: null, loading: true, error: false });
  const [area, setArea] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Guard against missing context or sensors
  if (!sensorData) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.background }}><RefreshCw className="animate-spin" color={COLORS.primary} /></div>;


  const allCropsList = useMemo(() => {
    // Source of truth: CROP_SPECS (Industrial database)
    // We only show crops that we have verified data for.
    const specLabels = Object.keys(CROP_SPECS);
    
    // Also include crops from CSV IF they are in CROP_SPECS or are ALIASES of something in CROP_SPECS
    const csvLabels = Object.keys(db?.crops || {});
    const combined = [...new Set([...specLabels, ...csvLabels])];

    const finalUnique = new Set();
    combined.forEach(raw => {
      const label = raw.toLowerCase().trim();
      const target = ALIASES[label] || label;
      
      // ONLY add if it exists in our industrial database
      if (CROP_SPECS[target]) {
        finalUnique.add(target);
      }
    });

    return [...finalUnique].sort();
  }, [db.crops]);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 80], [1, 0.98]);

  useEffect(() => {
    fetch(cropCsv)
      .then(r => r.text())
      .then(cropTxt => {
        try {
          const crops = aggregateCropProfiles(parseCSV(cropTxt));
          setDb({ crops, loading: false, error: false });
        } catch (e) {
          console.error("DB Parse Error", e);
          setDb({ crops: {}, loading: false, error: true });
        }
      })
      .catch(err => {
        console.error("Fetch Error", err);
        setDb({ crops: {}, loading: false, error: true });
      });
  }, []);

  const brain = useMemo(() => {
    if (db.loading || !db?.crops || !sensorData) return null;
    const spec = getCropSpec(selectedCrop);
    const p = db?.crops?.[selectedCrop] || {};
    
    // Deep fallback logic: Use CSV data if available, otherwise inherit from Spec standards
    const profile = {
      n: p.n || { mid: ((spec.n?.[0] || 0) + (spec.n?.[1] || 100)) / 2, min: spec.n?.[0] || 0, max: spec.n?.[1] || 100, range: (spec.n?.[1] || 100) - (spec.n?.[0] || 0) || 1 },
      p: p.p || { mid: ((spec.p?.[0] || 0) + (spec.p?.[1] || 100)) / 2, min: spec.p?.[0] || 0, max: spec.p?.[1] || 100, range: (spec.p?.[1] || 100) - (spec.p?.[0] || 0) || 1 },
      k: p.k || { mid: ((spec.k?.[0] || 0) + (spec.k?.[1] || 100)) / 2, min: spec.k?.[0] || 0, max: spec.k?.[1] || 100, range: (spec.k?.[1] || 100) - (spec.k?.[0] || 0) || 1 },
      ph: p.ph || { mid: ((spec.ph?.[0] || 5.5) + (spec.ph?.[1] || 7.5)) / 2, min: spec.ph?.[0] || 5.5, max: spec.ph?.[1] || 7.5, range: (spec.ph?.[1] || 7.5) - (spec.ph?.[0] || 5.5) || 1 },
      temperature: p.temperature || { mid: ((spec.temp?.[0] || 15) + (spec.temp?.[1] || 35)) / 2, min: spec.temp?.[0] || 15, max: spec.temp?.[1] || 35, range: (spec.temp?.[1] || 35) - (spec.temp?.[0] || 15) || 1 },
      humidity: p.humidity || { mid: ((spec.hum?.[0] || 40) + (spec.hum?.[1] || 80)) / 2, min: spec.hum?.[0] || 40, max: spec.hum?.[1] || 80, range: (spec.hum?.[1] || 80) - (spec.hum?.[0] || 40) || 1 },
      rainfall: p.rainfall || { mid: ((spec.rain?.[0] || 500) + (spec.rain?.[1] || 1500)) / 2, min: spec.rain?.[0] || 500, max: spec.rain?.[1] || 1500, range: (spec.rain?.[1] || 1500) - (spec.rain?.[0] || 500) || 1 },
      moisture: p.moisture || { mid: 40, min: 10, max: 70, range: 60 },
      season: p.season, soil: p.soil, loc: p.loc, sow: p.sow,
      fert: p.fert, comp: p.comp, pest: p.pest
    };
    
    const metaSource = METADATA[spec.label || selectedCrop] || {};

    const meta = {
      type: spec.type || 'Crop',
      season: metaSource.season || profile.season || 'Kharif',
      soil: metaSource.soil || profile.soil || 'Loamy',
      weather: profile.weather || 'Moderate',
      sow: metaSource.sow || profile.sow || 'Jan-Dec',
      loc: metaSource.loc || profile.loc || 'India',
      fert: metaSource.fert || profile.fert || 'Balanced NPK',
      comp: metaSource.comp || profile.comp || 'Organic Manure',
      pest: metaSource.pest || profile.pest || 'Neem Oil',
      // Dynamic Dose Calculation based on NPK requirements
      bU: spec.n ? (spec.n[1] / 0.46) : 100, 
      bS: spec.p ? (spec.p[1] / 0.16) : 60, 
      bM: spec.k ? (spec.k[1] / 0.60) : 50, 
      bC: 3, 
      pests: [{ n: metaSource.pest || 'Standard Control', s: 'Integrated Mgmt', tm: 25, hm: 70, rm: 0, r: 'Standard risk' }]
    };

    const month = MONTHS[new Date().getMonth()] || "Jan";
    const season = ['Jun','Jul','Aug','Sep','Oct'].includes(month) ? 'Kharif' : (['Nov','Dec','Jan','Feb'].includes(month) ? 'Rabi' : 'Zaid');

    const cur = {
      n: sensorData?.soil?.npk?.n, p: sensorData?.soil?.npk?.p, k: sensorData?.soil?.npk?.k,
      ph: sensorData?.soil?.ph, moisture: sensorData?.soil?.moisture,
      temp: sensorData?.weather?.temp, hum: sensorData?.weather?.humidity, rain: sensorData?.weather?.rainLevel,
      season, soil: sensorData?.soil?.type || 'Loamy', weather: sensorData?.weather?.condition || 'Clear', month
    };

    // ─── 📊 SMART MATCH ENGINE ───
    const sensors = [
      { id: 'Nitrogen', val: cur.n, range: spec.n, unit: 'kg/ha', rec: 'Fertilize', icon: Zap, color: '#F59E0B' },
      { id: 'Phosphorus', val: cur.p, range: spec.p, unit: 'kg/ha', rec: 'Fertilize', icon: Target, color: '#3B82F6' },
      { id: 'Potassium', val: cur.k, range: spec.k, unit: 'kg/ha', rec: 'Fertilize', icon: Activity, color: '#8B5CF6' },
      { id: 'Soil pH', val: cur.ph, range: spec.ph, unit: 'pH', rec: 'Treat Soil', icon: FlaskConical, color: '#EC4899' },
      { id: 'Moisture', val: cur.moisture, range: db.crops[selectedCrop] ? profile.moisture : { min: spec.moisture?.[0] || 10, max: spec.moisture?.[1] || 80 }, unit: '%', rec: 'Irrigate', icon: Droplets, color: '#0EA5E9' },
      { id: 'Temperature', val: cur.temp, range: spec.temp, unit: '°C', rec: 'Cooling', icon: Thermometer, color: '#F43F5E' },
      { id: 'Rainfall', val: cur.rain, range: db.crops[selectedCrop] ? profile.rainfall : { min: spec.rain?.[0] || 0, max: spec.rain?.[1] || 2000 }, unit: 'mm', rec: 'Weather', icon: CloudRain, color: '#6366F1' }
    ].map(s => {
      const active = isAvailable(s.val);
      let status = 'Missing', type = 'missing', action = '---';
      
      // Range can be [min, max] or { min, max }
      const rMin = Array.isArray(s.range) ? s.range[0] : s.range?.min;
      const rMax = Array.isArray(s.range) ? s.range[1] : s.range?.max;

      if (active && typeof rMin !== 'undefined' && rMin !== null) {
        const val = parseFloat(s.val);
        if (isNaN(val)) {
          status = 'Missing'; type = 'missing';
        } else if (val < rMin) { 
          status = '🔻 Below Range'; type = 'bad'; action = s.rec; 
        } else if (val > rMax) { 
          status = '🔺 Above Range'; type = 'bad'; action = 'Drain'; 
        } else { 
          status = '✅ Optimal'; type = 'good'; action = 'None'; 
        }
      }
      return { ...s, status, type, action, rMin, rMax };
    });

    const matchTable = [
      { f: 'Season', ideal: meta.season, cur: cur.season, isMatch: String(meta.season).toLowerCase().includes(String(cur.season).toLowerCase()), icon: Clock, color: '#F59E0B' },
      { f: 'Soil Type', ideal: meta.soil, cur: cur.soil, isMatch: String(meta.soil).toLowerCase().includes(String(cur.soil || 'loam').toLowerCase()), icon: Globe, color: '#10B981' },
      { f: 'Location', ideal: meta.loc, cur: 'WB, IN', isMatch: String(meta.loc).toLowerCase().includes('india') || String(meta.loc).toLowerCase().includes('wb'), icon: MapPin, color: '#0EA5E9' },
      { f: 'Sowing Time', ideal: meta.sow, cur: cur.month, icon: Activity, color: '#EF4444' }
    ].map(row => {
      let status = '❌ Not Suitable', type = 'bad';
      if (row.f === 'Sowing Time') {
        const [sS, sE] = (String(row.ideal || 'Jan-Dec')).split('-');
        const sIdx = MONTHS.indexOf(sS), eIdx = MONTHS.indexOf(sE), cIdx = MONTHS.indexOf(cur.month);
        if (row.ideal === 'Year-round' || row.ideal === 'Any' || (cIdx >= sIdx && cIdx <= eIdx)) { status = '✅ Suitable'; type = 'good'; }
        else if (sIdx !== -1 && eIdx !== -1 && Math.min(Math.abs(cIdx - sIdx), Math.abs(cIdx - eIdx)) <= 1) { status = '⚠ Adjustment'; type = 'warning'; }
      } else if (row.isMatch) { status = '✅ Suitable'; type = 'good'; }
      return { ...row, status, type, cur: isAvailableLoc(row.cur) ? row.cur : '---' };
    });

    // ─── 🧪 FERTILIZER ENGINE ───────────────────────────────────────────────
    const canFertilize = isAvailableLoc(cur.n) && isAvailableLoc(cur.p) && isAvailableLoc(cur.k);
    const defN = canFertilize ? Math.max(0, (profile.n?.mid || 0) - parseFloat(cur.n || 0)) : 0;
    const defP = canFertilize ? Math.max(0, (profile.p?.mid || 0) - parseFloat(cur.p || 0)) : 0;
    const defK = canFertilize ? Math.max(0, (profile.k?.mid || 0) - parseFloat(cur.k || 0)) : 0;
    
    const fertEntry = profile.fert && typeof profile.fert === 'object' ? profile.fert : null;
    let urea = canFertilize ? (defN / 0.46) + (meta.bU * 0.3) : 0;
    let ssp = canFertilize ? (defP / 0.16) + (meta.bS * 0.3) : 0;
    let mop = canFertilize ? (defK / 0.60) + (meta.bM * 0.3) : 0;
    
    const fertReasons = [];
    if (canFertilize) {
      if (parseFloat(cur.temp) > (profile.temperature?.max || 35)) { urea *= 0.9; fertReasons.push("High heat reduction"); }
      if (parseFloat(cur.moisture) < (profile.moisture?.min || 20)) { urea *= 1.1; fertReasons.push("Low moisture adjustment"); }
    }
    const fertReason = canFertilize ? (fertReasons.length > 0 ? fertReasons.join(" • ") : (fertEntry?.weather || "Standard biological dose")) : "OFFLINE - CONNECT NPK SENSORS";

    // ─── 🍃 COMPOST ENGINE ──────────────────────────────────────────────────
    const canCompost = isAvailableLoc(cur.moisture) && isAvailableLoc(cur.ph);
    let compost = canCompost ? meta.bC : 0;
    const cReasons = [];
    if (canCompost) {
      if (parseFloat(cur.moisture) < (profile.moisture?.min || 20)) { compost += 2; cReasons.push("Low moisture"); }
      if (String(meta.soil).includes("Sandy")) { compost += 2; cReasons.push("Sandy soil"); }
      if (isAvailableLoc(cur.n) && parseFloat(cur.n) < (profile.n?.min || 50)) { compost += 1; cReasons.push("N-Deficiency"); }
    }
    const compostReason = canCompost ? (cReasons.length > 0 ? cReasons.join(" + ") : (fertEntry?.soil || "Ideal field balance")) : "OFFLINE - CONNECT SOIL SENSORS";

    // ─── 🛡️ PEST ENGINE (OFFLINE AWARE) ──────────────────────────────────────
    const canAnalyzePest = isAvailableLoc(cur.temp) || isAvailableLoc(cur.hum) || isAvailableLoc(cur.moisture);
    const checkActiveTrigger = (trigger, val, type) => {
      if (!trigger || trigger === '---') return false;
      const t = trigger.toLowerCase();
      const v = parseFloat(val);
      if (isNaN(v)) return false;
      if (type === 'temp') {
        if (t.includes('warm') && v > 26) return true;
        if (t.includes('hot') && v > 32) return true;
        if (t.includes('cool') && v < 22) return true;
      }
      if (type === 'hum') {
        if (t.includes('humid') && v > 75) return true;
        if (t.includes('dry') && v < 40) return true;
      }
      if (type === 'moist') {
        if ((t.includes('wet') || t.includes('high')) && v > 70) return true;
        if (t.includes('dry') && v < 30) return true;
      }
      return false;
    };

    const pestEntry = profile.pest && typeof profile.pest === 'object' ? profile.pest : null;
    const isThreatActive = canAnalyzePest && pestEntry && (
      checkActiveTrigger(pestEntry.weather, cur.temp, 'temp') || 
      checkActiveTrigger(pestEntry.weather, cur.hum, 'hum') || 
      checkActiveTrigger(pestEntry.water, cur.moisture, 'moist')
    );

    const detectedPests = !canAnalyzePest ? [{
      n: 'Sensor Offline',
      s: 'OFFLINE',
      isActive: false,
      r: 'Connect weather & soil sensors for threat detection.',
      stage: '---'
    }] : (pestEntry ? [{
      n: pestEntry.most || pestEntry.all?.split(',')[0] || 'Standard Pest',
      s: isThreatActive ? 'ACTIVE THREAT' : 'POTENTIAL',
      isActive: isThreatActive,
      tm: pestEntry.weather || 'Varies',
      hm: pestEntry.water || 'Varies',
      r: pestEntry.others || 'General precaution',
      stage: pestEntry.trigger || 'All stages',
      all: pestEntry.all
    }] : [{ 
      n: typeof profile.pest === 'string' ? profile.pest : 'Standard Control', 
      s: 'PREVENTATIVE', 
      isActive: false,
      tm: 'Standard', hm: 'Standard', 
      r: `Apply ${typeof profile.pest === 'string' ? profile.pest : 'standard treatment'} as per industrial schedule.`,
      stage: 'Any'
    }]);

    const confidence = Math.round((sensors.filter(s => s.type === 'good').length / sensors.length) * 100);

    // ─── 📊 WEIGHTED INTELLIGENCE & EXPLAINABILITY ENGINE ───
    const calcMatchPct = (s) => {
      if (s.type === 'missing') return 0;
      if (s.type === 'good') return 90 + Math.random() * 10;
      const val = parseFloat(s.val);
      const { rMin, rMax } = s;
      const range = Math.max(1, rMax - rMin);
      const dist = val < rMin ? rMin - val : val - rMax;
      const pct = Math.max(20, 100 - (dist / range * 100));
      return Math.round(pct);
    };

    const categories = [
      {
        id: 'soil',
        name: 'Soil Health',
        icon: Leaf,
        params: [
          { n: 'Nitrogen (N)', s: sensors[0], weight: 0.25, impact: 'Critical', why: (p) => p < 50 ? 'Low N inhibits vegetative growth.' : 'Optimal N for chlorophyll production.' },
          { n: 'Phosphorus (P)', s: sensors[1], weight: 0.20, impact: 'Critical', why: (p) => p < 50 ? 'Weak roots due to low Phosphorus.' : 'Healthy root development support.' },
          { n: 'Potassium (K)', s: sensors[2], weight: 0.15, impact: 'Important', why: (p) => p < 50 ? 'Reduced disease resistance.' : 'Excellent water regulation & immunity.' },
          { n: 'Soil pH', s: sensors[3], weight: 0.20, impact: 'Critical', why: (p) => p < 70 ? 'Acidity/Alkalinity limits nutrient uptake.' : 'Ideal pH for maximum nutrient availability.' },
          { n: 'Moisture', s: sensors[4], weight: 0.20, impact: 'Important', why: (p) => p < 50 ? 'Hydration stress detected.' : 'Balanced soil-water ratio.' }
        ]
      },
      {
        id: 'climate',
        name: 'Climate & Weather',
        icon: Thermometer,
        params: [
          { n: 'Temperature', s: sensors[5], weight: 0.40, impact: 'Important', why: (p) => p < 60 ? 'Thermal stress affecting metabolism.' : 'Optimal metabolic temperature.' },
          { n: 'Rainfall', s: sensors[6], weight: 0.40, impact: 'Important', why: (p) => p < 50 ? 'Water deficit for crop lifecycle.' : 'Adequate precipitation support.' },
          { n: 'Humidity', s: { pct: 75, type: 'good' }, weight: 0.20, impact: 'Supporting', why: () => 'Optimal transpiration levels.' }
        ]
      },
      {
        id: 'external',
        name: 'External Factors',
        icon: Globe,
        params: [
          { n: 'Season', s: { pct: matchTable[0].type === 'good' ? 100 : 40, type: matchTable[0].type }, weight: 0.35, impact: 'Supporting', why: (p) => p > 80 ? 'Ideal physiological window.' : 'Seasonal mismatch detected.' },
          { n: 'Growing Time', s: { pct: matchTable[3].type === 'good' ? 100 : 50, type: matchTable[3].type }, weight: 0.35, impact: 'Supporting', why: (p) => p > 80 ? 'Perfect sowing timeline.' : 'Sowing delay impact expected.' },
          { n: 'Location', s: { pct: matchTable[2].type === 'good' ? 100 : 70, type: matchTable[2].type }, weight: 0.30, impact: 'Supporting', why: () => 'Geographically viable zone.' }
        ]
      }
    ];

    // Process all parameters with data logic
    const processedGroups = categories.map(cat => {
      let catScore = 0;
      const items = cat.params.map(p => {
        const pct = p.s.pct !== undefined ? p.s.pct : calcMatchPct(p.s);
        const status = pct > 80 ? 'Good' : (pct > 50 ? 'Moderate' : 'Poor');
        const color = pct > 80 ? COLORS.primary : (pct > 50 ? COLORS.warning : COLORS.danger);
        catScore += pct * p.weight;
        return { ...p, pct, status, color, explain: p.why(pct) };
      });
      return { ...cat, score: Math.round(catScore), items };
    });

    const weights = { soil: 0.50, climate: 0.35, external: 0.15 };
    const matchScore = Math.round(
      processedGroups.reduce((acc, g) => acc + (g.score * weights[g.id]), 0)
    );

    let recStatus = 'MODERATE', recColor = '#F59E0B', recIcon = AlertCircle;
    if (matchScore > 80) { recStatus = 'RECOMMENDED'; recColor = '#10B981'; recIcon = CheckCircle2; }
    else if (matchScore < 50) { recStatus = 'NOT RECOMMENDED'; recColor = '#EF4444'; recIcon = XCircle; }

    const suitLabel = matchScore > 80 ? 'High Suitability' : (matchScore > 50 ? 'Moderate' : 'Low Suitability');
    const suitColor = matchScore > 80 ? COLORS.primary : (matchScore > 50 ? COLORS.warning : COLORS.danger);

    const criticalFailures = processedGroups.flatMap(g => g.items).filter(p => p.impact === 'Critical' && p.pct < 60);
    const detailedInsight = criticalFailures.length > 0 
      ? `CRITICAL ALERT: Your field shows significant deficits in ${criticalFailures.map(f => f.n).join(', ')}. These factors are essential for ${selectedCrop} and must be corrected before proceeding.`
      : `SUITABILITY ANALYSIS: Field conditions are ${matchScore > 80 ? 'ideal' : 'stable'}. Focus on maintaining ${processedGroups[0].items.filter(p => p.pct < 85).map(p => p.n).join(', ') || 'current levels'} for maximum yield efficiency.`;

    return {
      sensors, matchTable, confidence, matchScore, recStatus, recColor, recIcon, demand: metaSource.demand || (matchScore > 70 ? 'High' : (matchScore > 40 ? 'Medium' : 'Low')),
      summary: {
        groups: processedGroups,
        overall: matchScore,
        status: suitLabel,
        color: suitColor,
        insight: detailedInsight
      },
      fertilizer: {
        isValid: canFertilize,
        urea: urea * area, ssp: ssp * area, mop: mop * area,
        product: fertEntry?.common || (typeof profile.fert === 'string' ? profile.fert : 'NPK Mix'),
        reason: fertReason,
        stage: fertEntry?.stage || 'Vegetative'
      },
      compost: {
        isValid: canCompost,
        total: compost * area,
        perAcre: compost,
        product: fertEntry?.compost || (typeof profile.comp === 'string' ? profile.comp : 'Farmyard Manure'),
        reason: compostReason,
        others: fertEntry?.others || 'No additional notes'
      },
      pests: {
        detected: detectedPests
      },
      meta
    };
  }, [db, selectedCrop, sensorData, area]);

  if (db.loading || !brain) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.background }}><RefreshCw className="animate-spin" color={COLORS.primary} /></div>;

  if (db.error) return <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: COLORS.background, padding: '20px', textAlign: 'center' }}>
    <AlertTriangle size={48} color={COLORS.danger} style={{ marginBottom: '1rem' }} />
    <h2 style={{ fontWeight: 900 }}>Database Sync Error</h2>
    <p style={{ color: COLORS.textMuted }}>Unable to load industrial crop specifications.</p>
  </div>;

  const cardStyle = {
    background: COLORS.cardBg,
    borderRadius: RAD.card,
    padding: '1.5rem',
    marginBottom: '1.25rem',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
  };

  const sectionHeader = { margin: '0 0 1.25rem 0', fontSize: '1.1rem', fontWeight: 950, color: COLORS.textMain, display: 'flex', alignItems: 'center', gap: '10px' };

  return (
    <div className="no-scrollbar" style={{ background: COLORS.background, minHeight: '100dvh', paddingBottom: '2rem', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>

      {/* 🚀 CROP HERO CARD REDESIGN */}
      <div style={{ padding: '1rem' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          style={{ 
            background: '#FFFFFF', borderRadius: '24px', padding: '1.5rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: `1px solid rgba(0,0,0,0.03)`,
          }}
        >
          {/* TOP: Crop & Meta */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div 
              onClick={() => setIsSheetOpen(true)}
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                background: '#F8FAFC', padding: '12px 16px', borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.03)', cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: getCropIcon(brain.meta.type, selectedCrop).color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {React.createElement(getCropIcon(brain.meta.type, selectedCrop).icon, { size: 18, color: 'white' })}
                 </div>
                 <h1 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0 }}>
                  {formatCropName(selectedCrop)}
                 </h1>
              </div>
              <ChevronDown size={20} color="#94A3B8" />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.05)', padding: '4px 10px', borderRadius: '8px' }}>
                <MapPin size={12} color={COLORS.danger} />
                <span style={{ fontSize: '0.7rem', fontWeight: 850, color: COLORS.danger }}>{user?.location || 'MAKAUT, WB'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.05)', padding: '4px 10px', borderRadius: '8px' }}>
                <Activity size={12} color={COLORS.primary} />
                <span style={{ fontSize: '0.7rem', fontWeight: 850, color: COLORS.primary }}>{brain.meta.type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(14, 165, 233, 0.05)', padding: '4px 10px', borderRadius: '8px' }}>
                {React.createElement(getDemandIcon(brain.demand), { size: 12, color: getDemandColor(brain.demand) })}
                <span style={{ fontSize: '0.7rem', fontWeight: 850, color: getDemandColor(brain.demand) }}>{brain.demand} Demand</span>
              </div>
            </div>
          </div>

          {/* RECOMMENDATION SECTION */}
          <div style={{ 
            background: `${brain.recColor}08`, borderRadius: '16px', padding: '1rem',
            border: `1px solid ${brain.recColor}15`, marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: brain.recColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {React.createElement(brain.recIcon, { size: 20, color: "white" })}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: brain.recColor }}>{brain.recStatus}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', opacity: 0.8 }}>Based on local field diagnostics</div>
            </div>
          </div>

          {/* 📊 HIGH-FIDELITY METRICS DASHBOARD */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: '12px', 
            marginBottom: '0.5rem' 
          }}>
            {[
              { label: 'Confidence', val: brain.confidence, type: brain.confidence > 80 ? 'Strong' : 'Medium', color: '#6366F1' },
              { label: 'Match Score', val: brain.matchScore, type: brain.matchScore > 80 ? 'Good' : 'Fair', color: COLORS.secondary },
              { label: 'Suitability', val: brain.matchScore, type: brain.matchScore > 50 ? 'Suitable' : 'Risky', color: brain.recColor }
            ].map((m, i) => (
              <div key={i} style={{ 
                background: '#F8FAFC', 
                borderRadius: '16px', 
                padding: '12px',
                border: `1px solid rgba(0,0,0,0.03)`,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 950, color: '#1E293B' }}>
                    {m.val > 0 ? (m.label === 'Suitability' ? (m.type === 'Suitable' ? '✔' : '✘') : `${m.val}%`) : '---'}
                  </span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: m.color }}>{m.val > 0 ? m.type : 'Offline'}</span>
                </div>
                <div style={{ width: '100%', height: '3px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${m.val}%` }}
                    style={{ height: '100%', background: m.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <CropBottomSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        crops={allCropsList} 
        onSelect={setSelectedCrop} 
        selectedCrop={selectedCrop}
      />

      <div style={{ padding: '0 1.25rem' }}>
        {/* 📋 SMART MATCH TABLE ENGINE */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: COLORS.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={20} color={COLORS.primary} />
                Sensor Data Analysis
              </h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 0.8fr', gap: '10px', paddingBottom: '10px', borderBottom: `2px solid ${COLORS.background}`, marginBottom: '10px' }}>
             {['PARAMETER', 'FIELD VALUE', 'IDEAL RANGE', 'STATUS'].map((h, i) => (
               <span key={i} style={{ 
                 fontSize: '0.6rem', fontWeight: 950, color: COLORS.textMuted, textTransform: 'uppercase',
                 textAlign: i === 0 ? 'left' : (i === 3 ? 'right' : 'center'),
                 paddingLeft: i === 0 ? '44px' : 0
               }}>{h}</span>
             ))}
          </div>

          {brain.sensors.map((s, idx) => (
            <motion.div 
              layout key={s.id}
              style={{ 
                display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 0.8fr', gap: '10px', 
                padding: '14px 0', borderBottom: `1px solid ${COLORS.background}`, 
                alignItems: 'center' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ minWidth: '32px', height: '32px', borderRadius: '10px', background: `${s.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.createElement(s.icon, { size: 16, color: s.color })}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 850, color: COLORS.textMain, whiteSpace: 'nowrap' }}>{s.id}</span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: s.type === 'missing' ? COLORS.textMuted : COLORS.textMain, textAlign: 'center' }}>
                {s.type === 'missing' ? '---' : Math.round(parseFloat(s.val) || 0)}
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 750, color: COLORS.textMuted, textAlign: 'center' }}>
                {(typeof s.rMin !== 'undefined' && s.rMin !== null) ? `${Math.round(s.rMin)}-${Math.round(s.rMax)}` : '---'}
              </span>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {s.type === 'missing' ? <RefreshCw size={18} color={COLORS.textMuted} style={{ opacity: 0.5 }} /> : (
                  s.type === 'good' ? <CheckCircle2 size={18} color={COLORS.primary} /> : <AlertCircle size={18} color={COLORS.danger} />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 🌾 CROP SUITABILITY CHECK TABLE */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ ...sectionHeader, gap: '10px' }}>
              <Scale size={20} color={COLORS.secondary} />
              Crop Suitability Check
            </h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 0.8fr', gap: '10px', paddingBottom: '10px', borderBottom: `2px solid ${COLORS.background}`, marginBottom: '10px' }}>
            {['PARAMETER', 'YOUR FIELD', 'IDEAL', 'RESULT'].map((h, i) => (
              <span key={i} style={{ 
                fontSize: '0.6rem', fontWeight: 950, color: COLORS.textMuted, textTransform: 'uppercase',
                textAlign: i === 0 ? 'left' : (i < 3 ? 'center' : 'right'),
                paddingLeft: i === 0 ? '44px' : 0
              }}>{h}</span>
            ))}
          </div>

          {brain.matchTable.map((row, idx) => (
            <div key={row.f} style={{ 
              display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 0.8fr', gap: '10px', 
              padding: '14px 0', borderBottom: idx === brain.matchTable.length - 1 ? 'none' : `1px solid ${COLORS.background}`, 
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ minWidth: '32px', height: '32px', borderRadius: '10px', background: `${row.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.createElement(row.icon, { size: 16, color: row.color })}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 850, color: COLORS.textMain, whiteSpace: 'nowrap' }}>{row.f}</span>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 850, color: COLORS.textMain, textAlign: 'center' }}>{row.cur}</span>
              <span style={{ fontSize: '0.7rem', color: COLORS.textMuted, fontWeight: 750, textAlign: 'center' }}>{row.ideal}</span>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                 {row.type === 'good' ? <CheckCircle2 size={18} color={COLORS.primary} /> : (
                   row.type === 'warning' ? <Zap size={18} color={COLORS.warning} /> : <XCircle size={18} color={COLORS.danger} />
                 )}
              </div>
            </div>
          ))}
        </motion.div>


        {/* 🧪 FERTILIZER ENGINE */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `#8B5CF610`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={20} color="#8B5CF6" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: COLORS.textMain }}>Fertilizer Engine</h3>
            </div>
          </div>

          {!brain.fertilizer.isValid ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '20px', border: `1px dashed ${COLORS.border}` }}>
              <RefreshCw size={24} color={COLORS.textMuted} style={{ marginBottom: '10px', opacity: 0.5 }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: COLORS.textMuted }}>NPK SENSORS OFFLINE</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Urea', val: brain.fertilizer.urea },
                  { label: 'SSP', val: brain.fertilizer.ssp },
                  { label: 'MOP', val: brain.fertilizer.mop }
                ].map(f => (
                  <div key={f.label} style={{ padding: '16px 10px', borderRadius: '20px', background: '#F8FAFC', textAlign: 'center', border: '1px solid rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: '6px' }}>{f.label}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 950, color: COLORS.textMain }}>{Math.round(f.val)}<span style={{ fontSize: '0.5em', marginLeft: '2px', opacity: 0.6 }}>kg</span></div>
                  </div>
                ))}
              </div>
              <div style={{ background: `${COLORS.primary}08`, padding: '14px', borderRadius: '18px', borderLeft: `3px solid ${COLORS.primary}`, marginBottom: '10px' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 750, color: COLORS.textMain, lineHeight: 1.4 }}>{brain.fertilizer.reason}</p>
              </div>
              <div style={{ padding: '12px', borderRadius: '16px', background: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '8px' }}><Sparkles size={14} color={COLORS.primary} /></div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 850, color: COLORS.textMain }}>Recommendation: <span style={{ color: COLORS.primaryDark }}>{brain.fertilizer.product}</span></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Clock size={10} color="#64748B" />
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748B' }}>Target Stage: {brain.fertilizer.stage}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* 🌿 COMPOST ENGINE */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${COLORS.primary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={20} color={COLORS.primary} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: COLORS.textMain }}>Compost Engine</h3>
            </div>
          </div>

          {!brain.compost.isValid ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '20px', border: `1px dashed ${COLORS.border}` }}>
              <RefreshCw size={24} color={COLORS.textMuted} style={{ marginBottom: '10px', opacity: 0.5 }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: COLORS.textMuted }}>SOIL SENSORS OFFLINE</div>
            </div>
          ) : (
            <>
              <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '24px', textAlign: 'center', marginBottom: '1.25rem', border: '1px solid rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organic Requirement</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 950, color: COLORS.textMain, lineHeight: 1, margin: '8px 0' }}>{brain.compost.total.toFixed(1)} <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.5 }}>Ton</span></div>
              </div>
              <div style={{ background: `${COLORS.primary}08`, padding: '14px', borderRadius: '18px', borderLeft: `3px solid ${COLORS.primary}`, marginBottom: '10px' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 750, color: COLORS.textMain, lineHeight: 1.4 }}>{brain.compost.reason}</p>
              </div>
              <div style={{ padding: '12px', borderRadius: '16px', background: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#FFFFFF', padding: '6px', borderRadius: '8px' }}><Sprout size={14} color={COLORS.primary} /></div>
                <span style={{ fontSize: '0.7rem', fontWeight: 850, color: COLORS.textMain }}>Ideal Method: <span style={{ color: COLORS.primaryDark }}>{brain.compost.product}</span></span>
              </div>

              {brain.compost.others !== 'No additional notes' && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #E2E8F0' }}>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: COLORS.textMuted, fontWeight: 700, lineHeight: 1.4 }}>
                    <span style={{ color: COLORS.textMain, fontWeight: 850 }}>Pro Tip:</span> {brain.compost.others}
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* 🐛 PESTICIDE ENGINE */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${COLORS.danger}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bug size={20} color={COLORS.danger} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: COLORS.textMain }}>Pesticide Engine</h3>
            </div>
          </div>

          {brain.pests.detected.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {brain.pests.detected.map((p, i) => (
                <div key={i} style={{ 
                  padding: '16px', borderRadius: '22px', 
                  background: p.isActive ? `${COLORS.danger}05` : '#F8FAFC', 
                  border: p.isActive ? `1px solid ${COLORS.danger}20` : '1px solid rgba(0,0,0,0.02)',
                  marginBottom: '10px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ padding: '6px', borderRadius: '8px', background: p.isActive ? COLORS.danger : `${COLORS.danger}20` }}>
                        <Bug size={16} color={p.isActive ? 'white' : COLORS.danger} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 950, color: COLORS.textMain }}>{p.n}</span>
                    </div>
                    <span style={{ 
                      fontSize: '0.6rem', fontWeight: 950, padding: '4px 10px', borderRadius: '20px', 
                      background: p.isActive ? COLORS.danger : '#E2E8F0', 
                      color: p.isActive ? 'white' : COLORS.textMuted 
                    }}>
                      {p.s}
                    </span>
                  </div>
                  
                  <p style={{ margin: '8px 0', fontSize: '0.7rem', color: COLORS.textMuted, fontWeight: 750, lineHeight: 1.4 }}>
                    <span style={{ color: COLORS.textMain }}>Warning:</span> {p.r}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    <div style={{ background: '#EEF2FF', padding: '4px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CloudRain size={12} color="#6366F1" />
                      <span style={{ fontSize: '0.65rem', fontWeight: 850, color: '#4F46E5' }}>{p.tm}</span>
                    </div>
                    <div style={{ background: '#ECFDF5', padding: '4px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Droplets size={12} color="#10B981" />
                      <span style={{ fontSize: '0.65rem', fontWeight: 850, color: '#059669' }}>{p.hm}</span>
                    </div>
                    <div style={{ background: '#FFF7ED', padding: '4px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Target size={12} color="#F97316" />
                      <span style={{ fontSize: '0.65rem', fontWeight: 850, color: '#C2410C' }}>{p.stage}</span>
                    </div>
                  </div>

                  {p.all && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #E2E8F0' }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Secondary Threats:</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>{p.all}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.02)' }}>
              <ShieldCheck size={32} color={COLORS.primary} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 850, color: COLORS.textMain }}>SECURE ENVIRONMENT</div>
            </div>
          )}
        </motion.div>

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default FarmAdvisor;
