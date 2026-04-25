
const fs = require('fs');

const data = `🌱 Arhar / Tur (Pigeon Pea)
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Kharif (long duration)	Extends into winter; spans multiple seasons
🗓️ Sowing Window	Jun–Jul	Needs monsoon start for establishment
🌾 Harvest Window	Jan–Feb	Long crop cycle (~6–8 months)
🌍 Primary Regions	Maharashtra, UP, Karnataka	Grown in semi-arid and rainfed areas
🌿 Habitat Type	Rainfed dryland	Performs well without irrigation
🌡️ Climate Profile	Warm (25–35°C), moderate rainfall	Excess rain harms flowering
🌱 Soil Type	Loamy to black soil	Good drainage essential
⚙️ Crop Behavior	Deep-rooted, nitrogen-fixing	Improves soil fertility naturally
📊 Adaptability	🟡 Flexible	Tolerates drought but not waterlogging
💡 Key Insight	Long-duration crop	Bridges Kharif → Rabi seasons

🌱 Gram / Chana (Chickpea)
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Rabi	Strict winter crop
🗓️ Sowing Window	Oct–Nov	After monsoon withdrawal
🌾 Harvest Window	Feb–Mar	Requires dry conditions
🌍 Primary Regions	MP, Rajasthan, UP	Dryland farming zones
🌿 Habitat Type	Rainfed dryland	Minimal irrigation needed
🌡️ Climate Profile	Cool (15–25°C), dry	Sensitive to excess moisture
🌱 Soil Type	Sandy loam to clay loam	Light soils preferred
⚙️ Crop Behavior	Low water-demand crop	Uses residual soil moisture
📊 Adaptability	🔵 Seasonal	Limited to winter
💡 Key Insight	Overwatering reduces yield	Best grown in dry conditions

🌱 Moong (Mung Bean)
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Zaid + Kharif	Short-duration flexible crop
🗓️ Sowing Window	Mar–Apr / Jun–Jul	Fits between main crop cycles
🌾 Harvest Window	60–70 days	Very fast crop
🌍 Primary Regions	Rajasthan, WB, Maharashtra	Widely adaptable
🌿 Habitat Type	Open field (rainfed/irrigated)	Works in multiple systems
🌡️ Climate Profile	Warm (25–35°C)	Sensitive to cold
🌱 Soil Type	Sandy loam	Well-drained soil needed
⚙️ Crop Behavior	Short-cycle nitrogen fixer	Improves soil quickly
📊 Adaptability	🟢 All-time	Can fit multiple seasons
💡 Key Insight	Ideal gap crop	Best for crop rotation

🌱 Urad (Black Gram)
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Kharif + Zaid	Flexible seasonal crop
🗓️ Sowing Window	Jun–Jul / Mar–Apr	Rain or irrigation based
🌾 Harvest Window	70–90 days	Short duration
🌍 Primary Regions	MP, UP, Tamil Nadu	Grown across India
🌿 Habitat Type	Rainfed / irrigated field	Needs moderate moisture
🌡️ Climate Profile	Warm, humid	Sensitive to heavy rain
🌱 Soil Type	Loamy	Avoid waterlogging
⚙️ Crop Behavior	Nitrogen-fixing legume	Enhances soil health
📊 Adaptability	🟡 Flexible	Works in multiple seasons
💡 Key Insight	Excess rain = disease risk	Needs controlled moisture

🌱 Masoor (Lentil)
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Rabi	Winter crop
🗓️ Sowing Window	Oct–Nov	After monsoon
🌾 Harvest Window	Feb–Mar	Dry harvest needed
🌍 Primary Regions	UP, Bihar, MP	Indo-Gangetic plains
🌿 Habitat Type	Dryland	Low irrigation
🌡️ Climate Profile	Cool (15–25°C)	Sensitive to humidity
🌱 Soil Type	Loamy	Well-drained
⚙️ Crop Behavior	Low-input crop	Requires minimal care
📊 Adaptability	🔵 Seasonal	Strict winter crop
💡 Key Insight	Performs best in dry winters	Avoid excess moisture

🌱 Kidney Beans (Rajma)
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Rabi (plains), Summer (hills)	Climate-dependent crop
🗓️ Sowing Window	Oct–Nov (plains) / Mar–Apr (hills)	Depends on region
🌾 Harvest Window	90–120 days	Medium duration
🌍 Primary Regions	Himachal, J&K, NE India	Cooler regions preferred
🌿 Habitat Type	Upland / hilly terrain	Needs mild climate
🌡️ Climate Profile	Cool (15–25°C)	Heat reduces yield
🌱 Soil Type	Rich loamy	Fertile soil required
⚙️ Crop Behavior	Temperature-sensitive crop	Not suited for high heat
📊 Adaptability	🔴 Sensitive	Narrow climate range
💡 Key Insight	Prefers cool climate	Not suitable for hot plains

🌱 Moth Beans
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Kharif	Rainy season crop
🗓️ Sowing Window	Jun–Jul	With monsoon
🌾 Harvest Window	Sep–Oct	Short duration
🌍 Primary Regions	Rajasthan, Gujarat	Desert regions
🌿 Habitat Type	Arid dryland	Extremely low water
🌡️ Climate Profile	Hot, dry	Survives extreme heat
🌱 Soil Type	Sandy	Poor soil tolerance
⚙️ Crop Behavior	Highly drought-resistant	Thrives in harsh conditions
📊 Adaptability	🟡 Flexible	Works in extreme climates
💡 Key Insight	Survival pulse crop	Ideal for desert farming`;

const blocks = data.split('\n\n');
const logicMap = {};

blocks.forEach(block => {
    const lines = block.split('\n');
    const rawTitle = lines[0].replace(/[^\w\s\/\(\)]/g, '').trim().toLowerCase();
    
    let key = rawTitle;
    if (rawTitle.includes('arhar')) key = 'arhar/tur';
    if (rawTitle.includes('gram')) key = 'gram/chana';
    if (rawTitle.includes('moong')) key = 'moong';
    if (rawTitle.includes('urad')) key = 'urad';
    if (rawTitle.includes('masoor')) key = 'masoor';
    if (rawTitle.includes('kidney beans')) key = 'kidney beans';
    if (rawTitle.includes('moth beans')) key = 'moth beans';

    const params = {};
    lines.slice(2).forEach(line => {
        const parts = line.split('\t');
        if (parts.length < 2) return;
        const label = parts[0].replace(/[^\w\s]/g, '').trim();
        params[label] = { val: parts[1].trim(), insight: (parts[2] || '').trim() };
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
            if (val) {
                if (entry.includes(`${field}:`)) {
                    entry = entry.replace(new RegExp(`${field}:\\s*'.*?'`), `${field}: '${val}'`);
                } else {
                   // Add before pest
                   entry = entry.replace('pest:', `${field}: '${val}',\n        pest:`);
                }
            }
            if (insight) {
               const insightField = field === 'insight' ? 'insightDetail' : field + 'Insight';
               if (entry.includes(`${insightField}:`)) {
                   entry = entry.replace(new RegExp(`${insightField}:\\s*'.*?'`), `${insightField}: '${insight}'`);
               } else {
                   entry = entry.replace('pest:', `${insightField}: '${insight}',\n        pest:`);
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
console.log('Updated pulses:', Object.keys(logicMap));
