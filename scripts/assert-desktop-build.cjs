const fs = require('fs');
const path = require('path');

const requiredFiles = [
  path.join('dist', 'index.html'),
  path.join('electron', 'main.cjs')
];

const missing = requiredFiles.filter((filePath) => !fs.existsSync(path.resolve(filePath)));

if (missing.length > 0) {
  console.error('Desktop build check failed. Missing:');
  for (const filePath of missing) {
    console.error(`- ${filePath}`);
  }
  process.exit(1);
}

console.log('Desktop build check passed. Renderer and Electron entry are present.');
