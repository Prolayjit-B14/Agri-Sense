const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

console.log(`Auditing ${allFiles.length} files for syntax integrity...\n`);

let totalErrors = 0;

allFiles.forEach(file => {
  try {
    execSync(`node -c "${file}"`, { stdio: 'ignore' });
  } catch (err) {
    console.log(`❌ Syntax Error in [${path.relative(srcDir, file)}]`);
    totalErrors++;
  }
});

if (totalErrors === 0) {
  console.log('✅ ALL FILES VERIFIED: 100% Syntax Purity.');
} else {
  console.log(`⚠️ FAILED: ${totalErrors} files with syntax errors found.`);
}
