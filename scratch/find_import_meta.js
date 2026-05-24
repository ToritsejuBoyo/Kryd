const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else {
      console.log(`Checking file: ${fullPath}`);
      if (file.endsWith('.js') || file.endsWith('.html')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('import.meta')) {
          console.log(`Found 'import.meta' in: ${fullPath}`);
          const idx = content.indexOf('import.meta');
          console.log('Context:', content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 100)));
        }
      }
    }
  }
}

searchDir(path.join(__dirname, '../dist'));
console.log('Done.');
