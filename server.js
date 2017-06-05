const https = require('https');
const http = require('http');

const server = http.createServer((req, res) => {
  res.write('Attempting to reach: ' + req.url);
  res.end();
});


const port = process.env.PORT || 8080;
server.listen(port);

module.exports = server;
