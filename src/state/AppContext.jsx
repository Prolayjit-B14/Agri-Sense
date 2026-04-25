/**
 * Bharat Advisor Pro v17.1.0 Master State Manager
 * Organized Industrial State Engine for AgriSense Ecosystem.
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// API & Infrastructure
import mqttService from '../api/mqttService';
import { processDeviceState, calculateSystemOverview } from '../api/deviceService';
import { MASTER_CONFIG } from '../setup';

// Types & Data Models
import { 
  INITIAL_SENSOR_DATA, 
  INITIAL_API_WEATHER, 
  INITIAL_SYSTEM_HEALTH 
} from '../types/sensorModel';

// Business Logic Engines
import { 
  getAIv2Recommendations,
  calculateNodeHealth, 
  calculateOverallHealth,
  ACTUATORS 
} from '../logic/healthEngine';
import { processMqttMessage } from '../engines/sensorController';

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
  
  const [devices, setDevices] = useState({
    'soil_node': processDeviceState('soil_node', 'soil', null),
    'weather_node': processDeviceState('weather_node', 'weather', null),
    'storage_node': processDeviceState('storage_node', 'storage', null),
    'water_node': processDeviceState('water_node', 'water', null)
  });

  const [systemOverview, setSystemOverview] = useState({
    total_nodes: 4, active_nodes: 0, partial_nodes: 0, offline_nodes: 4,
    overall_status: 'OFFLINE', health_percent: 0, nodes: []
  });

  const [apiWeather, setApiWeather] = useState(INITIAL_API_WEATHER);
  const [apiForecast, setApiForecast] = useState([]);
  const [mqttStatus, setMqttStatus] = useState('disconnected');
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
      data.version = "17.1.0"; 
      return data;
    } catch (e) {
      return {
        name: MASTER_CONFIG.FARM_NAME,
        projectName: MASTER_CONFIG.PROJECT_NAME,
        tagline: MASTER_CONFIG.TAGLINE,
        version: "17.1.0" 
      };
    }
  });

  const [profileMeta, setProfileMeta] = useState({
    role: 'Industrial Controller',
    accessLevel: 'Admin (L5)',
    nodesManaged: 4,
    lastLogin: 'Today',
    commandsIssued: 0,
    alertsResolved: 0,
    notifications: { push: true, email: false },
    aiSensitivity: 'Balanced'
  });

  const lastSensorUpdate = useRef(null);

  const updateBranding = (newInfo) => {
    const updated = { ...farmInfo, ...newInfo };
    setFarmInfo(updated);
    localStorage.setItem('agrisense_branding', JSON.stringify(updated));
  };

  const updateProfileMeta = (newData) => setProfileMeta(prev => ({ ...prev, ...newData }));
  const updateUser = (newUserData) => {
    const updated = { ...user, ...newUserData, isGuest: false };
    setUser(updated);
    localStorage.setItem('agrisense_user', JSON.stringify(updated));
  };

  const login = (id, pass) => {
    const matchedUser = MASTER_CONFIG.AUTHORIZED_USERS.find(
      u => u.email.toLowerCase() === id?.trim().toLowerCase() && u.password === pass?.trim()
    );
    if (matchedUser || id === 'guest') {
      const userData = matchedUser || { email: 'guest@agrisense.io', name: 'Guest Farmer', location: 'Field Zone A', isGuest: true };
      setUser(userData);
      localStorage.setItem('agrisense_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => { 
    const defaultUser = { name: 'Guest Farmer', email: 'guest@agrisense.io', isGuest: true };
    setUser(defaultUser); 
    localStorage.setItem('agrisense_user', JSON.stringify(defaultUser));
  };

  const toggleActuator = (key) => {
    const newState = !actuators[key];
    setActuators(prev => ({ ...prev, [key]: newState }));
    if (!MASTER_CONFIG.USE_MOCK_DATA) {
      const commands = MASTER_CONFIG.ACTUATOR_COMMANDS[key];
      if (commands) mqttService.publishCommand({ action: newState ? commands.ON : commands.OFF, actuator: key.toLowerCase().replace(' ', '_'), status: newState ? "ON" : "OFF" });
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const syncData = () => {
    setConnectivityStatus('Syncing...');
    mqttService.refresh();
    setTimeout(() => setConnectivityStatus('Online'), 2000);
  };

  // 1. Derived Health Logic (Pure Derivation)
  const systemHealth = React.useMemo(() => {
    if (!sensorData) return INITIAL_SYSTEM_HEALTH;
    return {
      soil: calculateNodeHealth('soil', sensorData.soil),
      weather: calculateNodeHealth('weather', sensorData.weather),
      storage: calculateNodeHealth('storage', sensorData.storage),
      water: calculateNodeHealth('irrigation', sensorData.water)
    };
  }, [sensorData]);

  const farmHealthScore = React.useMemo(() => {
    return calculateOverallHealth(systemHealth, devices);
  }, [systemHealth, devices]);

  // 2. AI Recommendation Logic
  const recommendations = React.useMemo(() => {
    if (sensorData?.soil?.moisture === null) return [];
    return getAIv2Recommendations(sensorData);
  }, [sensorData]);


  // 3. Sensor History Logger (Stateful Sync)
  const [sensorHistory, setSensorHistory] = useState([]);
  useEffect(() => {
    if (sensorData && (sensorData.soil || sensorData.weather)) {
      setSensorHistory(prev => {
        const timestamp = Date.now();
        const lastEntry = prev[prev.length - 1];
        if (lastEntry && JSON.stringify(lastEntry.soil) === JSON.stringify(sensorData.soil)) return prev;
        return [...prev, { ...sensorData, timestamp }].slice(-100);
      });
    }
  }, [sensorData]);

  // 4. MQTT Linkage
  useEffect(() => {
    const bootTimer = setTimeout(() => {
      mqttService.connect(
        (topic, data) => {
          if (!data) return;
          console.log("📥 [MQTT] Received:", topic, data);
          
          lastSensorUpdate.current = Date.now();
          setSensorData(prev => {
            const updated = processMqttMessage(topic, data, prev);
            
            // 🛰️ DEVICE STATUS SYNC (Unified Node Wake-Up)
            setDevices(prevDevs => {
              const parts = topic.split('/');
              const topicType = parts[parts.length - 1];
              const nextDevs = { ...prevDevs };
              const timestamp = Date.now();

              // If it's a unified sensors payload, wake up ALL nodes
              if (topicType === 'sensors' || data.soil || data.weather) {
                ['soil_node', 'weather_node', 'storage_node', 'water_node'].forEach(id => {
                  if (nextDevs[id]) nextDevs[id] = { ...nextDevs[id], status: 'ACTIVE', lastUpdate: timestamp };
                });
              } else {
                // Handle discrete node topics
                const id = `${topicType}_node`;
                if (nextDevs[id]) nextDevs[id] = { ...nextDevs[id], status: 'ACTIVE', lastUpdate: timestamp };
              }

              setSystemOverview(calculateSystemOverview(nextDevs));
              return nextDevs;
            });

            return updated;
          });

          setIsDataLoading(false);
          setLastGlobalUpdate(new Date().toLocaleTimeString());
          setConnectivityStatus('Online');
        },
        (status) => setMqttStatus(status)
      );
    }, 1500);
    return () => clearTimeout(bootTimer);
  }, []);

  // 5. Weather Satellite & Forecast Link
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (!MASTER_CONFIG.OPENWEATHER_API_KEY) throw new Error("No API Key");
        const key = MASTER_CONFIG.OPENWEATHER_API_KEY;
        const city = MASTER_CONFIG.WEATHER_CITY;

        // Fetch Current Weather
        const currRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${key}`);
        const currData = await currRes.json();
        
        if (currData && currData.main) {
          setApiWeather({
            temp: currData.main.temp,
            feelsLike: currData.main.feels_like,
            humidity: currData.main.humidity,
            pressure: currData.main.pressure,
            windSpeed: currData.wind?.speed,
            clouds: currData.clouds?.all,
            condition: currData.weather?.[0]?.main,
            icon: currData.weather?.[0]?.icon,
            city: currData.name,
            sunrise: new Date(currData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sunset: new Date(currData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            lastUpdate: new Date().toLocaleTimeString()
          });
        }

        // Fetch 5-Day Forecast
        const foreRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${key}`);
        const foreData = await foreRes.json();
        if (foreData && foreData.list) {
          // Filter to get 1 forecast per day (around noon)
          const daily = foreData.list.filter(f => f.dt_txt.includes("12:00:00")).map(f => ({
            date: new Date(f.dt * 1000).toLocaleDateString([], { weekday: 'short' }),
            temp: Math.round(f.main.temp),
            condition: f.weather[0].main,
            rainProb: `${Math.round((f.pop || 0) * 100)}%`
          }));
          setApiForecast(daily);
        }

      } catch (e) {
        console.warn("Weather Satellite Failed - Hardware Backup Active", e);
        if (sensorData?.weather?.temp) {
          setApiWeather(prev => ({
            ...prev,
            temp: sensorData.weather.temp,
            humidity: sensorData.weather.humidity,
            condition: 'Hardware Stream',
            city: 'Field A',
            lastUpdate: 'Live'
          }));
        }
      }
    };

    fetchWeather();
    const timer = setInterval(fetchWeather, 600000); 
    return () => clearInterval(timer);
  }, [sensorData?.weather?.temp]);

  return (
    <AppContext.Provider value={{
      user, login, logout, updateUser, farmInfo, updateBranding,
      isDarkMode, toggleTheme, sensorData, apiWeather, apiForecast, recommendations, sensorHistory,
      actuators, toggleActuator, isSidebarOpen, setIsSidebarOpen, ACTUATORS,
      farmHealthScore, systemHealth, connectivityStatus, cloudSyncStatus, profileMeta, updateProfileMeta,
      isDataLoading, lastGlobalUpdate, mqttStatus, syncData,
      devices, systemOverview
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
