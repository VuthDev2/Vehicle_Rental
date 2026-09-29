const http = require('http');
const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    console.log('Received POST headers:', req.headers);
    console.log('Received POST body:', body);
    res.writeHead(200);
    res.end(JSON.stringify({ status: { code: '00', message: 'Success' }}));
  });
});
server.listen(4000, () => console.log('Listening on 4000'));
