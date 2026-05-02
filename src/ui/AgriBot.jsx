import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Bot, 
  Mic, Activity, Droplets, Bug, Info, Leaf,
  Paperclip, Smile, Camera, MoreVertical, Phone, Video, CheckCheck
} from 'lucide-react';
import { useApp } from '../state/AppContext';
import { askGemini } from '../api/aiService';
import { getAgronomyKnowledge } from '../api/knowledgeService';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const AgriBot = () => {
  const location = useLocation();
  const { sensorData, apiWeather, systemHealth, recommendations, farmInfo, sensorHistory } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState(null);
  const chatEndRef = useRef(null);

  // Load Knowledge Base on mount
  useEffect(() => {
    getAgronomyKnowledge().then(data => setKnowledgeBase(data));
  }, []);

  // Persistence logic: Keep mounted but hide when not on dashboard
  const isDashboard = location.pathname === '/dashboard';

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const context = {
      farmName: farmInfo?.name,
      currentSensors: sensorData,
      weather: apiWeather,
      systemHealth: systemHealth,
      aiRecommendations: recommendations,
      recentHistory: sensorHistory?.slice(-10),
      knowledgeBase: knowledgeBase,
      time: new Date().toLocaleString()
    };

    try {
      const response = await askGemini(text, context);
      const aiMessage = { role: 'ai', content: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { 
        role: 'ai', 
        content: "I'm having trouble connecting to my brain right now. Please check your API key! 🔌", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* 🤖 FLOATING ACTION BUTTON (WA STYLE) */}
      <AnimatePresence>
        {isDashboard && !isOpen && (
          <motion.button
            key="bot-fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              boxShadow: isOpen ? "0 0 0px rgba(37, 211, 102, 0)" : ["0 0 0px rgba(37, 211, 102, 0)", "0 0 20px rgba(37, 211, 102, 0.4)", "0 0 0px rgba(37, 211, 102, 0)"]
            }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ 
              boxShadow: { repeat: Infinity, duration: 2 }
            }}
            onClick={() => setIsOpen(!isOpen)}
            style={{
              position: 'fixed',
              bottom: '85px',
              right: '20px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#25D366',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >
            <Bot size={32} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ❌ CLOSE BUTTON (When Open) */}
      {isOpen && (
        <motion.button
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed', bottom: '85px', right: '20px', width: '60px', height: '60px',
            borderRadius: '50%', background: '#EF4444', color: 'white', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
            cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}
        >
          <X size={28} />
        </motion.button>
      )}

      {/* 💬 CHAT PANEL (REALISTIC WA UI) */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                zIndex: 1998
              }}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                bottom: window.innerWidth > 768 ? '100px' : 0,
                right: window.innerWidth > 768 ? '20px' : 0,
                left: window.innerWidth > 768 ? 'auto' : 0,
                width: window.innerWidth > 768 ? '400px' : '100%',
                height: window.innerWidth > 768 ? 'calc(80vh - 100px)' : '80vh',
                background: '#E5DDD5', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                zIndex: 1999,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: window.innerWidth > 768 ? '24px' : '32px 32px 0 0',
                overflow: 'hidden'
              }}
            >
              {/* ✨ HEADER (REALISTIC) */}
              <div style={{
                padding: '12px 16px',
                background: '#075E54', 
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '36px', height: '36px', borderRadius: '50%', background: '#fff', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                  }}>
                    <Bot size={22} color="#075E54" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>AgriBot Intelligence</h2>
                    <p style={{ fontSize: '0.65rem', opacity: 0.8, margin: 0 }}>online</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <Video size={20} />
                  <Phone size={18} />
                  <MoreVertical size={20} />
                </div>
              </div>

              {/* 💬 CHAT AREA (Patterned) */}
              <div 
                className="no-scrollbar"
                style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                  backgroundSize: '400px',
                  backgroundRepeat: 'repeat',
                  backgroundBlendMode: 'overlay',
                  backgroundColor: '#E5DDD5',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                <style>{`
                  .no-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {/* Date Bubble */}
                <div style={{ alignSelf: 'center', margin: '10px 0' }}>
                  <div style={{ background: '#d1e4ef', padding: '5px 12px', borderRadius: '8px', fontSize: '0.65rem', color: '#54656f', fontWeight: 600, textTransform: 'uppercase', boxShadow: '0 1px 0.5px rgba(0,0,0,0.1)' }}>
                    Today
                  </div>
                </div>

                {messages.length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', alignItems: 'center' }}>
                    <div style={{ 
                      background: '#FFF9C4', padding: '8px 16px', 
                      borderRadius: '8px', fontSize: '0.7rem', color: '#546E7A', 
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '90%' 
                    }}>
                      🔒 Messages are processed with Industrial Agri-Sense encryption.
                    </div>
                    
                    <div style={{ marginTop: '20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#667781', textAlign: 'center', textTransform: 'uppercase' }}>Suggested Diagnostics</p>
                      {[
                        { label: "🚜 Check Soil Health", query: "Give me a quick status summary of all my farm nodes." },
                        { label: "💧 Irrigation Status", query: "Check irrigation status and soil moisture." },
                        { label: "🐛 Pest Risk Analysis", query: "Are there any pest risks for my crops?" },
                        { label: "🧪 Fertilizer Advice", query: "What fertilizer should I use for my current crops?" }
                      ].map((action, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSend(action.query)}
                          style={{
                            background: 'white',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            border: '1px solid #e9edef',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#075E54',
                            textAlign: 'left',
                            boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
                            cursor: 'pointer'
                          }}
                        >
                          {action.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      position: 'relative',
                      marginBottom: '4px'
                    }}
                  >
                    <div style={{
                      padding: '8px 12px 18px',
                      borderRadius: '8px',
                      background: msg.role === 'user' ? '#DCF8C6' : 'white',
                      color: '#111b21',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                      textAlign: 'left',
                      minWidth: '60px',
                      position: 'relative'
                    }}>
                      {/* Tail */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        [msg.role === 'user' ? 'right' : 'left']: '-6px',
                        width: '12px',
                        height: '12px',
                        background: msg.role === 'user' ? '#DCF8C6' : 'white',
                        clipPath: msg.role === 'user' ? 'polygon(0 0, 100% 0, 0 100%)' : 'polygon(0 0, 100% 0, 100% 100%)',
                        zIndex: -1
                      }} />

                      <div className="prose prose-slate max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({node, ...props}) => <p style={{ margin: '0 0 6px 0' }} {...props} />,
                            h3: ({node, ...props}) => <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '10px 0 4px 0', color: '#075E54' }} {...props} />,
                            ul: ({node, ...props}) => <ul style={{ paddingLeft: '1.1rem', margin: '6px 0' }} {...props} />,
                            li: ({node, ...props}) => <li style={{ marginBottom: '3px' }} {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      
                      <div style={{ 
                        position: 'absolute', bottom: '3px', right: '7px', 
                        fontSize: '0.62rem', color: '#667781',
                        display: 'flex', alignItems: 'center', gap: '3px'
                      }}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        {msg.role === 'user' && <CheckCheck size={14} color="#53bdeb" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <div style={{ alignSelf: 'flex-start', background: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', color: '#667781', boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)', fontStyle: 'italic' }}>
                    typing...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* 🖱️ QUICK ACTIONS BAR */}
              <div style={{
                padding: '6px 12px',
                background: '#f0f2f5',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                borderTop: '1px solid #e9edef'
              }}>
                {[
                  { icon: <Activity size={14}/>, label: "Status", query: "Farm summary" },
                  { icon: <Droplets size={14}/>, label: "Water", query: "Irrigation check" },
                  { icon: <Bug size={14}/>, label: "Pests", query: "Pest risks" },
                  { icon: <Info size={14}/>, label: "Soil", query: "Nutrient report" }
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(action.query)}
                    style={{
                      padding: '5px 14px',
                      background: 'white',
                      borderRadius: '100px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: '#008069',
                      border: '1px solid #e9edef',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 1px 1px rgba(0,0,0,0.05)'
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* ⌨️ INPUT SECTION (REALISTIC WA) */}
              <div style={{
                padding: '8px 12px',
                background: '#f0f2f5',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <div style={{
                  flex: 1,
                  background: 'white',
                  borderRadius: '24px',
                  padding: '5px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Smile size={24} color="#54656f" style={{ cursor: 'pointer' }} />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message"
                    style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px 0', fontSize: '0.95rem', outline: 'none', color: '#111b21' }}
                  />
                  <Paperclip size={22} color="#54656f" style={{ transform: 'rotate(45deg)', cursor: 'pointer' }} />
                  <Camera size={22} color="#54656f" style={{ cursor: 'pointer' }} />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    background: '#00a884',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    cursor: 'pointer'
                  }}
                >
                  {input.trim() ? <Send size={20} /> : <Mic size={20} />}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AgriBot;
