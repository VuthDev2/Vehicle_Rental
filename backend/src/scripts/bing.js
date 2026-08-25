const https = require('https');
function searchBing(query) {
  return new Promise((resolve, reject) => {
    https.get(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}`, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const matches = data.match(/murl&quot;:&quot;(https:\/\/.*?)&quot;/g);
        if (matches && matches.length > 0) {
            resolve(matches.map(m => m.replace('murl&quot;:&quot;', '').replace('&quot;', '')));
        } else {
            resolve([]);
        }
      });
    }).on('error', reject);
  });
}
searchBing('BYD Seal white background').then(urls => console.log(urls.slice(0, 3)));
