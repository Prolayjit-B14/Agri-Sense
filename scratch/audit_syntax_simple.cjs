const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/polu1/OneDrive/Desktop/Zyro/src';

function auditFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for common ReferenceErrors
    if (content.includes('area') && !content.includes('const area') && !content.includes('let area') && !content.includes('var area') && !content.includes('import { area') && !content.includes('area:')) {
        if (!filePath.includes('FarmAdvisor.jsx') && !filePath.includes('index.css')) {
             console.log(`Potential Missing 'area' in ${filePath}`);
        }
    }
    
    // Check for broken imports of CropDatabase
    if (content.includes('CropDatabase') && !content.includes('import') && !content.includes('require')) {
         console.log(`Missing import for CropDatabase in ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            auditFile(fullPath);
        }
    }
}

console.log("Starting Audit...");
walk(srcDir);
console.log("Audit Finished.");
