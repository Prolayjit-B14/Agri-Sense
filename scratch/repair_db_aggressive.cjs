const fs = require('fs');
const path = 'c:/Users/polu1/OneDrive/Desktop/Zyro/src/data/core/CropDatabase.js';

let content = fs.readFileSync(path, 'utf8');

// Aggressive collapse of repeated 'adapt' variations
content = content.replace(/adapt(ability|able)+/g, (match) => {
    if (match.includes('ability')) return 'adaptability';
    return 'adaptable';
});

// Fix the adaptabilityInsight key which might have been caught in the regex
content = content.replace(/adaptabilityInsight/g, 'adaptabilityInsight');

fs.writeFileSync(path, content, 'utf8');
console.log("Database surgically repaired.");
