const fs = require('fs');
const path = require('path');
const vm = require('vm');

const filePath = path.join(__dirname, '..', 'src', 'data', 'core', 'CropDatabase.js');
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace(/export const/g, 'var');

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(content, sandbox);

const { CROP_SPECS, METADATA, ALIASES } = sandbox;

console.log('--- Alias Integrity Audit ---');
let broken = 0;
Object.keys(ALIASES).forEach(key => {
    const target = ALIASES[key];
    if (!CROP_SPECS[target]) {
        console.log(`❌ Broken Alias: "${key}" -> "${target}" (Not in CROP_SPECS)`);
        broken++;
    }
});

console.log('\n--- Metadata Integrity Audit ---');
let missingMeta = 0;
Object.keys(CROP_SPECS).forEach(key => {
    if (!METADATA[key]) {
        console.log(`❌ Missing Metadata: "${key}"`);
        missingMeta++;
    }
});

if (broken === 0 && missingMeta === 0) {
    console.log('✅ ALL SYSTEMS CLEAR: 100% Industrial Synchronization Verified.');
} else {
    console.log(`⚠️ DISCREPANCIES FOUND: ${broken} broken aliases, ${missingMeta} missing metadata.`);
}
