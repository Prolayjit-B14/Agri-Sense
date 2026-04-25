
const fs = require('fs');

const data = `🌽 Maize (Corn)
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	All seasons	Climate-driven crop
🗓️ Sowing Window	Jun / Oct / Feb	Flexible planting cycles
🌾 Harvest Window	90–120 days	Short duration crop
🌍 Primary Regions	Karnataka, Bihar, MP	Widely adaptable
🌿 Habitat Type	Open field	Needs sunlight
🌡️ Climate Profile	Warm moderate (18–30°C)	Frost severely affects growth
🌱 Soil Type	Well-drained loamy	Waterlogging harms roots
⚙️ Crop Behavior	Fast-growing cereal	Responds quickly to nutrients
📊 Adaptability	🟢 All-time	Can grow year-round in suitable climate
💡 Key Insight	Climate > season	Temperature decides success

🌾 Barley
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Rabi	Winter crop
🗓️ Sowing Window	Oct–Nov	Needs cool start
🌾 Harvest Window	Mar	Early harvest crop
🌍 Primary Regions	Rajasthan, UP	Dry regions
🌿 Habitat Type	Dryland	Low moisture requirement
🌡️ Climate Profile	Cool, dry	Tolerates drought
🌱 Soil Type	Sandy loam	Works in poor soils
⚙️ Crop Behavior	Low-input crop	Needs minimal care
📊 Adaptability	🔵 Seasonal	Best only in winter
💡 Key Insight	Grows in poor soil	Good for low-resource farming

🌾 Bajra (Pearl Millet)
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Kharif	Rainy season crop
🗓️ Sowing Window	Jun–Jul	With monsoon onset
🌾 Harvest Window	Sep–Oct	Short duration
🌍 Primary Regions	Rajasthan, Gujarat	Arid zones
🌿 Habitat Type	Dryland	Drought-prone areas
🌡️ Climate Profile	Hot, dry	Survives extreme heat
🌱 Soil Type	Sandy	Poor fertility tolerated
⚙️ Crop Behavior	Drought-resistant crop	Thrives in harsh conditions
📊 Adaptability	🟡 Flexible	Works in low rainfall
💡 Key Insight	Survival crop	Ideal for extreme climates

🌾 Jowar (Sorghum)
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Kharif + Rabi	Dual-season crop
🗓️ Sowing Window	Jun / Sep	Based on rainfall
🌾 Harvest Window	3–4 months	Flexible duration
🌍 Primary Regions	Maharashtra, Karnataka	Semi-arid zones
🌿 Habitat Type	Dryland	Moderate moisture
🌡️ Climate Profile	Warm, semi-arid	Heat tolerant
🌱 Soil Type	Medium black soil	Retains some moisture
⚙️ Crop Behavior	Climate-adaptive crop	Adjusts to rainfall
📊 Adaptability	🟡 Flexible	Works in multiple seasons
💡 Key Insight	Rainfall-dependent	Season shifts with rain

🌾 Ragi (Finger Millet)
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Kharif (main)	Rainfed crop
🗓️ Sowing Window	Jun–Jul	Monsoon based
🌾 Harvest Window	Oct–Nov	3–4 months
🌍 Primary Regions	Karnataka, Tamil Nadu	South India
🌿 Habitat Type	Rainfed upland	Low irrigation
🌡️ Climate Profile	Moderate rainfall	Stable climate needed
🌱 Soil Type	Red soil	Nutrient-poor tolerance
⚙️ Crop Behavior	Resilient crop	Grows in poor conditions
📊 Adaptability	🟡 Flexible	Works in marginal lands
💡 Key Insight	Climate-resilient	Ideal for rainfed farming`;

const crops = data.split('\n\n');
const logicMap = {};

crops.forEach(block => {
    const lines = block.split('\n');
    const title = lines[0].replace(/[^\w\s\(\)]/g, '').trim().toLowerCase();
    
    // Manual mapping for titles
    let key = title;
    if (title.includes('maize')) key = 'maize (corn)';
    if (title.includes('barley')) key = 'barley';
    if (title.includes('bajra')) key = 'bajra';
    if (title.includes('jowar')) key = 'jowar';
    if (title.includes('ragi')) key = 'ragi';

    const params = {};
    lines.slice(2).forEach(line => {
        const [label, val, insight] = line.split('\t');
        if (!label || !val) return;
        const p = label.replace(/[^\w\s]/g, '').trim();
        params[p] = { val: val.trim(), insight: (insight || '').trim() };
    });
    
    logicMap[key] = params;
});

const filePath = 'src/data/core/CropDatabase.js';
let content = fs.readFileSync(filePath, 'utf8');

for (const [key, p] of Object.entries(logicMap)) {
    const regex = new RegExp(`'${key}':\\s*{[\\s\\S]*?}`, 'i');
    const match = content.match(regex);
    if (match) {
        let entry = match[0];
        const update = (field, source) => {
            const val = p[source]?.val;
            const insight = p[source]?.insight;
            if (val) entry = entry.replace(new RegExp(`${field}:\\s*'.*?'`), `${field}: '${val}'`);
            if (insight) {
               const insightField = field === 'insight' ? 'insightDetail' : field + 'Insight';
               if (entry.includes(insightField)) {
                   entry = entry.replace(new RegExp(`${insightField}:\\s*'.*?'`), `${insightField}: '${insight}'`);
               } else {
                   entry = entry.replace(new RegExp(`${field}:\\s*'.*?'`), `${field}: '${val}', ${insightField}: '${insight}'`);
               }
            }
        };

        update('season', 'Season Type');
        update('sow', 'Sowing Window');
        update('harvest', 'Harvest Window');
        update('loc', 'Primary Regions');
        update('habitat', 'Habitat Type');
        update('climate', 'Climate Profile');
        update('soil', 'Soil Type');
        update('behavior', 'Crop Behavior');
        update('adaptability', 'Adaptability');
        update('insight', 'Key Insight');

        content = content.replace(match[0], entry);
    }
}

fs.writeFileSync(filePath, content);
console.log('Processed:', Object.keys(logicMap));
