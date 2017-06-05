const https = require('https');
const http = require('http');
const ws = require('ws');
const fs = require('fs');
const indexCache = fs.readFileSync('./app/index.html', 'utf-8');

const server = http.createServer((request, response) => {
  console.log('serving request');
  response.writeHead(200, {
    'Content-Length': indexCache.length,
    'Content-Type': 'text/html' });
  response.write(indexCache);
  response.end();
});

const socketServer = new ws.Server({
  server: server
});

socketServer.on('connection', socket => {
  socket.send('CONNECTED TO SERVER');
  socket.on('message', message => {
    console.log('message');
    socket.send('Echoing message: ' + message);
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => console.log('listening on port: ' + port));

module.exports = server;
