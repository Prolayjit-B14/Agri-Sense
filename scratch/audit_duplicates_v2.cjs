const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'core', 'CropDatabase.js');
const content = fs.readFileSync(filePath, 'utf8');

function findDuplicates(objectName) {
    const regex = new RegExp(`${objectName}\\s*=\\s*\\{`, 'g');
    const match = regex.exec(content);
    if (!match) return;

    let braceCount = 1;
    let index = match.index + match[0].length;
    let startOfObject = index;
    let objectContent = '';

    while (braceCount > 0 && index < content.length) {
        if (content[index] === '{') braceCount++;
        if (content[index] === '}') braceCount--;
        objectContent += content[index];
        index++;
    }

    const lines = content.substring(0, startOfObject).split('\n');
    const baseLine = lines.length;

    const keyLocations = [];
    let currentPos = 0;
    let nested = 0;
    while (currentPos < objectContent.length) {
        if (objectContent[currentPos] === '{') nested++;
        if (objectContent[currentPos] === '}') nested--;
        
        if (nested === 0) {
            const slice = objectContent.substring(currentPos);
            const keyMatch = /^\s*['"]?([^'":\s]+)['"]?\s*:/.exec(slice);
            if (keyMatch) {
                const key = keyMatch[1];
                const lineOffset = objectContent.substring(0, currentPos).split('\n').length - 1;
                keyLocations.push({ key, line: baseLine + lineOffset });
                currentPos += keyMatch[0].length;
                continue;
            }
        }
        currentPos++;
    }

    const counts = {};
    keyLocations.forEach(loc => {
        if (!counts[loc.key]) counts[loc.key] = [];
        counts[loc.key].push(loc.line);
    });

    console.log(`--- ${objectName} Audit ---`);
    Object.keys(counts).forEach(key => {
        if (counts[key].length > 1) {
            console.log(`Duplicate Key: "${key}" found at lines: ${counts[key].join(', ')}`);
        }
    });
}

findDuplicates('CROP_SPECS');
findDuplicates('METADATA');
