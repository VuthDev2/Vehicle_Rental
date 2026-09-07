const fs = require('fs');
const path = require('path');

const scriptsDir = path.join(__dirname, 'src', 'scripts');

fs.readdirSync(scriptsDir).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(scriptsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // regex to match pricing: { hour: A, day: B, week: C, month: D, year: 0 }
    // We want to calculate year as month * 10
    content = content.replace(/pricing:\s*{\s*hour:\s*(\d+),\s*day:\s*(\d+),\s*week:\s*(\d+),\s*month:\s*(\d+),\s*year:\s*(\d+)\s*}/g, (match, h, d, w, m, y) => {
      const year = parseInt(m) * 10;
      return `pricing: { hour: ${h}, day: ${d}, week: ${w}, month: ${m}, year: ${year} }`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Seed files updated.');
