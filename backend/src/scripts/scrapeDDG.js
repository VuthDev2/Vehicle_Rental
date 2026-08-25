const https = require('https');
const fs = require('fs');

async function fetchHTML(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'html.duckduckgo.com',
      path: '/html/?q=' + encodeURIComponent(query),
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const html = await fetchHTML('Honda Scoopy white background');
  // DDG HTML doesn't typically show images directly, it might be tough.
  // Let's just output if we got HTML.
  console.log("HTML length:", html.length);
}
run();
