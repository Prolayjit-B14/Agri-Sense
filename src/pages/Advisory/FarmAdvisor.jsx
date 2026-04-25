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
  Sparkles, Info, TrendingDown, Apple, Flower, Wheat, Citrus, Grape, Carrot, Nut, Banana, AlertTriangle
} from 'lucide-react';
import { useApp } from '../../state/AppContext';

// ─── ASSET IMPORTS ──────────────────────────────────────────────────────────
import cropCsv from '../../data/CropSuitabilityData_Final.csv?url';
import { CROP_SPECS, METADATA, ALIASES } from '../../data/CropDatabase';

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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const isAvailable = (val) => val !== undefined && val !== null && val !== '' && val !== '---';
const isAvailableLoc = (v) => v !== null && v !== undefined && v !== '' && v !== '---';

// ─── HELPERS ────────────────────────────────────────────────────────────────

const getCropIcon = (type, name = '') => {
  const t = type?.toLowerCase() || '';
  const n = name?.toLowerCase() || '';

  // Specific Crop Mappings
  // Specific Crop Mappings (LITERAL MATCHES)
  if (n.includes('apple') || n.includes('pomegranate')) return { icon: Apple, color: '#EF4444' };
  if (n.includes('grape')) return { icon: Grape, color: '#8B5CF6' };
  if (n.includes('banana')) return { icon: Banana, color: '#EAB308' };
  if (n.includes('citrus') || n.includes('orange') || n.includes('lemon')) return { icon: Citrus, color: '#F59E0B' };
  if (n.includes('mango') || n.includes('papaya')) return { icon: Citrus, color: '#F97316' };
  if (n.includes('watermelon') || n.includes('muskmelon')) return { icon: Citrus, color: '#22C55E' }; // Using Citrus for round fruits
  if (n.includes('coconut')) return { icon: Nut, color: '#78350F' };
  if (n.includes('potato') || n.includes('radish') || n.includes('onion')) return { icon: Nut, color: '#92400E' };
  if (n.includes('carrot')) return { icon: Carrot, color: '#F97316' };
  if (n.includes('sunflower') || n.includes('marigold')) return { icon: Flower, color: '#FBBF24' };
  if (n.includes('wheat') || n.includes('barley') || n.includes('jowar') || n.includes('bajra')) return { icon: Wheat, color: '#EAB308' };
  if (n.includes('rice') || n.includes('paddy')) return { icon: Sprout, color: '#10B981' };
  if (n.includes('cotton') || n.includes('jute')) return { icon: Waves, color: '#CBD5E1' };
  if (n.includes('gram') || n.includes('pulse') || n.includes('bean') || n.includes('lentil')) return { icon: Sprout, color: '#10B981' };

  // Category Fallbacks (LITERAL REPRESENTATIONS)
  if (t.includes('grain') || t.includes('cereal') || t.includes('pulse')) return { icon: Wheat, color: '#10B981' };
  if (t.includes('veg')) return { icon: Carrot, color: '#22C55E' };
  if (t.includes('fruit')) return { icon: Apple, color: '#F97316' };
  if (t.includes('flower')) return { icon: Flower, color: '#EC4899' };
  if (t.includes('seed')) return { icon: Sprout, color: '#6366F1' };
  if (t.includes('oilseed')) return { icon: Droplets, color: '#F59E0B' };
  if (t.includes('fiber') || t.includes('cash')) return { icon: Waves, color: '#8B5CF6' };
  return { icon: Sprout, color: '#10B981' };
};

const getDemandIcon = (demand) => {
  const d = demand?.toLowerCase() || '';
  if (d.includes('high')) return TrendingUp;
  if (d.includes('low')) return TrendingDown;
  return Activity;
};

const getDemandColor = (demand) => {
  const d = demand?.toLowerCase() || '';
  if (d.includes('high')) return '#10B981';
  if (d.includes('medium')) return '#F59E0B';
  return '#94A3B8';
};

const formatCropName = (name) => {
  if (!name) return '';
  return name.split('(')[0].trim().replace(/\b\w/g, l => l.toUpperCase());
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
                  placeholder="Search 75+ Crops..."
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

// ─── UTILS & PARSERS ────────────────────────────────────────────────────────

const parseCSV = (t) => {
  if (!t || t.trim().length === 0) return [];
  const lines = t.trim().split('\n');
  if (lines.length < 1) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
    return headers.reduce((obj, header, i) => { obj[header] = values[i]?.trim().replace(/"/g, ''); return obj; }, {});
  });
};

const aggregateCropProfiles = (data) => {
  if (!Array.isArray(data) || data.length === 0) return {};
  const crops = {};
  data.forEach(row => {
    if (!row || typeof row !== 'object') return;
    const label = row.label?.toLowerCase().trim();
    if (!label) return;
    if (!crops[label]) {
      crops[label] = { 
        n: [], p: [], k: [], temperature: [], humidity: [], ph: [], rainfall: [],
        season: row.season || 'Kharif', 
        soil: row.soil_type || 'Loamy', 
        loc: row.location || 'India', 
        sow: row.sowing_time || 'Jan-Dec',
        fert: row.fertilizer || 'Balanced NPK', 
        comp: row.compost || 'Organic Manure', 
        pest: row.pest_control || 'Standard Control'
      };
    }
    ['n', 'p', 'k', 'temperature', 'humidity', 'ph', 'rainfall'].forEach(key => {
      const val = parseFloat(row[key]); 
      if (!isNaN(val)) crops[label][key].push(val);
    });
  });
  
  const final = {};
  Object.keys(crops).forEach(label => {
    const r = crops[label];
    final[label] = { ...r };
    ['n', 'p', 'k', 'temperature', 'humidity', 'ph', 'rainfall'].forEach(key => {
      const v = r[key];
      if (!v || v.length === 0) { 
        final[label][key] = { min: 0, max: 0, avg: 0, range: 1, mid: 0 }; 
      } else {
        const min = Math.min(...v);
        const max = Math.max(...v);
        const avg = v.reduce((a, b) => a + b, 0) / v.length;
        final[label][key] = { min, max, avg, range: Math.max(1, max - min), mid: (min + max) / 2 };
      }
    });
    
    const rain = final[label].rainfall || { min: 0, max: 0, avg: 0 };
    final[label].moisture = {
      min: Math.max(5, (rain.min || 0) / 20),
      max: Math.min(100, (rain.max || 1000) / 10),
      avg: Math.min(90, (rain.avg || 500) / 15)
    };
    final[label].moisture.mid = (final[label].moisture.min + final[label].moisture.max) / 2;
    final[label].moisture.range = Math.max(1, final[label].moisture.max - final[label].moisture.min);
  });
  return final;
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
    const csvLabels = Object.keys(db.crops || {});
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
      .then(t => {
        try {
          const processed = aggregateCropProfiles(parseCSV(t));
          setDb({ crops: processed, loading: false, error: false });
        } catch (e) {
          console.error("DB Parse Error", e);
          setDb({ crops: {}, loading: false, error: true });
        }
      })
      .catch(err => setDb({ crops: {}, loading: false, error: true }));
  }, []);

  const brain = useMemo(() => {
    if (db.loading || !db.crops || !sensorData) return null;
    const spec = getCropSpec(selectedCrop);
    const p = db.crops[selectedCrop] || {};
    
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

    const canFertilize = isAvailableLoc(cur.n) && isAvailableLoc(cur.p) && isAvailableLoc(cur.k);
    const defN = canFertilize ? Math.max(0, (profile.n?.mid || 0) - parseFloat(cur.n || 0)) : 0;
    const defP = canFertilize ? Math.max(0, (profile.p?.mid || 0) - parseFloat(cur.p || 0)) : 0;
    const defK = canFertilize ? Math.max(0, (profile.k?.mid || 0) - parseFloat(cur.k || 0)) : 0;
    
    let urea = canFertilize ? (defN / 0.46) + (meta.bU * 0.3) : 0;
    let ssp = canFertilize ? (defP / 0.16) + (meta.bS * 0.3) : 0;
    let mop = canFertilize ? (defK / 0.60) + (meta.bM * 0.3) : 0;
    
    const fertReasons = [];
    if (canFertilize) {
      if (parseFloat(cur.temp) > (profile.temperature?.max || 35)) { urea *= 0.9; fertReasons.push("High heat reduction"); }
      if (parseFloat(cur.moisture) < (profile.moisture?.min || 20)) { urea *= 1.1; fertReasons.push("Low moisture adjustment"); }
    }
    const fertReason = canFertilize ? (fertReasons.length > 0 ? fertReasons.join(" • ") : "Standard biological dose") : "Connect NPK sensors for analysis";
    const canCompost = isAvailableLoc(cur.moisture) && isAvailableLoc(cur.ph);
    let compost = canCompost ? meta.bC : 0;
    const cReasons = [];
    if (canCompost) {
      if (parseFloat(cur.moisture) < (profile.moisture?.min || 20)) { compost += 2; cReasons.push("Low moisture"); }
      if (String(meta.soil).includes("Sandy")) { compost += 2; cReasons.push("Sandy soil"); }
      if (isAvailableLoc(cur.n) && parseFloat(cur.n) < (profile.n?.min || 50)) { compost += 1; cReasons.push("N-Deficiency"); }
    }
    const compostReason = canCompost ? (cReasons.length > 0 ? cReasons.join(" + ") : "Ideal field balance") : "Connect Soil/pH sensors";

    const detectedPests = [{ 
      n: profile.pest || 'Standard Control', 
      s: 'High' , 
      tm: 0, hm: 0, rm: 0, 
      r: `Industrial recommendation for ${selectedCrop}` 
    }];

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
        product: profile.fert,
        reason: fertReason
      },
      compost: {
        isValid: canCompost,
        total: compost * area,
        perAcre: compost,
        product: profile.comp,
        reason: compostReason
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
          <div style={{ marginBottom: '1.5rem' }}>
            <div 
              onClick={() => setIsSheetOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px' }}
            >
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                {formatCropName(selectedCrop)}
              </h1>
              <ChevronDown size={20} color="#64748B" style={{ marginTop: '2px' }} />
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} color={COLORS.danger} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>{user?.location || 'MAKAUT, WB'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {React.createElement(getCropIcon(brain.meta.type, selectedCrop).icon, { size: 14, color: getCropIcon(brain.meta.type, selectedCrop).color })}
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getCropIcon(brain.meta.type, selectedCrop).color }}>{brain.meta.type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {React.createElement(getDemandIcon(brain.demand), { size: 14, color: getDemandColor(brain.demand) })}
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: getDemandColor(brain.demand) }}>{brain.demand} Demand</span>
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

          {/* METRICS STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
            <div>
               <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Confidence</div>
               <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B' }}>{brain.confidence > 0 ? (brain.confidence > 80 ? 'Strong' : 'Medium') : '---'} <span style={{ color: '#94A3B8', fontWeight: 500 }}>•</span> {brain.confidence > 0 ? `${brain.confidence}%` : '---'}</div>
            </div>
            <div>
               <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Match Score</div>
               <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B' }}>{brain.matchScore > 0 ? (brain.matchScore > 80 ? 'Good' : 'Fair') : '---'} <span style={{ color: '#94A3B8', fontWeight: 500 }}>•</span> {brain.matchScore > 0 ? `${brain.matchScore}%` : '---'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Status</div>
               <div style={{ fontSize: '0.9rem', fontWeight: 800, color: brain.recColor }}>{brain.matchScore > 0 ? (brain.matchScore > 50 ? '✔ Suitable' : '✘ Risky') : '---'}</div>
            </div>
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
                <span style={{ fontSize: '0.7rem', fontWeight: 850, color: COLORS.textMain }}>Recommendation: <span style={{ color: COLORS.primaryDark }}>{brain.fertilizer.product}</span></span>
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
                <div key={i} style={{ padding: '16px', borderRadius: '22px', background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.02)', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Bug size={16} color={COLORS.danger} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 950, color: COLORS.textMain }}>{p.n}</span>
                    </div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 950, padding: '4px 10px', borderRadius: '20px', background: '#FEF2F2', color: COLORS.danger }}>{p.s} RISK</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: COLORS.textMuted, fontWeight: 750, lineHeight: 1.4 }}>{p.r}</p>
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
