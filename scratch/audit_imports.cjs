const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(srcDir).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));

console.log(`Auditing ${allFiles.length} files for import integrity...\n`);

let totalBroken = 0;

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const importRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const fullPath = path.resolve(path.dirname(file), importPath);
      const possibleExtensions = ['', '.js', '.jsx', '.json', '.css', '.svg', '.png', '.jpg', '/index.js', '/index.jsx'];
      let found = false;
      for (const ext of possibleExtensions) {
        if (fs.existsSync(fullPath + ext)) {
          found = true;
          break;
        }
      }
      if (!found) {
        console.log(`❌ Broken Import in [${path.relative(srcDir, file)}]: "${importPath}"`);
        totalBroken++;
      }
    }
  }
});

if (totalBroken === 0) {
  console.log('✅ ALL IMPORTS VERIFIED: 100% Connectivity.');
} else {
  console.log(`⚠️ FAILED: ${totalBroken} broken imports found.`);
}
