/**
 * AgriSense v4.0.0 - Farm-to-Table Transparency
 * Visualizes the product journey from harvest to market.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sprout, Package, Truck, Store, 
  QrCode, ShieldCheck, CheckCircle2, 
  MapPin, Thermometer, Clock, Info,
  Search, Barcode, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const COLORS = {
  success: '#10B981',
  warning: '#F59E0B',
  critical: '#EF4444',
  text: '#0F172A',
  subtext: '#64748B',
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: 'rgba(0,0,0,0.05)'
};

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

const TimelineItem = ({ stage, isLast }) => {
  const { icon: Icon, title, status, description, date, details, color } = stage;
  const isHealthy = status === 'Good' || status === 'Safe' || status === 'OK';

  return (
    <div style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
      {/* Line & Icon */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ 
          width: '40px', height: '40px', borderRadius: '14px', 
          background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${color}30`, zIndex: 2
        }}>
          <Icon size={20} color={color} />
        </div>
        {!isLast && (
          <div style={{ 
            width: '2px', flex: 1, background: `linear-gradient(to bottom, ${color}30, #E2E8F0)`, 
            margin: '8px 0', borderRadius: '1px' 
          }} />
        )}
      </div>

      {/* Content Card */}
      <motion.div 
        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
        style={{ 
          flex: 1, background: COLORS.card, borderRadius: '20px', padding: '1rem',
          border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
          marginBottom: isLast ? '0' : '1.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 850, color: COLORS.text }}>{title}</h4>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: COLORS.subtext }}>{date}</span>
          </div>
          <div style={{ 
            padding: '4px 10px', borderRadius: '10px', background: isHealthy ? '#ECFDF5' : '#FFFBEB',
            fontSize: '0.6rem', fontWeight: 900, color: isHealthy ? COLORS.success : COLORS.warning,
            textTransform: 'uppercase'
          }}>
            {status}
          </div>
        </div>

        <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: COLORS.subtext, lineHeight: 1.5 }}>
          {description}
        </p>

        {details && (
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', 
            background: '#F8FAFC', padding: '10px', borderRadius: '12px' 
          }}>
            {details.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <d.icon size={12} color={COLORS.subtext} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: COLORS.text }}>{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

const Traceability = () => {
  const { sensorData } = useApp();

  const stages = [
    {
      id: 'farm',
      icon: Sprout,
      title: '🌱 Harvested at Farm',
      status: 'Good',
      date: 'April 22, 2024 • 06:30 AM',
      description: 'Hand-picked from Block A-12 using regenerative practices. No synthetic pesticides used.',
      color: '#10B981',
      details: [
        { icon: MapPin, label: 'Kalyani, Sector A' },
        { icon: ShieldCheck, label: 'Quality: Premium' }
      ]
    },
    {
      id: 'storage',
      icon: Package,
      title: '📦 Smart Storage',
      status: sensorData.storage.temp < 15 ? 'Safe' : 'Optimal',
      date: 'April 22, 2024 • 09:15 AM',
      description: 'Stored in vault with active ethylene monitoring to maximize freshness.',
      color: '#8B5CF6',
      details: [
        { icon: Thermometer, label: `${sensorData.storage.temp?.toFixed(1) || '--'}°C Temp` },
        { icon: Clock, label: 'Stored for 3h' }
      ]
    },
    {
      id: 'transport',
      icon: Truck,
      title: '🚚 In Transit',
      status: 'Safe',
      date: 'April 23, 2024 • 04:00 AM',
      description: 'Currently in refrigerated transit. Cold chain is strictly maintained.',
      color: '#0EA5E9',
      details: [
        { icon: Thermometer, label: '4.2°C (Stable)' },
        { icon: Clock, label: '120km to Target' }
      ]
    },
    {
      id: 'market',
      icon: Store,
      title: '🏪 Local Market',
      status: 'Scheduled',
      date: 'April 23, 2024 • Expected 11:00 AM',
      description: 'Estimated arrival at Big Bazaar Hub. Final quality inspection pending.',
      color: '#F59E0B',
      details: [
        { icon: MapPin, label: 'Kolkata Hub' },
        { icon: Barcode, label: 'Batch #A21-04' }
      ]
    }
  ];

  return (
    <div style={{ padding: '1.25rem', background: COLORS.background, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'white', borderRadius: '28px', padding: '1.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: `1px solid ${COLORS.border}`,
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '8px', background: `${COLORS.success}15`, borderRadius: '12px' }}>
              <Barcode size={24} color={COLORS.success} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ECFDF5', padding: '6px 12px', borderRadius: '12px' }}>
              <CheckCircle2 size={14} color={COLORS.success} />
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: COLORS.success, textTransform: 'uppercase' }}>Fully Traceable</span>
            </div>
          </div>
          
          <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Batch Monitoring</p>
          <h2 style={{ margin: '2px 0 10px 0', fontSize: '1.4rem', fontWeight: 950, color: COLORS.text }}>Tomato Batch #21-04</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '12px', borderRadius: '16px' }}>
            <Info size={16} color={COLORS.success} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: COLORS.text }}>Cold chain maintained for entire journey.</span>
          </div>
        </div>

        {/* QR Scanner Shortcut */}
        <button style={{ 
          position: 'absolute', right: '1.5rem', bottom: '1.5rem',
          width: '50px', height: '50px', borderRadius: '50%', background: COLORS.text,
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
          boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
        }}>
          <QrCode size={24} color="white" />
        </button>
      </motion.div>

      {/* Timeline Grid */}
      <div style={{ padding: '0 0.5rem' }}>
        {stages.map((stage, index) => (
          <TimelineItem 
            key={stage.id} 
            stage={stage} 
            isLast={index === stages.length - 1} 
          />
        ))}
      </div>

      {/* Action Line */}
      <div style={{ 
        textAlign: 'center', padding: '10px 0', borderTop: '1px dashed #E2E8F0',
        fontSize: '0.75rem', fontWeight: 700, color: COLORS.subtext
      }}>
        View full digital ledger via AgriSense Block-Link
      </div>

    </div>
  );
};

export default Traceability;
