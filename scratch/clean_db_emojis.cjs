const fs = require('fs');
const path = 'c:/Users/polu1/OneDrive/Desktop/Zyro/src/data/core/CropDatabase.js';

let content = fs.readFileSync(path, 'utf8');

// Remove the specific color emojis and the space after them
const cleaned = content.replace(/[🟢🔵🟡🔴]\s?/g, '');

fs.writeFileSync(path, cleaned, 'utf8');
console.log("Database Cleanup Successful.");
