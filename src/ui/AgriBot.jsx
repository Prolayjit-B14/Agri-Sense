import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, 
  Activity, Sparkles, Zap, X, Cpu, Terminal, 
  Settings, History, BarChart3, Globe, Shield
} from 'lucide-react';
import { useApp } from '../state/AppContext';
import { useTelemetry } from '../state/TelemetryContext';
import { askGemini } from '../api/aiService';
import ReactMarkdown from 'react-markdown';

const COLORS = {
  primary: '#10B981',
  secondary: '#3B82F6',
  accent: '#7C3AED',
  danger: '#EF4444',
  warning: '#F59E0B',
  dark: '#0F172A',
  glass: 'rgba(255, 255, 255, 0.8)',
  stroke: 'rgba(0, 0, 0, 0.08)'
};

const springConfig = { type: "spring", stiffness: 400, damping: 30 };

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
  const chatEndRef = useRef(null);

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

    const { sensorData, systemHealth, sensorHistory } = telemetryRef.current;
    
    const context = {
      farmName: farmInfo?.name || 'AgriSense Farm',
      projectName: farmInfo?.projectName || 'AgriSense Pro',
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
        content: "### 🛰️ NEURAL LINK INTERRUPTED\nI'm experiencing a high-latency connection. Re-routing through local diagnostic engines.\n\n*Check your network status or API configuration in setup/index.js.*", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* 🚀 TECH-FORWARD TRIGGER BUBBLE */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 45 }}
            whileHover={{ scale: 1.1, boxShadow: `0 10px 40px ${COLORS.primary}40` }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            style={{
              position: 'fixed',
              bottom: '100px', 
              right: '20px',
              width: '68px',
              height: '68px',
              borderRadius: '22px',
              background: COLORS.dark,
              color: 'white',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              zIndex: 9999,
              cursor: 'pointer',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${COLORS.primary}20 0%, transparent 100%)` }} />
            <div style={{ 
              width: '42px', height: '42px', borderRadius: '14px', 
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, #059669 100%)`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              boxShadow: `0 5px 15px ${COLORS.primary}40`,
              zIndex: 1
            }}>
              <Bot size={26} strokeWidth={2.5} />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              style={{ position: 'absolute', width: '120%', height: '120%', border: '1px dashed rgba(16, 185, 129, 0.2)', borderRadius: '50%' }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 🤖 COMMAND CENTER INTERFACE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={springConfig}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: 'calc(100vw - 40px)',
              maxWidth: '460px',
              height: '85vh',
              maxHeight: '720px',
              background: '#FFFFFF',
              borderRadius: '32px',
              boxShadow: '0 40px 120px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 10001,
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            {/* 🛠️ TOP NAVIGATION / STATUS BAR */}
            <div style={{
              padding: '24px 28px',
              background: '#F8FAFC',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      width: '52px', height: '52px', borderRadius: '15px', 
                      background: 'rgba(16, 185, 129, 0.1)', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#059669" fillOpacity="0.2" />
                        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 7v6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ position: 'absolute', bottom: -2, right: -2, width: '14px', height: '14px', borderRadius: '50%', background: COLORS.primary, border: '3px solid white' }} 
                    />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 950, color: COLORS.dark, margin: 0, letterSpacing: '-0.04em' }}>
                      Agri Bot
                    </h3>
                  </div>
                </div>
                
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'rgba(0,0,0,0.04)', border: 'none', color: COLORS.dark, width: '44px', height: '44px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={20} strokeWidth={3} />
                </motion.button>
              </div>
            </div>

            {/* 💬 CHAT STREAM */}
            <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#FDFDFD' }}>
              <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

              {messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    style={{ width: '80px', height: '80px', borderRadius: '28px', background: `${COLORS.primary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: `1px solid ${COLORS.primary}20` }}
                  >
                    <Sparkles size={36} color={COLORS.primary} />
                  </motion.div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: COLORS.dark, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Tactical Assistant</h2>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: COLORS.subtext, margin: '0 0 32px', lineHeight: 1.6, padding: '0 20px' }}>
                    Accessing {farmInfo?.name || 'AgriSense'} data matrix. How can I optimize your operations today?
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { icon: Activity, l: "System Health", q: "Analyze entire system health" },
                      { icon: Zap, l: "Optimization", q: "Strategic yield improvement plan" },
                      { icon: History, l: "Data Trends", q: "Show me recent sensor anomalies" },
                      { icon: Settings, l: "Actuators", q: "Quick actuator status check" }
                    ].map(s => (
                      <motion.button 
                        key={s.l} 
                        whileHover={{ y: -2, background: '#F8FAFC' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSend(s.q)} 
                        style={{ 
                          padding: '14px', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.06)', 
                          background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                          gap: '8px', cursor: 'pointer', transition: '0.2s' 
                        }}
                      >
                        <s.icon size={18} color={COLORS.primary} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: COLORS.dark }}>{s.l}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: msg.role === 'user' ? `linear-gradient(135deg, ${COLORS.primary} 0%, #059669 100%)` : 'white',
                    color: msg.role === 'user' ? 'white' : COLORS.dark,
                    padding: '18px 22px',
                    borderRadius: msg.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                    boxShadow: msg.role === 'user' ? `0 10px 30px ${COLORS.primary}30` : '0 10px 40px rgba(0,0,0,0.06)',
                    border: msg.role === 'user' ? 'none' : '1px solid rgba(0,0,0,0.04)',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    lineHeight: 1.6,
                    position: 'relative'
                  }}
                >
                  <ReactMarkdown 
                    components={{
                      h3: ({node, ...props}) => <h3 style={{ fontSize: '1rem', fontWeight: 950, margin: '14px 0 8px', color: COLORS.primary }} {...props} />,
                      p: ({node, ...props}) => <p style={{ margin: '0 0 10px' }} {...props} />,
                      li: ({node, ...props}) => <li style={{ marginBottom: '6px' }} {...props} />,
                      strong: ({node, ...props}) => <strong style={{ fontWeight: 900, color: msg.role === 'user' ? 'white' : COLORS.primary }} {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                  <div style={{ fontSize: '0.55rem', opacity: 0.4, marginTop: '12px', textAlign: msg.role === 'user' ? 'right' : 'left', fontWeight: 900, letterSpacing: '0.05em' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ alignSelf: 'flex-start', background: 'white', padding: '14px 24px', borderRadius: '20px', display: 'flex', gap: '6px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.03)' }}
                >
                  {[0,1,2].map(i => <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i*0.2 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS.primary }} />)}
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* ⌨️ INDUSTRIAL INPUT CONSOLE */}
            <div style={{ padding: '24px 28px', background: 'white', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Query system intelligence..."
                  style={{ 
                    width: '100%', 
                    border: '1.5px solid #E2E8F0', 
                    background: '#F8FAFC', 
                    borderRadius: '16px', 
                    padding: '16px 20px', 
                    fontSize: '0.95rem', 
                    outline: 'none', 
                    fontWeight: 700,
                    color: COLORS.dark,
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.primary;
                    e.target.style.background = 'white';
                    e.target.style.boxShadow = `0 0 0 4px ${COLORS.primary}10`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.background = '#F8FAFC';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05, background: COLORS.dark }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend()}
                style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '18px', 
                  background: COLORS.primary, 
                  color: 'white', 
                  border: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  boxShadow: `0 10px 20px ${COLORS.primary}30`
                }}
              >
                <Send size={22} strokeWidth={2.5} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AgriBot;

