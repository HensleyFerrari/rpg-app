const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const setters = [];

walkDir('app/dashboard/battles', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      // match setSomething(...)
      const match = line.match(/\bset[A-Z]\w*\(/);
      if (match) {
        setters.push(`${filePath}:${index + 1}: ${line.trim()}`);
      }
    });
  }
});

fs.writeFileSync('setters.txt', setters.join('\n'));
