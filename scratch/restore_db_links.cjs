const fs = require('fs');
const path = 'c:/Users/polu1/OneDrive/Desktop/Zyro/src/data/core/CropDatabase.js';

let content = fs.readFileSync(path, 'utf8');

// Fix the corrupted words from previous replaces
// Convert any 'adaptabilityable', 'adaptabilityability', or 'adapt' (where it should be adaptability) back to 'adaptability'
content = content.replace(/adaptabilityability/g, 'adaptability');
content = content.replace(/adaptabilityable/g, 'adaptable');
content = content.replace(/adaptability/g, 'TEMP_KEY');
content = content.replace(/adapt/g, 'adaptability');
content = content.replace(/TEMP_KEY/g, 'adaptability');

// Clean up any double-adaptability issues
content = content.replace(/adaptabilityability/g, 'adaptability');

fs.writeFileSync(path, content, 'utf8');
console.log("Database Links Restored.");
