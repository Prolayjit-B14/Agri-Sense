/**
 * AgriSense Pro v17.1.0 Data Models
 * Defines the initial state structures for sensors, actuators, and weather.
 */

export const INITIAL_SENSOR_DATA = {
  soil: { 
    moisture: null, ph: null, temp: null, humidity: null, 
    npk: { n: null, p: null, k: null }, healthIndex: null 
  },
  storage: { 
    temp: null, humidity: null, ethylene: null, mq135: null, freshnessScore: null 
  },
  weather: { 
    temp: null, humidity: null, pressure: null, windSpeed: null, 
    isRaining: false, lightIntensity: null, rainLevel: null 
  },
  water: { 
    level: null, tankLevel: null, flowRate: null, totalUsage: null 
  },

  market: { 
    price: null, trend: 'stable', commodities: [] 
  }
};

export const INITIAL_API_WEATHER = {
  temp: null, 
  humidity: null, 
  pressure: null, 
  windSpeed: null, 
  sunrise: null, 
  sunset: null, 
  condition: 'Detecting...', 
  city: 'Detecting...'
};

export const INITIAL_SYSTEM_HEALTH = { 
  soil: null, 
  water: null, 
  weather: null, 
  storage: null 
};
