/**
 * AgriSense v2.8.0 Master Context Provider
 * Centralized state management for the entire agricultural monitoring ecosystem.
 */

// ─── IMPORTS ────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import mqttService from '../services/mqttService';
import { MASTER_CONFIG } from '../config';
import { 
  INITIAL_SENSOR_DATA, 
  INITIAL_API_WEATHER, 
  INITIAL_SYSTEM_HEALTH 
} from '../models/sensorModel';
import { 
  getAIv2Recommendations, 
  calculateNodeHealth, 
  ACTUATORS 
} from '../utils/healthEngine';
import { processMqttMessage } from '../controllers/sensorController';

// ─── CONTEXT INITIALIZATION ─────────────────────────────────────────────────
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ─── STATE DEFINITIONS ────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agrisense_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Auth Persistence Failure:", e);
      return null;
    }
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sensorData, setSensorData] = useState(INITIAL_SENSOR_DATA);
  const [apiWeather, setApiWeather] = useState(INITIAL_API_WEATHER);
  const [apiForecast, setApiForecast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [mqttStatus, setMqttStatus] = useState('disconnected');
  const [farmHealthScore, setFarmHealthScore] = useState(null);
  const [systemHealth, setSystemHealth] = useState(INITIAL_SYSTEM_HEALTH);
  const [connectivityStatus, setConnectivityStatus] = useState('Online');
  const [cloudSyncStatus, setCloudSyncStatus] = useState('Active');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [lastGlobalUpdate, setLastGlobalUpdate] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [actuators, setActuators] = useState({
    [ACTUATORS.PUMP]: false,
    [ACTUATORS.VALVE]: false,
    [ACTUATORS.SPRAYER]: false,
    [ACTUATORS.BUZZER]: false,
  });

  const [farmInfo, setFarmInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('agrisense_branding');
      const data = saved ? JSON.parse(saved) : {
        name: MASTER_CONFIG.FARM_NAME,
        projectName: MASTER_CONFIG.PROJECT_NAME,
        tagline: MASTER_CONFIG.TAGLINE,
      };
      data.version = MASTER_CONFIG.VERSION; 
      return data;
    } catch (e) {
      return {
        name: MASTER_CONFIG.FARM_NAME,
        projectName: MASTER_CONFIG.PROJECT_NAME,
        tagline: MASTER_CONFIG.TAGLINE,
        version: MASTER_CONFIG.VERSION 
      };
    }
  });

  const [profileMeta, setProfileMeta] = useState({
    role: 'Master Controller',
    accessLevel: 'Level 5 (Admin)',
    nodesManaged: 12,
    lastLogin: 'Today',
    commandsIssued: 1240,
    alertsResolved: 85,
    notifications: { push: true, email: false },
    aiSensitivity: 'Balanced'
  });

  // ─── REFS ────────────────────────────────────────────────────────────────
  const lastSensorUpdate = useRef(null);

  // ─── HELPER FUNCTIONS ────────────────────────────────────────────────────
  const updateBranding = (newInfo) => {
    const updated = { ...farmInfo, ...newInfo };
    setFarmInfo(updated);
    localStorage.setItem('agrisense_branding', JSON.stringify(updated));
  };

  const updateProfileMeta = (newData) => setProfileMeta(prev => ({ ...prev, ...newData }));

  const login = (id, pass) => {
    const matchedUser = MASTER_CONFIG.AUTHORIZED_USERS.find(
      u => u.email.toLowerCase() === id?.trim().toLowerCase() && u.password === pass?.trim()
    );
    if (matchedUser || id === 'guest') {
      const userData = matchedUser || { email: 'guest', name: 'Guest Farmer' };
      setUser(userData);
      localStorage.setItem('agrisense_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => { 
    setUser(null); 
    localStorage.removeItem('agrisense_user'); 
  };

  const toggleActuator = (key) => {
    const newState = !actuators[key];
    setActuators(prev => ({ ...prev, [key]: newState }));
    if (!MASTER_CONFIG.USE_MOCK_DATA) {
      const commands = MASTER_CONFIG.ACTUATOR_COMMANDS[key];
      if (commands) {
        mqttService.publishCommand({ 
          action: newState ? commands.ON : commands.OFF, 
          actuator: key.toLowerCase().replace(' ', '_'), 
          status: newState ? "ON" : "OFF" 
        });
      }
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // ─── CORE BUSINESS LOGIC ──────────────────────────────────────────────────

  // 1. Health Scoring Engine
  useEffect(() => {
    if (sensorData) {
      const sIdx = calculateNodeHealth('soil', sensorData.soil);
      const wIdx = calculateNodeHealth('weather', sensorData.weather);
      const stIdx = calculateNodeHealth('storage', sensorData.storage);
      const iIdx = calculateNodeHealth('irrigation', sensorData.water);

      setSystemHealth({ soil: sIdx, weather: wIdx, storage: stIdx, water: iIdx });

      if (sIdx === null && wIdx === null && stIdx === null && iIdx === null) {
        setFarmHealthScore(null);
      } else {
        const scores = [sIdx, wIdx, stIdx, iIdx].filter(s => s !== null);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        setFarmHealthScore(Math.round(avg));
      }
    }
  }, [sensorData]);

  // 2. AI Recommendation Engine
  useEffect(() => {
    if (sensorData?.soil?.moisture !== null) {
      const recs = getAIv2Recommendations(sensorData);
      setRecommendations(recs);
    }
  }, [sensorData.soil.moisture, sensorData.soil.ph, sensorData.soil.temp, sensorData.soil.npk]);

  // 3. Sensor History Logger
  useEffect(() => {
    if (sensorData && (sensorData.soil || sensorData.weather)) {
      setSensorHistory(prev => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const lastEntry = prev[prev.length - 1];
        if (lastEntry?.time === time) return prev; 
        return [...prev, { ...sensorData, time }].slice(-50);
      });
    }
  }, [sensorData]);

  // 4. Market Data Engine
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await fetch('https://raw.githubusercontent.com/datasets/agriculture-prices/master/data/agriculture-prices.csv');
        const text = await res.text();
        const lines = text.split('\n').slice(1, 6);
        const commodities = lines.map(line => {
          const parts = line.split(',');
          return { name: parts[0], price: `₹${Math.round(parts[1] * 80)}`, trend: parts[2] > 0 ? 'up' : 'down' };
        }).filter(c => c.name);

        setSensorData(prev => ({
          ...prev,
          market: { price: commodities[0]?.price || '--', trend: commodities[0]?.trend || 'stable', commodities }
        }));
      } catch (e) {
        setSensorData(prev => ({ ...prev, market: { price: '--', trend: 'stable', commodities: [] } }));
      }
    };
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 3600000);
    return () => clearInterval(interval);
  }, []);

  // 5. MQTT Real-Time Linkage
  useEffect(() => {
    const bootTimer = setTimeout(() => {
      if (!MASTER_CONFIG.USE_MOCK_DATA) {
        mqttService.connect(
          (topic, data) => {
            if (!data) return;
            lastSensorUpdate.current = Date.now();
            setSensorData(prev => processMqttMessage(topic, data, prev));
            setIsDataLoading(false);
            setLastGlobalUpdate(new Date().toLocaleTimeString());
          },
          (status) => setMqttStatus(status)
        );
        return () => mqttService.disconnect();
      } else {
        setIsDataLoading(false);
      }
    }, 1000);
    return () => clearTimeout(bootTimer);
  }, [MASTER_CONFIG.USE_MOCK_DATA]);

  // 6. Offline Detection Pulse
  useEffect(() => {
    if (MASTER_CONFIG.USE_MOCK_DATA) return;
    const pulse = setInterval(() => {
      const now = Date.now();
      const lastUpdate = lastSensorUpdate.current || now;
      if (now - lastUpdate > 180000) {
        setSensorData(INITIAL_SENSOR_DATA);
      }
    }, 5000);
    return () => clearInterval(pulse);
  }, [MASTER_CONFIG.USE_MOCK_DATA]);

  // 7. Global Weather Sync
  useEffect(() => {
    if (!MASTER_CONFIG.OPENWEATHER_API_KEY || MASTER_CONFIG.OPENWEATHER_API_KEY.includes("YOUR_")) return;
    const fetchWeather = async () => {
      try {
        const { MAP_LAT, MAP_LNG, OPENWEATHER_API_KEY, WEATHER_CITY } = MASTER_CONFIG;
        
        // 1. Current Weather
        const wUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${MAP_LAT}&lon=${MAP_LNG}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        const wRes = await fetch(wUrl);
        const wData = await wRes.json();
        
        if (wData.main) {
          setApiWeather({
            temp: Math.round(wData.main.temp),
            humidity: wData.main.humidity,
            pressure: wData.main.pressure,
            windSpeed: wData.wind?.speed,
            condition: wData.weather?.[0]?.main || 'Clear',
            description: wData.weather?.[0]?.description || 'Clear sky',
            city: wData.name || WEATHER_CITY,
            feelsLike: Math.round(wData.main.feels_like),
            clouds: wData.clouds?.all,
            sunrise: wData.sys?.sunrise ? new Date(wData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
            sunset: wData.sys?.sunset ? new Date(wData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
            uv: 'Low',
            aqi: 1
          });
        }

        // 2. 5-Day Forecast
        const fUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${MAP_LAT}&lon=${MAP_LNG}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        const fRes = await fetch(fUrl);
        const fData = await fRes.json();
        
        if (fData.list) {
          const daily = fData.list.filter((_, i) => i % 8 === 0).slice(0, 5).map(day => {
            const prob = day.pop || (day.weather?.[0]?.main.includes('Rain') ? 0.4 : 0);
            return {
              date: new Date(day.dt * 1000).toLocaleDateString([], { weekday: 'short' }),
              temp: Math.round(day.main.temp),
              condition: day.weather?.[0]?.main || 'Clear',
              rainProb: `${Math.round(prob * 100)}%`,
              fullDate: new Date(day.dt * 1000).toLocaleDateString()
            };
          });
          setApiForecast(daily);
        }

        // 3. Air Pollution (AQI)
        const aUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${MAP_LAT}&lon=${MAP_LNG}&appid=${OPENWEATHER_API_KEY}`;
        const aRes = await fetch(aUrl);
        const aData = await aRes.json();
        if (aData.list?.[0]) {
          const aqiLevel = aData.list[0].main.aqi; // 1-5
          const aqiLabels = { 1: 'Good', 2: 'Fair', 3: 'Mod', 4: 'Poor', 5: 'Risk' };
          setApiWeather(prev => ({ ...prev, aqi: aqiLabels[aqiLevel] || 'Fair' }));
        }

      } catch (e) {
        console.error("Weather API Failure:", e);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  // ─── EXPORT RENDER ───────────────────────────────────────────────────────
  return (
    <AppContext.Provider value={{
      user, login, logout, farmInfo, updateBranding,
      isDarkMode, toggleTheme, sensorData, apiWeather, apiForecast, recommendations, sensorHistory,
      actuators, toggleActuator, isSidebarOpen, setIsSidebarOpen, ACTUATORS,
      farmHealthScore, systemHealth, connectivityStatus, cloudSyncStatus, profileMeta, updateProfileMeta,
      isDataLoading, lastGlobalUpdate, mqttStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
