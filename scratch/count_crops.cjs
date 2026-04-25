const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'core', 'CropDatabase.js');
const content = fs.readFileSync(filePath, 'utf8');

function countKeys(objectName) {
    const regex = new RegExp(`${objectName}\\s*=\\s*\\{`, 'g');
    const match = regex.exec(content);
    if (!match) return 0;

    let braceCount = 1;
    let index = match.index + match[0].length;
    let objectContent = '';

    while (braceCount > 0 && index < content.length) {
        if (content[index] === '{') braceCount++;
        if (content[index] === '}') braceCount--;
        objectContent += content[index];
        index++;
    }

    const keys = [];
    let currentPos = 0;
    let nested = 0;
    while (currentPos < objectContent.length) {
        if (objectContent[currentPos] === '{') nested++;
        if (objectContent[currentPos] === '}') nested--;
        
        if (nested === 0) {
            const slice = objectContent.substring(currentPos);
            const keyMatch = /^\s*['"]?([^'":\s]+[^'":]*)['"]?\s*:/.exec(slice);
            if (keyMatch) {
                keys.push(keyMatch[1].trim().replace(/['"]/g, ''));
                currentPos += keyMatch[0].length;
                continue;
            }
        }
        currentPos++;
    }
    return keys;
}

const specsKeys = countKeys('CROP_SPECS');
const metaKeys = countKeys('METADATA');

console.log(`CROP_SPECS Count: ${specsKeys.length}`);
console.log(`METADATA Count: ${metaKeys.length}`);

const missingInMeta = specsKeys.filter(k => !metaKeys.includes(k));
const missingInSpecs = metaKeys.filter(k => !specsKeys.includes(k));

console.log('\nMissing in METADATA:', missingInMeta);
console.log('Missing in CROP_SPECS:', missingInSpecs);
