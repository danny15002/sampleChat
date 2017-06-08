// const https = require('https');
const http = require('http');
const ws = require('ws');
const fs = require('fs');
const indexCache = fs.readFileSync('./app/index.html', 'utf-8');

const server = http.createServer((request, response) => {
  const url = request.url;
  console.log('URL Requested: ', url);

  if (url === '/') {
    response.writeHead(200, {
      'Content-Length': indexCache.length,
      'Content-Type': 'text/html' });
    response.write(indexCache);
    response.end();
  } else if (url === '/css/master.css' || url === '/javascript/index.js') {
    fs.readFile('./app' + url, 'utf-8', (err, result) => {
      if (err) {
        response.writeHead(500);
      } else {
        response.writeHead(200, {
          'Content-Length': result.length,
          'Content-Type': request.headers.accept.split(',')[0]
        });
        response.write(result);
      }
      response.end();
    });
  } else {
    response.write('You requested' + url);
    response.end();
  }
});

const socketServer = new ws.Server({
  server: server
});

const setupSocket = require('./sockets.js');
socketServer.on('connection', setupSocket);

const port = process.env.PORT || 8080;
server.listen(port, () => console.log('listening on port: ' + port));

module.exports = server;
