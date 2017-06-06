// const https = require('https');
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

const users = {};
socketServer.on('connection', socket => {
  socket.send('{"message":"CONNECTED TO SERVER"}');

  socket.on('message', message => {
    console.log(message);
    let payload;
    try {
      payload = JSON.parse(message);
    } catch (e) {
      socket.send('{"error": "failed to parse payload"}');
      return;
    }

    console.log('BOUT TO SWITCH DA BITCH');
    switch (payload.action) {
      case 'REGISTER':
        console.log('registering');
        if (users[payload.username] === undefined) {
          users[payload.username] = socket;
          console.log('USERS: ', Object.keys(users));
          const responsePayload = {
            action: 'REGISTER',
            message: 'registered successfully',
            username: payload.username,
            users: Object.keys(users)
          }
          socket.send(JSON.stringify(responsePayload));
        }
      break;
      case 'MESSAGE':
        console.log('messaging');
        const responsePayload = {
          action: 'MESSAGE',
          userFrom: payload.userFrom,
          message: payload.message
        };
        users[payload.userTo].send(JSON.stringify(responsePayload));
      break;
    }
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => console.log('listening on port: ' + port));

module.exports = server;
