import { 
  Wheat, Sprout, Sun, Shrub, Clover, Bean, Leaf, Nut, Apple, Citrus, 
  Flower, Carrot, Droplets, Zap, FlaskConical, Activity, Minus, Banana, 
  Grape, TreePine, Cherry, Shell, Brain, Trees, Milk, Cloud, Waves, 
  TrendingUp, TrendingDown, Coffee, MapPin, Calculator, RefreshCw,
  ShieldCheck, AlertCircle, CheckCircle2, XCircle, Clock, BarChart3,
  Search, X, ChevronRight, Scale, Microscope, Sparkles, Info,
  AlertTriangle, Trees as TreesIcon, CloudRain, Thermometer, ChevronDown
} from 'lucide-react';

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const isAvailable = (val) => val !== undefined && val !== null && val !== '' && val !== '---';
export const isAvailableLoc = (v) => v !== null && v !== undefined && v !== '' && v !== '---';

export const getCropIcon = (type, name = '') => {
  const t = type?.toLowerCase() || '';
  const n = name?.toLowerCase() || '';

  // 🌾 GRAINS & CEREALS
  if (n.includes('rice') || n.includes('paddy')) return { icon: Wheat, color: '#10B981' }; 
  if (n.includes('wheat')) return { icon: Wheat, color: '#EAB308' }; 
  if (n.includes('maize') || n.includes('corn')) return { icon: Sun, color: '#FACC15' }; 
  if (n.includes('barley')) return { icon: Wheat, color: '#D97706' }; 
  if (n.includes('bajra')) return { icon: Sprout, color: '#84CC16' }; 
  if (n.includes('jowar')) return { icon: Shrub, color: '#65A30D' }; 
  if (n.includes('ragi')) return { icon: Clover, color: '#4D7C0F' }; 

  // 🫘 PULSES (LEGUMES)
  if (n.includes('arhar') || n.includes('tur')) return { icon: Bean, color: '#A855F7' }; 
  if (n.includes('gram') || n.includes('chana')) return { icon: Bean, color: '#92400E' }; 
  if (n.includes('moong')) return { icon: Bean, color: '#22C55E' }; 
  if (n.includes('urad')) return { icon: Bean, color: '#1E293B' }; 
  if (n.includes('masoor')) return { icon: Bean, color: '#F97316' }; 
  if (n.includes('kidney') || n.includes('rajma')) return { icon: Bean, color: '#B91C1C' }; 
  if (n.includes('moth')) return { icon: Bean, color: '#78350F' }; 

  // 🥗 VEGETABLES & GREENS
  if (n.includes('potato')) return { icon: Nut, color: '#D97706' };
  if (n.includes('tomato')) return { icon: Apple, color: '#EF4444' };
  if (n.includes('onion')) return { icon: Citrus, color: '#D946EF' }; 
  if (n.includes('brinjal')) return { icon: Apple, color: '#7C3AED' }; 
  if (n.includes('cabbage')) return { icon: Shrub, color: '#22C55E' };
  if (n.includes('cauliflower')) return { icon: Flower, color: '#CBD5E1' }; 
  if (n.includes('spinach')) return { icon: Leaf, color: '#15803D' };
  if (n.includes('okra')) return { icon: Leaf, color: '#16A34A' }; 
  if (n.includes('carrot')) return { icon: Carrot, color: '#F97316' };
  if (n.includes('radish')) return { icon: Carrot, color: '#F1F5F9' }; 
  if (n.includes('peas')) return { icon: Droplets, color: '#16A34A' }; 
  if (n.includes('capsicum')) return { icon: Citrus, color: '#10B981' }; 
  if (n.includes('chili')) return { icon: Zap, color: '#EF4444' }; 
  if (n.includes('pumpkin')) return { icon: Citrus, color: '#F97316' };
  if (n.includes('bottle gourd')) return { icon: FlaskConical, color: '#4ADE80' }; 
  if (n.includes('bitter gourd')) return { icon: Activity, color: '#166534' }; 
  if (n.includes('cucumber')) return { icon: Minus, color: '#22C55E' };
  if (n.includes('beans')) return { icon: Leaf, color: '#10B981' };
  if (n.includes('garlic')) return { icon: Nut, color: '#E2E8F0' };
  if (n.includes('fenugreek')) return { icon: Clover, color: '#16A34A' };
  if (n.includes('coriander')) return { icon: Shrub, color: '#22C55E' };
  if (n.includes('mint')) return { icon: Leaf, color: '#4ADE80' };

  // 🍎 FRUITS & NUTS
  if (n.includes('mango')) return { icon: Citrus, color: '#FBBF24' };
  if (n.includes('banana')) return { icon: Banana, color: '#EAB308' };
  if (n.includes('apple')) return { icon: Apple, color: '#EF4444' };
  if (n.includes('guava')) return { icon: Citrus, color: '#4ADE80' };
  if (n.includes('orange')) return { icon: Citrus, color: '#F97316' };
  if (n.includes('papaya')) return { icon: Citrus, color: '#F59E0B' };
  if (n.includes('pomegranate')) return { icon: Apple, color: '#B91C1C' };
  if (n.includes('grapes')) return { icon: Grape, color: '#8B5CF6' };
  if (n.includes('pineapple')) return { icon: TreePine, color: '#EAB308' };
  if (n.includes('watermelon')) return { icon: Citrus, color: '#15803D' };
  if (n.includes('muskmelon')) return { icon: Citrus, color: '#FBBF24' };
  if (n.includes('litchi')) return { icon: Cherry, color: '#EF4444' };
  if (n.includes('coconut')) return { icon: Nut, color: '#78350F' };
  if (n.includes('cashew')) return { icon: Shell, color: '#D97706' };
  if (n.includes('almond')) return { icon: Nut, color: '#92400E' };
  if (n.includes('walnut')) return { icon: Brain, color: '#78350F' };

  // 💰 CASH & PLANTATION
  if (n.includes('sugarcane')) return { icon: Trees, color: '#22C55E' };
  if (n.includes('coffee')) return { icon: Coffee, color: '#78350F' };
  if (n.includes('tea')) return { icon: Leaf, color: '#15803D' };
  if (n.includes('rubber')) return { icon: Milk, color: '#F8FAFC' };
  if (n.includes('ginger') || n.includes('turmeric')) return { icon: Nut, color: '#D97706' };
  if (n.includes('cumin')) return { icon: Wheat, color: '#92400E' };
  if (n.includes('pepper')) return { icon: Nut, color: '#1E293B' };
  if (n.includes('cardamom')) return { icon: Sprout, color: '#16A34A' };

  // 🧵 FIBER & OILSEEDS
  if (n.includes('cotton')) return { icon: Cloud, color: '#F1F5F9' };
  if (n.includes('jute')) return { icon: Waves, color: '#94A3B8' };
  if (n.includes('groundnut')) return { icon: Nut, color: '#D97706' };
  if (n.includes('mustard')) return { icon: Flower, color: '#FACC15' };
  if (n.includes('soybean')) return { icon: Sprout, color: '#F1F5F9' };
  if (n.includes('sunflower')) return { icon: Sun, color: '#FBBF24' };

  // 🌸 FLOWERS
  if (n.includes('rose')) return { icon: Flower, color: '#EF4444' };
  if (n.includes('marigold')) return { icon: Flower, color: '#F97316' };
  if (n.includes('jasmine') || n.includes('lily')) return { icon: Flower, color: '#F1F5F9' };
  if (n.includes('lotus')) return { icon: Flower, color: '#F472B6' };
  if (n.includes('hibiscus')) return { icon: Flower, color: '#EC4899' };
  if (n.includes('chrysanthemum')) return { icon: Flower, color: '#FBBF24' };
  if (n.includes('tuberose')) return { icon: Flower, color: '#E2E8F0' };
  if (n.includes('orchid')) return { icon: Flower, color: '#8B5CF6' };

  // Category Fallbacks
  if (t.includes('seed')) return { icon: Sprout, color: '#6366F1' };
  if (t.includes('grain')) return { icon: Wheat, color: '#EAB308' };
  if (t.includes('veg')) return { icon: Carrot, color: '#22C55E' };
  if (t.includes('fruit')) return { icon: Apple, color: '#F97316' };
  if (t.includes('flower')) return { icon: Flower, color: '#EC4899' };
  
  return { icon: Sprout, color: '#10B981' };
};

export const getDemandIcon = (demand) => {
  const d = demand?.toLowerCase() || '';
  if (d.includes('high')) return TrendingUp;
  if (d.includes('low')) return TrendingDown;
  return Activity;
};

export const getDemandColor = (demand) => {
  const d = demand?.toLowerCase() || '';
  if (d.includes('high')) return '#10B981';
  if (d.includes('medium')) return '#F59E0B';
  return '#94A3B8';
};

export const formatCropName = (name) => {
  if (!name) return '';
  return name.split('(')[0].trim().replace(/\b\w/g, l => l.toUpperCase());
};

export const parseCSV = (t) => {
  if (!t || t.trim().length === 0) return [];
  const lines = t.trim().split('\n');
  if (lines.length < 1) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
  
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    return headers.reduce((obj, header, i) => { obj[header] = values[i]; return obj; }, {});
  });
};

export const aggregateCropProfiles = (data) => {
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
    const getMid = (arr) => {
      if (arr.length === 0) return 0;
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      return { min, max, mid: (min + max) / 2 };
    };
    final[label] = { 
      ...r,
      n: getMid(r.n), p: getMid(r.p), k: getMid(r.k), 
      temperature: getMid(r.temperature), 
      humidity: getMid(r.humidity), 
      ph: getMid(r.ph), 
      rainfall: getMid(r.rainfall)
    };
  });
  return final;
};
