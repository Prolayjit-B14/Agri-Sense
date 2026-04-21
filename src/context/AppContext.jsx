import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { generateMockSensorData, getAIv2Recommendations, ACTUATORS } from '../services/mockData';
import mqttService from '../services/mqttService';
import { MASTER_CONFIG } from '../config';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
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
  
  // 💎 100% REAL-TIME PRODUCTION STATE (Zero-Initialization)
  const [sensorData, setSensorData] = useState({
    soil: { moisture: null, ph: null, temp: null, humidity: null, npk: { n: null, p: null, k: null }, healthIndex: null },
    storage: { temp: null, humidity: null, ethylene: null, mq135: null, freshnessScore: null },
    weather: { temp: null, humidity: null, pressure: null, windSpeed: null, isRaining: false, lightIntensity: null, rainLevel: null },
    water: { level: null, tankLevel: null, flowRate: null, totalUsage: null },
    solar: { lightIntensity: null, exposureDuration: null, power: null, voltage: null, current: null },
    market: { price: null, trend: 'stable', commodities: [] }
  });

  const [apiWeather, setApiWeather] = useState({
    temp: null, humidity: null, pressure: null, windSpeed: null, 
    sunrise: null, sunset: null, condition: 'Detecting...', city: 'Detecting...'
  });

  const [apiForecast, setApiForecast] = useState([]); // 💎 5-Day Forecast Storage


  const [recommendations, setRecommendations] = useState([]);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [actuators, setActuators] = useState({
    [ACTUATORS.PUMP]: false,
    [ACTUATORS.RELAY]: false,
    [ACTUATORS.VALVE]: false,
    [ACTUATORS.SPRAYER]: false,
    [ACTUATORS.BUZZER]: false,
  });
  
  const [mqttStatus, setMqttStatus] = useState('disconnected');
  const lastSensorUpdate = useRef(Date.now());

  const [farmInfo, setFarmInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('agrisense_branding');
      const data = saved ? JSON.parse(saved) : {
        name: MASTER_CONFIG.FARM_NAME,
        projectName: MASTER_CONFIG.PROJECT_NAME,
        tagline: MASTER_CONFIG.TAGLINE,
      };
      // 🛡️ Force latest version from config to override cached version
      data.version = MASTER_CONFIG.VERSION; 
      return data;
    } catch (e) {
      console.error("Branding Persistence Failure:", e);
      return {
        name: MASTER_CONFIG.FARM_NAME,
        projectName: MASTER_CONFIG.PROJECT_NAME,
        tagline: MASTER_CONFIG.TAGLINE,
        version: MASTER_CONFIG.VERSION 
      };
    }
  });

  const updateBranding = (newInfo) => {
    const updated = { ...farmInfo, ...newInfo };
    setFarmInfo(updated);
    localStorage.setItem('agrisense_branding', JSON.stringify(updated));
  };

  // 📡 Global State
  // The user, isSidebarOpen, sensorData, sensorHistory, apiWeather, recommendations, farmInfo states are already declared above.
  // Adding new states as per instruction.
  const [farmHealthScore, setFarmHealthScore] = useState(null); // Data-driven only
  const [connectivityStatus, setConnectivityStatus] = useState('Online');
  const [cloudSyncStatus, setCloudSyncStatus] = useState('Active');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [lastGlobalUpdate, setLastGlobalUpdate] = useState(null);
  
  // 👔 SYSTEM PROFILE METADATA
  const [profileMeta, setProfileMeta] = useState({
    role: 'Master Controller',
    accessLevel: 'Level 5 (Admin)',
    nodesManaged: 12,
    lastLogin: 'Today, 10:45 AM',
    commandsIssued: 1240,
    alertsResolved: 85,
    notifications: { push: true, email: false },
    aiSensitivity: 'Balanced' // Low, Balanced, High
  });

  const updateProfileMeta = (newData) => setProfileMeta(prev => ({ ...prev, ...newData }));

  // 🧪 Calculate Diagnostic Indices
  const calculateSoilIndex = (soil) => {
    if (!soil || soil.moisture === null || soil.moisture === undefined) return null;
    
    // 🧪 SCIENTIFIC SCORING
    const mScore = (soil.moisture >= 35 && soil.moisture <= 65) ? 40 : 15;
    const phScore = (soil.ph >= 6.0 && soil.ph <= 7.5) ? 25 : 10;
    
    // NPK Balance (Individual Detection)
    const n = parseFloat(soil.npk?.n || 0);
    const p = parseFloat(soil.npk?.p || 0);
    const k = parseFloat(soil.npk?.k || 0);
    const npkScore = (n > 40 && p > 30 && k > 40) ? 35 : 15;
    
    return Math.round(mScore + phScore + npkScore);
  };

  const calculateHealthScore = (data) => {
    if (!data || !data.soil || data.soil.moisture === null) return null;
    
    // ⚖️ Weights: Soil (50%), Water (20%), Storage (15%), Weather (15%)
    const sIdx = calculateSoilIndex(data.soil) || 0;
    const wIdx = data.water.level !== null ? (data.water.level > 25 ? 100 : 40) : 50;
    const stIdx = data.storage.mq135 !== null ? (data.storage.mq135 < 50 ? 100 : 40) : 100;
    const weIdx = data.weather.temp !== null ? (data.weather.temp < 38 ? 100 : 30) : 100;
    
    const score = (sIdx * 0.5) + (wIdx * 0.2) + (stIdx * 0.15) + (weIdx * 0.15);
    return Math.round(score);
  };

  // AI Recommendation Engine Observer (Recommendations Only)
  useEffect(() => {
    if (sensorData && sensorData.soil && sensorData.soil.moisture !== null) {
      const recs = getAIv2Recommendations(sensorData);
      setRecommendations(recs);
    }
  }, [sensorData.soil.moisture, sensorData.soil.ph, sensorData.soil.temp, sensorData.soil.npk]);

  // 📈 HISTORY ENGINE: Watches sensorData and batches into history
  useEffect(() => {
    if (sensorData && (sensorData.soil || sensorData.weather)) {
      setSensorHistory(prev => {
        // Use seconds in time for real-time responsiveness
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const lastEntry = prev[prev.length - 1];
        
        // Prevent duplicate entries for the exact same second
        if (lastEntry?.time === time) return prev; 
        
        // Add new point and keep last 50 for a detailed trend
        return [...prev, { ...sensorData, time }].slice(-50);
      });
    }
  }, [sensorData]);

  // 💹 REAL-TIME MARKET API ENGINE
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Using a reliable public CSV/JSON mirror for Ag Prices
        const res = await fetch('https://raw.githubusercontent.com/datasets/agriculture-prices/master/data/agriculture-prices.csv');
        const text = await res.text();
        const lines = text.split('\n').slice(1, 6); // Get first 5 rows
        const commodities = lines.map(line => {
          const parts = line.split(',');
          return { name: parts[0], price: `₹${Math.round(parts[1] * 80)}`, trend: parts[2] > 0 ? 'up' : 'down' };
        }).filter(c => c.name);

        setSensorData(prev => ({
          ...prev,
          market: { 
            price: commodities[0]?.price || '--', 
            trend: commodities[0]?.trend || 'stable',
            commodities 
          }
        }));
      } catch (e) {
        console.warn("Market API Fetch Failure (Using fallback '--'):", e);
        setSensorData(prev => ({ ...prev, market: { price: '--', trend: 'stable', commodities: [] } }));
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 3600000); // 1h refresh
    return () => clearInterval(interval);
  }, []);

  // Data Synthesis Loop
  useEffect(() => {
    const bootTimer = setTimeout(() => {
      if (MASTER_CONFIG.USE_MOCK_DATA) {
        const interval = setInterval(() => {
          const newData = generateMockSensorData();
          // Ensure mock data doesn't override real market fetch unless intended
          setSensorData(prev => ({ 
            ...newData, 
            market: prev.market // Preserve real market data if already fetched
          }));
          setFarmHealthScore(calculateHealthScore(newData)); 
          setIsDataLoading(false);
          setLastGlobalUpdate(new Date().toLocaleTimeString());
        }, 1500);
        return () => clearInterval(interval);
      } else {
        // 📡 PRODUCTION REAL-TIME MODE
        mqttService.connect(
          (topic, data) => {
            if (!data) return;
            
            // Mark Heartbeat
            lastSensorUpdate.current = Date.now();
            
            const cleanValue = (val) => (val === null || isNaN(val) || val === undefined) ? null : Number(val);

            setSensorData(prev => {
              const newSoil = {
                ...prev.soil,
                ...(data.soil || {}),
                moisture: cleanValue(data.soil?.moisture ?? prev.soil?.moisture),
                temp: cleanValue(data.soil?.temp ?? prev.soil?.temp),
                ph: cleanValue(data.soil?.ph ?? prev.soil?.ph),
                npk: {
                  n: cleanValue(data.soil?.npk?.n ?? prev.soil?.npk?.n),
                  p: cleanValue(data.soil?.npk?.p ?? prev.soil?.npk?.p),
                  k: cleanValue(data.soil?.npk?.k ?? prev.soil?.npk?.k)
                }
              };
              
              newSoil.healthIndex = calculateSoilIndex(newSoil);

              const updatedData = {
                ...prev,
                soil: newSoil,
                weather: { 
                  ...prev.weather, 
                  ...(data.weather || {}),
                  temp: cleanValue(data.weather?.temp ?? prev.weather?.temp),
                  humidity: cleanValue(data.weather?.humidity ?? prev.weather?.humidity),
                  lightIntensity: cleanValue(data.weather?.lightIntensity ?? prev.weather?.lightIntensity),
                  isRaining: data.weather?.isRaining ?? prev.weather?.isRaining,
                  rainLevel: cleanValue(data.weather?.rainLevel ?? prev.weather?.rainLevel)
                },
                water: { 
                  ...prev.water, 
                  ...(data.water || {}),
                  level: cleanValue(data.water?.level ?? prev.water?.level),
                  tankLevel: cleanValue(data.water?.tankLevel ?? prev.water?.tankLevel),
                  flowRate: cleanValue(data.water?.flowRate ?? prev.water?.flowRate),
                  totalUsage: cleanValue(data.water?.totalUsage ?? prev.water?.totalUsage)
                },
                storage: { 
                  ...prev.storage, 
                  ...(data.storage || {}),
                  temp: cleanValue(data.storage?.temp ?? prev.storage?.temp),
                  humidity: cleanValue(data.storage?.humidity ?? prev.storage?.humidity),
                  mq135: cleanValue(data.storage?.mq135 ?? prev.storage?.mq135),
                  freshnessScore: data.storage?.mq135 ? (data.storage.mq135 < 3 ? 98 : 75) : (prev.storage?.freshnessScore || 100)
                },
                solar: {
                  ...prev.solar, 
                  ...(data.solar || {}),
                  power: cleanValue(data.solar?.power ?? prev.solar?.power),
                  voltage: cleanValue(data.solar?.voltage ?? prev.solar?.voltage),
                  current: cleanValue(data.solar?.current ?? prev.solar?.current)
                }
              };

              setFarmHealthScore(calculateHealthScore(updatedData));
              return updatedData;
            });
            setIsDataLoading(false);
            setLastGlobalUpdate(new Date().toLocaleTimeString());
          },
          (status) => setMqttStatus(status)
        );
        return () => mqttService.disconnect();
      }
    }, 1000);
    return () => clearTimeout(bootTimer);
  }, [MASTER_CONFIG.USE_MOCK_DATA]);

  // 🛡️ HEARTBEAT / STALENESS MONITOR (30s)
  useEffect(() => {
    if (MASTER_CONFIG.USE_MOCK_DATA) return;
    
    const pulse = setInterval(() => {
      const now = Date.now();
      const diff = now - lastSensorUpdate.current;
      
      if (diff > 30000) { // 30 seconds of silence
        console.warn(`MQTT: Hardware Silence Detected (${Math.round(diff/1000)}s). Triggering Offline UI.`);
        // Systematically Nullify Critical Sensors to trigger "Offline" UI components
        setSensorData(prev => ({
          ...prev,
          soil: { ...prev.soil, moisture: null, temp: null, ph: null, healthIndex: null, npk: { n: null, p: null, k: null } },
          weather: { ...prev.weather, temp: null, humidity: null, lightIntensity: null, isRaining: false, rainLevel: null },
          water: { ...prev.water, level: null, tankLevel: null, flowRate: null },
          storage: { ...prev.storage, temp: null, humidity: null, mq135: null, freshnessScore: null },
          solar: { ...prev.solar, power: null, voltage: null, current: null }
        }));
      }
    }, 5000); // Check every 5s
    
    return () => clearInterval(pulse);
  }, [MASTER_CONFIG.USE_MOCK_DATA]);

  // ☁️ GLOBAL WEATHER API ENGINE (Atmospheric Conditions)
  useEffect(() => {
    if (MASTER_CONFIG.OPENWEATHER_API_KEY) {
      const fetchWeather = async () => {
        try {
          const wUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${MASTER_CONFIG.MAP_LAT}&lon=${MASTER_CONFIG.MAP_LNG}&units=metric&appid=${MASTER_CONFIG.OPENWEATHER_API_KEY}`;
          const aUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${MASTER_CONFIG.MAP_LAT}&lon=${MASTER_CONFIG.MAP_LNG}&appid=${MASTER_CONFIG.OPENWEATHER_API_KEY}`;
          const fUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${MASTER_CONFIG.MAP_LAT}&lon=${MASTER_CONFIG.MAP_LNG}&units=metric&appid=${MASTER_CONFIG.OPENWEATHER_API_KEY}`;
          
          const [wRes, aRes, fRes] = await Promise.all([fetch(wUrl), fetch(aUrl), fetch(fUrl)]);
          const [wData, aData, fData] = await Promise.all([wRes.json(), aRes.json(), fRes.json()]);
          
          // 1. Current Weather
          if (wData.main) {
            setApiWeather({
              temp: Math.round(wData.main.temp),
              humidity: wData.main.humidity,
              pressure: wData.main.pressure,
              windSpeed: wData.wind?.speed,
              windDeg: wData.wind?.deg,
              windGust: wData.wind?.gust,
              condition: wData.weather?.[0]?.main,
              description: wData.weather?.[0]?.description,
              city: wData.name,
              feelsLike: Math.round(wData.main.feels_like),
              tempMin: Math.round(wData.main.temp_min),
              tempMax: Math.round(wData.main.temp_max),
              visibility: (wData.visibility / 1000).toFixed(1),
              clouds: wData.clouds?.all,
              seaLevel: wData.main?.sea_level,
              grndLevel: wData.main?.grnd_level,
              apiRain: wData.rain?.['1h'] || 0,
              aqi: aData.list?.[0]?.main?.aqi || null,
              pollutants: aData.list?.[0]?.components || {},
              sunrise: wData.sys?.sunrise ? new Date(wData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
              sunset: wData.sys?.sunset ? new Date(wData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'
            });
          }

          // 2. 5-Day Forecast Processing (Filter for 12:00 PM each day)
          if (fData.list) {
            const dailyForecast = fData.list.filter(item => item.dt_txt.includes("12:00:00")).map(item => ({
              date: new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short' }),
              temp: Math.round(item.main.temp),
              condition: item.weather[0].main,
              icon: item.weather[0].icon,
              pop: Math.round(item.pop * 100) // Convert 0-1 to 0-100%
            }));
            setApiForecast(dailyForecast);
          }

        } catch (e) {
          console.error("API Weather Retrieval Failure:", e);
        }
      };
      fetchWeather();
      const interval = setInterval(fetchWeather, 600000); // 10m refresh
      return () => clearInterval(interval);
    }
  }, [MASTER_CONFIG.OPENWEATHER_API_KEY]);

  // Login Logic: Multi-User Awareness
  const login = (id, pass) => {
    const cleanId = id?.trim().toLowerCase();
    const cleanPass = pass?.trim();

    if (cleanId === 'guest') {
        const userData = { email: 'guest', name: 'Guest Farmer' };
        setUser(userData);
        localStorage.setItem('agrisense_user', JSON.stringify(userData));
        return true;
    }

    const matchedUser = MASTER_CONFIG.AUTHORIZED_USERS.find(
      u => u.email.toLowerCase() === cleanId && u.password === cleanPass
    );

    if (matchedUser) {
      setUser(matchedUser);
      localStorage.setItem('agrisense_user', JSON.stringify(matchedUser));
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
        const commandValue = newState ? commands.ON : commands.OFF;
        mqttService.publishCommand({ 
          action: commandValue,
          actuator: key.toLowerCase().replace(' ', '_'),
          status: newState ? "ON" : "OFF"
        });
      } else {
        // Fallback for unknown actuators
        mqttService.publishCommand({ [key.toLowerCase()]: newState ? "ON" : "OFF" });
      }
    }
  };

  const updateProfile = (data) => setFarmInfo(prev => ({ ...prev, ...data }));
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AppContext.Provider value={{
      user, login, logout, farmInfo, updateProfile, updateBranding,
      isDarkMode, toggleTheme, sensorData, apiWeather, apiForecast, recommendations, sensorHistory,
      actuators, toggleActuator, isSidebarOpen, setIsSidebarOpen, ACTUATORS,
      farmHealthScore, connectivityStatus, cloudSyncStatus, profileMeta, updateProfileMeta,
      isDataLoading, lastGlobalUpdate, mqttStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
