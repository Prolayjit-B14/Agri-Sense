/**
 * AgriSense AI Service
 * Handles communication with Gemini APIs.
 */

import { MASTER_CONFIG } from '../setup';

// 🔐 INDUSTRIAL KEY INJECTION (Direct Priority)
const GEMINI_API_KEY = MASTER_CONFIG.GEMINI_API_KEY;

// 💡 Diagnostic: Log key status on load (Sanitized)
if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
  console.log(`🛰️ AgriBot: Cloud AI Engine Active (Handshake Ready)`);
} else {
  console.warn("🛰️ AgriBot: Cloud AI Engine Offline (Key check failed).");
}

/**
 * Local Agronomy Logic Engine (Fallback when API keys are missing or failing)
 */
const localAgriLogic = (prompt, context) => {
  const query = prompt.toLowerCase();
  const { currentSensors, weather, systemHealth, aiRecommendations, knowledgeBase } = context;
  
  // 1. Status Check
  if (query.includes('status') || query.includes('summary') || query.includes('how is my farm')) {
    const health = systemHealth?.overall_status || 'Unknown';
    const temp = currentSensors?.weather?.temp || '---';
    const moisture = currentSensors?.soil?.moisture || '---';
    const advice = typeof aiRecommendations?.[0] === 'object' ? (aiRecommendations[0].text || aiRecommendations[0].content) : aiRecommendations?.[0];
    
    return `### 🚜 FARM STATUS REPORT
- **Overall Health**: ${health}
- **Temperature**: ${temp}°C
- **Soil Moisture**: ${moisture}%
- **System**: ${systemHealth?.active_nodes || 0}/${systemHealth?.total_nodes || 0} nodes online.
- **Advice**: ${advice || "Everything looks stable."}`;
  }

  // 2. Irrigation Logic
  if (query.includes('irrigate') || query.includes('water') || query.includes('moisture')) {
    const moisture = parseFloat(currentSensors?.soil?.moisture);
    if (isNaN(moisture)) return "### 🔌 CONNECTION ISSUE\nI can't see your soil moisture right now. Please check if your soil node is online!";
    if (moisture < 30) return `### 🚨 CRITICAL ALERT\nSoil moisture is very low (**${moisture}%**). You should irrigate immediately! 💧`;
    if (moisture < 50) return `### ⚠️ WARNING\nSoil moisture is dipping (**${moisture}%**). Consider a light irrigation cycle soon.`;
    return `### ✅ OPTIMAL\nSoil moisture is healthy (**${moisture}%**). No irrigation needed at the moment.`;
  }

  // 3. Pest Warning
  if (query.includes('pest') || query.includes('bug') || query.includes('disease')) {
    const temp = parseFloat(currentSensors?.weather?.temp);
    const hum = parseFloat(currentSensors?.weather?.humidity);
    const pestAdvice = knowledgeBase?.pestDatabase?.find(p => {
      const cropName = p.split(':')[0].toLowerCase().split('(')[0].trim();
      return query.includes(cropName);
    });
    
    if (pestAdvice) return `### 🐛 PEST ADVICE\n${pestAdvice}\n\n*Current weather: ${temp}°C, ${hum}% humidity.*`;
    if (temp > 28 && hum > 70) return "### ⚠️ PEST ALERT\nHigh heat and humidity detected. This is a prime condition for fungal outbreaks. Keep an eye on leaf health! 🐛";
    return "### 🛡️ PROTECTED\nCurrent weather conditions are not showing high pest outbreak triggers. Continue regular monitoring.";
  }

  // 4. Fertilizer & Compost
  if (query.includes('fertilizer') || query.includes('npk') || query.includes('compost') || query.includes('dosage')) {
    const npk = currentSensors?.soil?.npk || {};
    const fertAdvice = knowledgeBase?.fertilizerDatabase?.find(f => {
      const cropName = f.split(':')[0].toLowerCase().split('(')[0].trim();
      return query.includes(cropName);
    });
    const compAdvice = knowledgeBase?.compostDatabase?.find(c => {
      const cropName = c.split(':')[0].toLowerCase().split('(')[0].trim();
      return query.includes(cropName);
    });

    let response = `### 🧪 SOIL NUTRIENTS\n- **N**: ${npk.n || '--'}\n- **P**: ${npk.p || '--'}\n- **K**: ${npk.k || '--'}`;
    if (fertAdvice) response += `\n\n### 💊 FERTILIZER\n${fertAdvice}`;
    if (compAdvice) response += `\n\n### 🌱 COMPOST\n${compAdvice}`;
    return response;
  }

  // 5. Suitability & Region
  if (query.includes('suit') || query.includes('grow') || query.includes('season') || query.includes('place')) {
    const suitability = knowledgeBase?.suitabilityHighlights?.slice(0, 5).join('\n- ');
    return `🌍 REGIONAL SUITABILITY:\n- ${suitability}\n\nAdvice: Check your local district logic in logic.csv for micro-climate matching.`;
  }

  // 6. General Knowledge Fallback
  return "I'm currently analyzing your data using my Local Diagnostic Engine. I can help with 'status', 'irrigation', 'pests', 'NPK', or 'suitability'! To enable the full Cloud AI Brain, ensure your Gemini API key is active. 🌿";
};

/**
 * Sends a message to Gemini AI with context data.
 */
export const askGemini = async (prompt, context) => {
  if (!GEMINI_API_KEY) {
    console.warn("AgriBot: No valid API key found. Falling back to local diagnostic engine.");
    return localAgriLogic(prompt, context);
  }

  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro"
  ];

  const slimContext = {
    sensors: context.currentSensors,
    weather: context.weather,
    health: context.health,
    logs: context.recentLogs,
    time: context.time
  };

  const fullPrompt = `
You are AgriSense AI, an elite agronomy assistant. 
Data Context:
- Farm: ${context.farmName}
- Sensors: ${JSON.stringify(slimContext.sensors)}
- Weather: ${JSON.stringify(slimContext.weather)}
- System: ${JSON.stringify(slimContext.health)}
- History: ${JSON.stringify(slimContext.logs)}

Instructions:
1. Provide a professional, concise response.
2. Use markdown for structure (h3 for sections).
3. Be action-oriented. If sensors are bad, suggest fixes.
4. If asked about status, summarize all sensors.

User: ${prompt}
`;

  const model = "gemini-flash-latest";
  const apiVersion = "v1beta";
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY 
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    } else {
      console.warn(`🛰️ AgriBot Error [${response.status}]:`, data.error?.message || response.statusText);
      throw new Error(data.error?.message || "Cloud AI Offline");
    }
  } catch (e) {
    console.error("🛰️ AgriBot Network Exception:", e.message);
  }

  console.error("🛰️ AgriBot: Cloud AI failed. Using Local Diagnostic Engine.");
  return localAgriLogic(prompt, context);
};
