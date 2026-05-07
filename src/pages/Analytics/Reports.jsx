import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../state/AppContext';
import { useTelemetry } from '../../state/TelemetryContext';
import { 
  FileText, Download, ShieldCheck, 
  RefreshCw, FileCheck, Loader2,
  Database, Activity, 
  Lock, Cpu, Zap, 
  ChevronRight, Printer,
  Sprout, CloudRain, Droplets,
  ZoomIn, ZoomOut, Eye, Award, 
  TrendingUp, ClipboardList, Sparkles,
  ChevronLeft, PieChart, Shield,
  ArrowRight, FilePlus, RotateCcw, AlertTriangle, Maximize, Globe
} from 'lucide-react';
// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const T = {
  emerald: '#10B981',
  emeraldLight: '#ECFDF5',
  slate: '#0F172A',
  slateMuted: '#64748B',
  bg: '#FFFFFF',
  viewerBg: 'linear-gradient(165deg, #F8FAFC 0%, #E2E8F0 100%)',
  cardBg: 'linear-gradient(165deg, #FFFFFF 0%, #FBFDFF 100%)',
  border: 'rgba(0, 0, 0, 0.05)',
  shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
  glass: 'rgba(255, 255, 255, 0.8)',
};

const DataCard = memo(({ label, value, status, color = T.emerald }) => (
  <div style={{ 
    padding: '0.75rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0',
    display: 'flex', flexDirection: 'column', gap: '4px'
  }}>
    <div style={{ fontSize: '0.5rem', fontWeight: 900, color: T.slateMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ fontSize: '0.9rem', fontWeight: 950, color: T.slate, letterSpacing: '-0.02em' }}>{value}</div>
    {status && <div style={{ fontSize: '0.45rem', fontWeight: 950, color: color, marginTop: '2px', textTransform: 'uppercase' }}>{status}</div>}
  </div>
));

const ReportPage = memo(({ title, subtitle, color = T.emerald, children, activePage, totalPages }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98, y: 10 }} 
    animate={{ opacity: 1, scale: 1, y: 0 }} 
    style={{ 
      width: 'auto',
      height: 'auto',
      maxWidth: '100%',
      maxHeight: '100%',
      aspectRatio: '210/297', // Exact A4 ratio
      background: 'white', 
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', 
      position: 'relative', 
      padding: '0.85rem', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      borderRadius: '2px',
      border: '1px solid rgba(0,0,0,0.05)'
    }}
  >
    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: color }} />
    
    {/* Page Header */}
    <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: T.slate, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={16} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 950, color: T.slate, margin: 0, letterSpacing: '-0.01em' }}>AGRISENSE PRO</h2>
          <div style={{ fontSize: '0.45rem', fontWeight: 900, color: T.slateMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>INDUSTRIAL AUDIT</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 950, color: T.slate }}>{title}</div>
        <div style={{ fontSize: '0.45rem', fontWeight: 800, color: T.slateMuted }}>PAGE {activePage} OF {totalPages}</div>
      </div>
    </div>

    {/* Content Area */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <div style={{ width: '3px', height: '12px', background: color, borderRadius: '2px' }} />
        <h4 style={{ fontSize: '0.65rem', fontWeight: 950, color: T.slate, margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{subtitle}</h4>
      </div>
      {children}
    </div>

    {/* Page Footer */}
    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Shield size={12} color={T.slateMuted} />
        <span style={{ fontSize: '0.5rem', fontWeight: 900, color: T.slateMuted, letterSpacing: '0.02em' }}>ENCRYPTED VERIFICATION LINK</span>
      </div>
      <div style={{ fontSize: '0.5rem', fontWeight: 950, color: T.slate, opacity: 0.6 }}>v17.4.9-SECURE</div>
    </div>
  </motion.div>
));

const Reports = () => {
  const { sensorData } = useTelemetry();
  const [genStep, setGenStep] = useState(0); 
  const [activePage, setActivePage] = useState(1);
  const TOTAL_PAGES = 11;

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };
  
  const steps = useMemo(() => [
    { label: 'System Ready', icon: <Cpu /> },
    { label: 'Syncing Nodes', icon: <Activity /> },
    { label: 'Neural Build', icon: <Zap /> },
    { label: 'Formulating', icon: <FileText /> },
    { label: 'Signing Data', icon: <Database /> },
    { label: 'Audit Ready', icon: <ShieldCheck /> }
  ], []);

  const handleGenerate = () => {
    setGenStep(1);
    [400, 1000, 1800, 2600, 3200].forEach((t, i) => setTimeout(() => setGenStep(i + 1), t));
  };

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{ 
        padding: '0.8rem 1rem', paddingBottom: '140px', background: T.bg, height: '100dvh', 
        display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif", overflow: 'hidden'
      }}
    >
      
      {/* ─── STATUS HEADER / CTA ─── */}
      <section style={{ marginBottom: '0.5rem', flexShrink: 0 }}>
        <div style={{ 
          background: T.cardBg, padding: '0.65rem 0.85rem', borderRadius: '20px', 
          border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', 
          justifyContent: 'space-between', boxShadow: T.shadow 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '10px', 
              background: genStep === 5 ? `${T.emerald}15` : '#F1F5F9', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${genStep === 5 ? `${T.emerald}20` : 'transparent'}`
            }}>
               {genStep === 5 ? <FileCheck color={T.emerald} size={16} strokeWidth={2.5} /> : React.cloneElement(steps[genStep].icon, { size: 16, color: genStep === 0 ? T.slateMuted : T.emerald })}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.5rem', fontWeight: 900, color: T.slateMuted, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>STATUS</p>
              <h3 style={{ margin: '1px 0 0 0', fontSize: '0.75rem', fontWeight: 950, color: T.slate, lineHeight: 1 }}>{steps[genStep].label}</h3>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '6px' }}>
            {genStep === 0 && (
               <motion.button 
                 whileTap={{ scale: 0.95 }}
                 onClick={handleGenerate} 
                 style={{ 
                   padding: '0 12px', height: '32px', borderRadius: '10px', 
                   background: T.emerald, color: 'white', border: 'none', 
                   fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer',
                   boxShadow: `0 8px 16px ${T.emerald}30`
                 }}
               >
                 START
               </motion.button>
            )}
            {genStep === 5 && (
              <>
                 <motion.button 
                   whileTap={{ scale: 0.95 }}
                   onClick={() => setGenStep(0)} 
                   style={{ 
                     padding: '0 10px', height: '32px', background: 'white', color: T.slate, 
                     borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.55rem', fontWeight: 800 
                   }}
                 >
                   RESET
                 </motion.button>
                 <motion.button 
                   whileTap={{ scale: 0.95 }}
                   style={{ 
                     padding: '0 12px', height: '32px', borderRadius: '10px', 
                     background: T.emerald, color: 'white', border: 'none', 
                     fontSize: '0.6rem', fontWeight: 900, boxShadow: `0 8px 16px ${T.emerald}30`
                   }}
                 >
                   EXPORT
                 </motion.button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── DOCUMENT VIEWER ─── */}
      <div style={{ 
        flex: 1, background: T.viewerBg, borderRadius: '28px', 
        display: 'flex', flexDirection: 'column', overflow: 'hidden', 
        border: '1.5px solid #E2E8F0', position: 'relative',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
      }}>
        {genStep === 5 && (
          <div style={{ 
            height: '40px', background: 'white', borderBottom: '1.5px solid #E2E8F0', 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            padding: '0 1rem', flexShrink: 0 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} color={T.emerald} />
              <span style={{ fontSize: '0.65rem', fontWeight: 950, color: T.slate }}>AUDIT_REPORT.pdf</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <motion.button whileTap={{ scale: 0.8 }} onClick={() => setActivePage(p => Math.max(1, p - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><ChevronLeft size={20} color={T.slate} /></motion.button>
              <span style={{ fontSize: '0.7rem', fontWeight: 950, color: T.slate, minWidth: '40px', textAlign: 'center' }}>{activePage} / {TOTAL_PAGES}</span>
              <motion.button whileTap={{ scale: 0.8 }} onClick={() => setActivePage(p => Math.min(TOTAL_PAGES, p + 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><ChevronRight size={20} color={T.slate} /></motion.button>
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', overflow: 'hidden', position: 'relative' }}>
          <AnimatePresence mode="wait">
            {genStep === 0 && (
              <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', color: T.slateMuted }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: T.shadow }}>
                  <FilePlus size={32} strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700 }}>Awaiting audit initiation</p>
              </motion.div>
            )}
            
            {genStep > 0 && genStep < 5 && (
              <motion.div key="building" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
                <Loader2 size={36} color={T.emerald} className="animate-spin" />
                <p style={{ marginTop: '0.75rem', fontSize: '0.65rem', fontWeight: 800, color: T.slate, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Assembling Data...</p>
              </motion.div>
            )}

            {genStep === 5 && (
              <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ReportPage 
                  key={`p${activePage}`} 
                  title={activePage === 1 ? "EXECUTIVE OVERVIEW" : `PHASE 0${activePage}`} 
                  subtitle={activePage === 1 ? "DIAGNOSTIC TELEMETRY" : "METRIC FORENSICS"} 
                  activePage={activePage} 
                  totalPages={TOTAL_PAGES}
                >
                  {/* ... (children content same as before) */}
                  {activePage === 1 && (
                    <>
                      <div style={{ width: '100%', height: '35%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #F1F5F9', marginBottom: '0.4rem', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={48} color={T.emerald} opacity={0.15} strokeWidth={1} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        <DataCard label="Stability" value="98.4%" status="Nominal" />
                        <DataCard label="Nodes" value="12 ACT" status="Global" />
                        <DataCard label="Latency" value="14ms" status="Direct" />
                      </div>
                      <div style={{ marginTop: '0.5rem', padding: '0.6rem', background: `${T.emerald}05`, borderRadius: '10px', border: `1px solid ${T.emerald}10` }}>
                        <p style={{ margin: 0, fontSize: '0.5rem', fontWeight: 700, color: T.emerald, lineHeight: 1.3 }}>
                          System health is within high-fidelity parameters. All terrestrial nodes are synchronized.
                        </p>
                      </div>
                    </>
                  )}
                  {activePage === 2 && (
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                      <DataCard label="Moisture" value={`${sensorData?.soil?.moisture || 42}%`} status="Field A" />
                      <DataCard label="pH Level" value={`${sensorData?.soil?.ph || 6.8}`} status="Calibration" />
                      <DataCard label="Nitrogen" value={`${sensorData?.soil?.npk?.n || 140}ppm`} status="Optimal" />
                      <DataCard label="Temp" value={`${sensorData?.soil?.temp || 27.5}°C`} status="Ambient" />
                      <div style={{ gridColumn: '1 / -1' }}>
                         <DataCard label="Alert Level" value="CLEAN" status="Secure" color={T.emerald} />
                      </div>
                    </div>
                  )}
                  {activePage >= 3 && (
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px' }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{ padding: '0.4rem 0.6rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.35rem', fontWeight: 900, color: T.slateMuted, textTransform: 'uppercase' }}>NODE_ID_00{activePage}{i}</div>
                              <div style={{ fontSize: '0.6rem', fontWeight: 950, color: T.slate }}>Forensic Link Verified</div>
                            </div>
                            <ShieldCheck size={12} color={T.emerald} />
                          </div>
                        ))}
                     </div>
                  )}
                </ReportPage>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </motion.div>
  );
};

export default Reports;
