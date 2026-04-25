
const fs = require('fs');

const data = `🥔 Potato
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Rabi (main)	Prefers cool growing conditions
🗓️ Sowing Window	Oct–Nov	Requires cool start
🌾 Harvest Window	Jan–Feb	Short winter crop
🌍 Primary Regions	UP, WB, Punjab	Plains with cool climate
🌿 Habitat Type	Open field	Needs loose soil bed
🌡️ Climate Profile	Cool (15–25°C)	Heat reduces tuber formation
🌱 Soil Type	Sandy loam	Loose soil improves tuber growth
⚙️ Crop Behavior	Tuber-forming crop	Soil structure critical
📊 Adaptability	🔵 Seasonal	Best only in winter
💡 Key Insight	Heat = low yield	Cool soil is essential

🍅 Tomato
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	All seasons	Variety-dependent crop
🗓️ Sowing Window	Year-round	Controlled by hybrids
🌾 Harvest Window	60–90 days	Fast crop cycle
🌍 Primary Regions	All India	Highly adaptable
🌿 Habitat Type	Open / greenhouse	Protected farming possible
🌡️ Climate Profile	Moderate (20–30°C)	Extreme heat/cold affects fruit
🌱 Soil Type	Well-drained loam	Avoid waterlogging
⚙️ Crop Behavior	Climate-sensitive fruiting	Needs stable conditions
📊 Adaptability	🟢 All-time	Can grow year-round
💡 Key Insight	Climate > season	Temperature stability matters

🧅 Onion
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Kharif + Rabi + Zaid	Multi-season crop
🗓️ Sowing Window	Oct / Jun / Jan	Based on variety
🌾 Harvest Window	3–5 months	Multiple cycles
🌍 Primary Regions	Maharashtra, MP	Major production zones
🌿 Habitat Type	Open field	Needs spacing
🌡️ Climate Profile	Mild, dry	Humidity affects storage
🌱 Soil Type	Sandy loam	Good drainage required
⚙️ Crop Behavior	Bulb-forming crop	Sensitive to moisture
📊 Adaptability	🟢 All-time	Grown year-round
💡 Key Insight	Storage depends on dryness	Humidity = rot risk

🍆 Brinjal (Eggplant)
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	All seasons	Flexible crop
🗓️ Sowing Window	Year-round	Region-based
🌾 Harvest Window	80–120 days	Continuous picking
🌍 Primary Regions	All India	Widely grown
🌿 Habitat Type	Open field	Needs sunlight
🌡️ Climate Profile	Warm (20–35°C)	Frost sensitive
🌱 Soil Type	Fertile loam	Rich soil improves yield
⚙️ Crop Behavior	Long-duration vegetable	Continuous harvest
📊 Adaptability	🟢 All-time	Works in all seasons
💡 Key Insight	Needs warm climate	Cold reduces growth

🥬 Cabbage
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Rabi	Cool-season crop
🗓️ Sowing Window	Sep–Oct	Needs cool start
🌾 Harvest Window	Dec–Jan	Winter harvest
🌍 Primary Regions	North India, hills	Cooler regions
🌿 Habitat Type	Open field	Dense planting
🌡️ Climate Profile	Cool (10–20°C)	Heat damages heads
🌱 Soil Type	Fertile loam	Nutrient-rich soil
⚙️ Crop Behavior	Leaf-head formation	Sensitive to temperature
📊 Adaptability	🔵 Seasonal	Limited to cool climate
💡 Key Insight	Heat = poor head formation	Cool climate essential

🥦 Cauliflower
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Rabi	Cool crop
🗓️ Sowing Window	Sep–Oct	Temperature sensitive
🌾 Harvest Window	Dec–Jan	Seasonal harvest
🌍 Primary Regions	North India	Winter regions
🌿 Habitat Type	Open field	Needs spacing
🌡️ Climate Profile	Cool (15–20°C)	Very temperature sensitive
🌱 Soil Type	Fertile loam	High nutrients required
⚙️ Crop Behavior	Curds form under specific temp	Highly sensitive
📊 Adaptability	🔴 Sensitive	Narrow temp range
💡 Key Insight	Small temp change affects yield	Precision crop

🌿 Spinach
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	All seasons (best in winter)	Cool preferred
🗓️ Sowing Window	Year-round	Fast growing
🌾 Harvest Window	30–40 days	Very short cycle
🌍 Primary Regions	All India	Widely grown
🌿 Habitat Type	Open field	Dense sowing
🌡️ Climate Profile	Cool to moderate	Heat causes bolting
🌱 Soil Type	Rich loam	Nutrient-rich soil
⚙️ Crop Behavior	Leafy fast crop	Rapid growth
📊 Adaptability	🟡 Flexible	Works year-round
💡 Key Insight	Heat = early flowering	Best in cool weather

🌿 Okra (Ladyfinger)
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Kharif + Summer	Warm crop
🗓️ Sowing Window	Feb–Mar / Jun–Jul	Needs warmth
🌾 Harvest Window	50–60 days	Fast crop
🌍 Primary Regions	All India	Widely grown
🌿 Habitat Type	Open field	Sunlight needed
🌡️ Climate Profile	Warm (25–35°C)	Cold sensitive
🌱 Soil Type	Well-drained	Moderate fertility
⚙️ Crop Behavior	Heat-loving crop	Performs in summer
📊 Adaptability	🟡 Flexible	Works in warm seasons
💡 Key Insight	Cold reduces yield	Needs heat

🥕 Carrot
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Rabi	Winter crop
🗓️ Sowing Window	Oct–Nov	Cool sowing
🌾 Harvest Window	Jan–Feb	Root development
🌍 Primary Regions	North India	Cooler zones
🌿 Habitat Type	Open field	Loose soil required
🌡️ Climate Profile	Cool (10–20°C)	Heat affects root shape
🌱 Soil Type	Sandy loam	Loose soil critical
⚙️ Crop Behavior	Root crop	Soil structure important
📊 Adaptability	🔵 Seasonal	Best in winter
💡 Key Insight	Hard soil = deformed roots	Soil quality critical

🌶️ Chili / Capsicum
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Kharif + Rabi	Moderate flexibility
🗓️ Sowing Window	Jun / Oct	Region-based
🌾 Harvest Window	90–120 days	Medium duration
🌍 Primary Regions	AP, Karnataka	Major producers
🌿 Habitat Type	Open / greenhouse	Controlled farming possible
🌡️ Climate Profile	Warm (20–30°C)	Sensitive extremes
🌱 Soil Type	Well-drained loam	Balanced nutrients
⚙️ Crop Behavior	Fruit-sensitive crop	Needs stable climate
📊 Adaptability	🟡 Flexible	Not extreme tolerant
💡 Key Insight	Stress affects fruit quality	Stable climate needed

🎃 Gourds (Pumpkin, Bottle Gourd, Bitter Gourd)
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Kharif + Zaid	Warm season crops
🗓️ Sowing Window	Feb–Mar / Jun–Jul	Heat required
🌾 Harvest Window	60–90 days	Fast growth
🌍 Primary Regions	All India	Widely grown
🌿 Habitat Type	Creepers (open field)	Needs space
🌡️ Climate Profile	Warm, humid	Frost sensitive
🌱 Soil Type	Sandy loam	Good drainage
⚙️ Crop Behavior	Fast vine growth	Rapid spread
📊 Adaptability	🟡 Flexible	Works in warm seasons
💡 Key Insight	Needs space + sunlight	Growth is rapid

🥒 Cucumber
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	Zaid + Kharif	Summer crop
🗓️ Sowing Window	Feb–Mar / Jun	Warm sowing
🌾 Harvest Window	50–70 days	Short duration
🌍 Primary Regions	All India	Widely grown
🌿 Habitat Type	Creeper	Needs support
🌡️ Climate Profile	Warm	Sensitive to cold
🌱 Soil Type	Sandy loam	Moist but drained
⚙️ Crop Behavior	Water-demanding vine	Needs frequent watering
📊 Adaptability	🟡 Flexible	Warm climate needed
💡 Key Insight	Water stress = bitter fruit	Moisture critical

🌿 Leafy Herbs (Fenugreek, Coriander, Mint)
Parameter	Ideal Value	Decision / Insight
🌱 Season Type	All seasons (best in winter)	Flexible crops
🗓️ Sowing Window	Year-round	Frequent sowing
🌾 Harvest Window	20–40 days	Very fast cycle
🌍 Primary Regions	All India	Easily grown
🌿 Habitat Type	Open / kitchen garden	Small spaces
🌡️ Climate Profile	Cool to moderate	Heat reduces quality
🌱 Soil Type	Rich loam	Nutrient-rich soil
⚙️ Crop Behavior	Fast leafy growth	Quick turnover
📊 Adaptability	🟡 Flexible	Works year-round
💡 Key Insight	Best in cool weather	Heat reduces taste`;

const blocks = data.split('\n\n');
const logicMap = {};

blocks.forEach(block => {
    const lines = block.split('\n');
    const rawTitle = lines[0].replace(/[^\w\s\/\(\),]/g, '').trim().toLowerCase();
    
    let keys = [rawTitle];
    if (rawTitle.includes('potato')) keys = ['potato'];
    if (rawTitle.includes('tomato')) keys = ['tomato'];
    if (rawTitle.includes('onion')) keys = ['onion'];
    if (rawTitle.includes('brinjal')) keys = ['brinjal (eggplant)'];
    if (rawTitle.includes('cabbage')) keys = ['cabbage'];
    if (rawTitle.includes('cauliflower')) keys = ['cauliflower'];
    if (rawTitle.includes('spinach')) keys = ['spinach'];
    if (rawTitle.includes('okra')) keys = ['okra (ladyfinger)'];
    if (rawTitle.includes('carrot')) keys = ['carrot'];
    if (rawTitle.includes('chili / capsicum')) keys = ['chili', 'capsicum'];
    if (rawTitle.includes('gourds')) keys = ['pumpkin', 'bottle gourd', 'bitter gourd'];
    if (rawTitle.includes('cucumber')) keys = ['cucumber'];
    if (rawTitle.includes('leafy herbs')) keys = ['fenugreek', 'coriander', 'mint'];

    const params = {};
    lines.slice(2).forEach(line => {
        const parts = line.split('\t');
        if (parts.length < 2) return;
        const label = parts[0].replace(/[^\w\s]/g, '').trim();
        params[label] = { val: parts[1].trim(), insight: (parts[2] || '').trim() };
    });
    
    keys.forEach(k => {
        logicMap[k] = params;
    });
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
console.log('Updated vegetables:', Object.keys(logicMap));
