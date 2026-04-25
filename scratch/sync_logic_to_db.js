
const fs = require('fs');

const csvData = `GRAINS & CEREALS,Rice,"WB, Assam, Odisha, Tamil Nadu","20–35°C, high rainfall (1000mm+)","Clay / loamy, water-retentive",Needs standing water
GRAINS & CEREALS,Wheat,"Punjab, Haryana, UP, MP",Cool (10–25°C),Loamy soil,Dry harvest needed
GRAINS & CEREALS,Maize,"Karnataka, Bihar, MP, Telangana",18–30°C,Well-drained loamy,Moderate rainfall
GRAINS & CEREALS,Barley,"Rajasthan, UP",Cool & dry,Sandy loam,Drought tolerant
GRAINS & CEREALS,Bajra,"Rajasthan, Gujarat",Hot (25–40°C),Sandy soil,Low rainfall crop
GRAINS & CEREALS,Jowar,"Maharashtra, Karnataka",Warm,Medium soil,Semi-arid
GRAINS & CEREALS,Ragi,"Karnataka, Tamil Nadu",Moderate,Red soil,Rainfed
PULSES,Arhar (Tur),"Maharashtra, UP",Warm,Loamy,Long duration
PULSES,Chana,"MP, Rajasthan",Cool dry,Light soil,Low water
PULSES,Moong / Urad,"Rajasthan, WB",Warm,Sandy loam,Short crop
PULSES,Masoor,"UP, Bihar",Cool,Loamy,Winter crop
PULSES,Kidney Beans,"Hills, NE India",Cool,Rich soil,---
PULSES,Moth Beans,Rajasthan,Hot,Sandy,Arid
VEGETABLES,Potato,"UP, WB",Cool,Loose loamy,Frost sensitive
VEGETABLES,Tomato,All India,20–30°C,Well-drained,Moderate climate
VEGETABLES,Onion,"Maharashtra, MP",Mild,Sandy loam,Dry weather
VEGETABLES,Brinjal,All India,Warm,Rich soil,---
VEGETABLES,Cabbage / Cauliflower,"Hills, North India",Cool,Fertile soil,---
VEGETABLES,Okra,All India,Warm,Well-drained,---
VEGETABLES,Carrot / Radish,North India,Cool,Loose soil,---
VEGETABLES,Chili / Capsicum,"AP, Karnataka",Warm,Well-drained,---
VEGETABLES,Gourds,All India,Warm humid,Sandy loam,---
VEGETABLES,Cucumber / Beans,All India,Warm,Well-drained,---
VEGETABLES,Leafy Greens,All India,Cool to moderate,Rich soil,---
FRUITS,Mango,"UP, WB, Maharashtra",Tropical,Deep loamy,Dry flowering needed
FRUITS,Banana,"Tamil Nadu, WB",Warm humid,Rich moist soil,---
FRUITS,Apple,"Himachal, Kashmir",Cold,Well-drained,---
FRUITS,Citrus / Guava,"Maharashtra, UP",Warm,Light soil,---
FRUITS,Papaya / Grapes,"Maharashtra, Karnataka",Warm,Well-drained,---
FRUITS,Melons,Rajasthan,Hot,Sandy,---
FRUITS,Coconut,"Kerala, TN",Coastal humid,Sandy coastal,---
FRUITS,Nuts,Hills / dry zones,Moderate,Well-drained,---
CASH CROPS,Sugarcane,"UP, Maharashtra",Warm,Rich soil,---
CASH CROPS,Coffee,Karnataka,Cool humid,Loamy,---
CASH CROPS,Tea,"Assam, Darjeeling",Cool humid,Acidic soil,---
CASH CROPS,Spices,Kerala,Humid,Rich soil,---
CASH CROPS,Pepper / Cardamom,Western Ghats,Humid,Forest soil,---
FIBER & OILSEEDS,Cotton,"Gujarat, Maharashtra",Warm,Black soil,---
FIBER & OILSEEDS,Jute,"WB, Assam",Humid,Alluvial soil,---
FIBER & OILSEEDS,Oilseeds,"MP, Rajasthan",Moderate,Light soil,---
FLOWERS,All Flowers,All India,Moderate,Rich soil,---
SEEDS / NURSERY,All Seeds,Controlled environment,Moderate,Sterile soil,---`;

// Simple parser
const lines = csvData.split('\n');
const logicMap = {};

lines.forEach(line => {
    // Handle quoted commas
    const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    if (!parts || parts.length < 5) return;
    
    const crop = parts[1].replace(/"/g, '').toLowerCase().trim();
    const loc = parts[2].replace(/"/g, '').trim();
    const climate = parts[3].replace(/"/g, '').trim();
    const soil = parts[4].replace(/"/g, '').trim();
    
    logicMap[crop] = { loc, climate, soil };
});

const filePath = 'src/data/core/CropDatabase.js';
let content = fs.readFileSync(filePath, 'utf8');

// Match METADATA entries
for (const [crop, data] of Object.entries(logicMap)) {
    const regex = new RegExp(`'${crop}':\\s*{[\\s\\S]*?}`, 'i');
    const match = content.match(regex);
    if (match) {
        let entry = match[0];
        // Replace loc and soil
        entry = entry.replace(/loc:\s*'.*?'/, `loc: '${data.loc} (${data.climate})'`);
        entry = entry.replace(/soil:\s*'.*?'/, `soil: '${data.soil}'`);
        content = content.replace(match[0], entry);
    }
}

fs.writeFileSync(filePath, content);
console.log('Update Complete');
