const fs = require('fs');
const path = require('path');
const vm = require('vm');

const filePath = path.join(__dirname, '..', 'src', 'data', 'core', 'CropDatabase.js');
let content = fs.readFileSync(filePath, 'utf8');

// Convert ESM to something runnable in VM
content = content.replace(/export const/g, 'var');

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(content, sandbox);

const specs = sandbox.CROP_SPECS;
const meta = sandbox.METADATA;

const specsKeys = Object.keys(specs);
const metaKeys = Object.keys(meta);

console.log(`CROP_SPECS Count: ${specsKeys.length}`);
console.log(`METADATA Count: ${metaKeys.length}`);

const missingInMeta = specsKeys.filter(k => !metaKeys.hasOwnProperty(k));
const missingInSpecs = metaKeys.filter(k => !specsKeys.hasOwnProperty(k));

console.log('\nMissing in METADATA:', missingInMeta);
console.log('Missing in CROP_SPECS:', missingInSpecs);
