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
    let objectContent = '';

    while (braceCount > 0 && index < content.length) {
        if (content[index] === '{') braceCount++;
        if (content[index] === '}') braceCount--;
        objectContent += content[index];
        index++;
    }

    const keys = [];
    // More robust key extraction for top-level only
    let currentPos = 0;
    let nested = 0;
    while (currentPos < objectContent.length) {
        if (objectContent[currentPos] === '{') nested++;
        if (objectContent[currentPos] === '}') nested--;
        
        if (nested === 0) {
            const slice = objectContent.substring(currentPos);
            const keyMatch = /^\s*['"]?([^'":\s]+)['"]?\s*:/.exec(slice);
            if (keyMatch) {
                keys.push(keyMatch[1]);
                currentPos += keyMatch[0].length;
                continue;
            }
        }
        currentPos++;
    }

    const counts = {};
    keys.forEach(k => counts[k] = (counts[k] || 0) + 1);
    const duplicates = Object.keys(counts).filter(k => counts[k] > 1);

    console.log(`Duplicates in ${objectName}:`, duplicates);
    if (duplicates.length > 0) {
        duplicates.forEach(d => {
            console.log(`- ${d}: ${counts[d]} occurrences`);
        });
    }
}

findDuplicates('CROP_SPECS');
findDuplicates('METADATA');
