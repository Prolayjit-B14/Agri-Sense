import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, 
  Mic, Activity, Droplets, Bug, Info,
  Paperclip, Smile, Camera, MoreVertical, Phone, Video, CheckCheck,
  Sparkles, Zap, ShieldCheck, Leaf, X, MessageSquare, User
} from 'lucide-react';
import { useApp } from '../state/AppContext';
import { useTelemetry } from '../state/TelemetryContext';
import { askGemini } from '../api/aiService';
import { getAgronomyKnowledge } from '../api/knowledgeService';
import ReactMarkdown from 'react-markdown';

const COLORS = {
  critical: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  success: '#10B981',
  text: '#0F172A',
  subtext: '#64748B',
  bg: '#FFFFFF',
  border: 'rgba(0, 0, 0, 0.05)'
};

// ─── ANIMATION CONFIGS ──────────────────────────────────────────────────────
const springConfig = { type: "spring", stiffness: 400, damping: 30 };
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

const AgriBot = () => {
  const { apiWeather, farmInfo, currentGPS } = useApp();
  const telemetry = useTelemetry();
  
  const telemetryRef = useRef(telemetry);
  useEffect(() => {
    telemetryRef.current = telemetry;
  }, [telemetry]);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    getAgronomyKnowledge().then(data => setKnowledgeBase(data));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const { sensorData, systemHealth, recommendations, sensorHistory } = telemetryRef.current;
    
    // 🚀 Optimize context to prevent token overflow and improve focus
    const context = {
      farmName: farmInfo?.name || 'AgriSense Farm',
      location: currentGPS?.city || 'Regional Hub',
      currentSensors: sensorData,
      weather: apiWeather,
      health: systemHealth,
      recentLogs: sensorHistory?.slice(-5),
      time: new Date().toLocaleTimeString()
    };

    try {
      const response = await askGemini(text, context);
      const aiMessage = { role: 'ai', content: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AgriBot API Error:", error);
      const errorMessage = { 
        role: 'ai', 
        content: "### 🔌 CONNECTION ANOMALY\nI'm having trouble reaching the neural link. I'll use my **Local Logic Engine** to assist you instead.\n\n*Tip: Check your internet connection or API credits.*", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* 🚀 FLOATING TRIGGER BUBBLE (Enhanced Visibility) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 50 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            style={{
              position: 'fixed',
              bottom: '100px', 
              right: '20px',
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              zIndex: 9999,
              cursor: 'pointer'
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(16, 185, 129, 0.3)' }}>
              <Bot size={24} strokeWidth={2.5} />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 🤖 PREMIUM CHAT INTERFACE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' }}
            transition={springConfig}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: 'calc(100vw - 40px)',
              maxWidth: '440px',
              height: '80vh',
              maxHeight: '680px',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(30px)',
              borderRadius: '28px',
              boxShadow: '0 50px 100px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 10001,
              border: '1px solid rgba(0,0,0,0.08)',
              color: '#1E293B'
            }}
          >
            {/* 🛠️ INDUSTRIAL GRID OVERLAY */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, #FFF 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            {/* 💎 COMMAND CENTER HEADER */}
            <div style={{
              padding: '28px 24px',
              background: 'linear-gradient(to bottom, #F8FAFC 0%, transparent 100%)',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #10B981 0%, #064E3B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Bot size={30} color="white" strokeWidth={2} />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', background: '#22C55E', border: '3.5px solid #0F172A', boxShadow: '0 0 15px rgba(34, 197, 94, 0.6)' }} 
                  />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A', margin: 0, letterSpacing: '-0.04em' }}>AgriSense Intelligence</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <Zap size={12} color="#10B981" fill="#10B981" />
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Neural Core Online</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.05)', color: '#94A3B8', width: '40px', height: '40px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={22} />
                </motion.button>
              </div>
            </div>

            {/* Chat Area with Light Theme */}
            <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#F8FAFC' }}>
              <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

              {messages.length === 0 && (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  style={{ textAlign: 'center', padding: '40px 0' }}
                >
                  <motion.div 
                    variants={itemFadeUp}
                    style={{ width: '70px', height: '70px', borderRadius: '22px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(16, 185, 129, 0.15)' }}
                  >
                    <Sparkles size={32} color="#10B981" />
                  </motion.div>
                  <motion.h2 variants={itemFadeUp} style={{ fontSize: '1.4rem', fontWeight: 950, color: '#0F172A', margin: '0 0 10px', letterSpacing: '-0.02em' }}>Intelligence Command</motion.h2>
                  <motion.p variants={itemFadeUp} style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B', margin: '0 0 32px', lineHeight: 1.5 }}>Synchronize with the neural link to analyze sensor forensics and optimize your farm operations.</motion.p>
                  
                  <motion.div variants={itemFadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                    {[
                      { l: "📊 Analytics", q: "Provide a forensic health summary" },
                      { l: "💧 Hydraulics", q: "Irrigation system pressure check" },
                      { l: "🛡️ Security", q: "Any biometric anomalies detected?" },
                      { l: "📈 Optimization", q: "Strategic yield improvement plan" }
                    ].map(s => (
                      <motion.button 
                        key={s.l} 
                        whileHover={{ scale: 1.05, background: '#10B981', color: 'white' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSend(s.q)} 
                        style={{ padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', background: 'white', fontSize: '0.75rem', fontWeight: 850, color: '#0F172A', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
                      >
                        {s.l}
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: msg.role === 'user' ? '#10B981' : '#FFFFFF',
                    color: msg.role === 'user' ? 'white' : '#1E293B',
                    padding: '16px 20px',
                    borderRadius: msg.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                    boxShadow: msg.role === 'user' ? '0 10px 25px rgba(16, 185, 129, 0.25)' : '0 10px 25px rgba(0,0,0,0.05)',
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(0,0,0,0.05)',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    lineHeight: 1.6
                  }}
                >
                  <ReactMarkdown 
                    components={{
                      h3: ({node, ...props}) => <h3 style={{ fontSize: '1rem', fontWeight: 900, margin: '14px 0 8px', color: msg.role === 'user' ? 'white' : '#10B981' }} {...props} />,
                      p: ({node, ...props}) => <p style={{ margin: '0 0 10px' }} {...props} />,
                      li: ({node, ...props}) => <li style={{ marginBottom: '6px' }} {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                  <div style={{ fontSize: '0.6rem', opacity: 0.5, marginTop: '10px', textAlign: msg.role === 'user' ? 'right' : 'left', fontWeight: 900, letterSpacing: '0.05em' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ alignSelf: 'flex-start', background: 'white', padding: '12px 20px', borderRadius: '18px', display: 'flex', gap: '6px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                >
                  {[0,1,2].map(i => <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i*0.15 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />)}
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Premium Input Bar */}
            <div style={{ padding: '24px', background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Transmit query to neural link..."
                  style={{ 
                    width: '100%', 
                    border: '1px solid rgba(0,0,0,0.08)', 
                    background: '#F1F5F9', 
                    borderRadius: '14px', 
                    padding: '14px 18px', 
                    fontSize: '0.95rem', 
                    outline: 'none', 
                    fontWeight: 600,
                    color: '#0F172A',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10B981'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.08)'}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05, background: '#059669', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend()}
                style={{ 
                  width: '52px', 
                  height: '52px', 
                  borderRadius: '14px', 
                  background: '#10B981', 
                  color: 'white', 
                  border: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)'
                }}
              >
                <Send size={22} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AgriBot;
