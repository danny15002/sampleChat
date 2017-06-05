const https = require('https');
const http = require('http');

const server = http.createServer((req, res) => {
  res.write('Attempting to reach' + req.url());
  res.end();
});

server.listen(9000);

modules.export = server;
