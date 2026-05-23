const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== '.expo') {
        walkDir(dirPath);
      }
    } else {
      if (f === 'login.tsx' || f.includes('login')) {
        console.log(dirPath);
      }
    }
  });
}

walkDir('.');
