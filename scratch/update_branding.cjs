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

console.log(`Updating branding in ${allFiles.length} files...\n`);

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Update version comments and UI strings
  const updated = content
    .replace(/AgriSense v\d+\.\d+\.\d+/g, 'AgriSense Pro v17.1.0')
    .replace(/AgriSense Industrial • v\d+\.\d+\.\d+/g, 'AgriSense Pro • v17.1.0')
    .replace(/AgriSense Industrial/g, 'AgriSense Pro');

  if (content !== updated) {
    fs.writeFileSync(file, updated);
    console.log(`✅ Updated: [${path.relative(srcDir, file)}]`);
  }
});

console.log('\nBranding update complete.');
