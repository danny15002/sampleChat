window.onload = () => {
  const socket  = new WebSocket(location.origin.replace('http', 'ws'));
  socket.onmessage = socketListener;

  window.socket = socket;
  window.app = document.getElementById('app');
  window.app2 = document.getElementById('app-2');
  window.messageText = document.getElementById('message-text');
  window.messageWall = document.getElementById('message-wall');

  const registerButton = document.getElementById('register-button');
  registerButton.onclick = register;
}

function register(event) {
  console.info('ATTEMPTING TO REGISTER');
  const username = document.getElementById('register-input').value;
  const registrationData = {
    name: socketInfo.name,
    username: username,
    action: 'REGISTER'
  }
  socket.send(JSON.stringify(registrationData));
}

function socketListener(message) {
  const payload = JSON.parse(message.data);
  console.log('Time to send: ', (new Date()) - (new Date(payload.timeSent)));
  console.log('RECEIVED SOCKET MESSAGE', message);
  switch (payload.action) {
    case 'CONNECTED':
      window.socketInfo = {};
      socketInfo.name = payload.name;
      break;
    case 'REGISTER':
      window.username = payload.username;
      loadApp(payload.users);
      break;
    case 'MESSAGE':
      processMessage(payload);
      break;
  }
}

function loadApp(users) {
  app.style.display = 'none';
  app2.style.display = 'block';
  window.sendMessageButton = document.getElementById('send-message');

  sendMessageButton.onclick = sendMessage;
  const userList = document.getElementById('user-list');

  users.forEach(user => {
    const li = document.createElement('li');
    li.innerText = user;
    li.onclick = setReceiver;
    userList.appendChild(li);
  });
}

function setReceiver(event) {
  console.log(event);
  window.userTo = event.target.innerText;
}

function sendMessage() {
  if (userTo === undefined) return;
  const payload = {
    name: socketInfo.name,
    action: 'SEND_MESSAGE',
    userFrom: window.username,
    userTo: window.userTo,
    message: window.messageText.value,
    timeSent: (new Date()).toISOString()
  }
  console.log('sending message', payload);
  socket.send(JSON.stringify(payload));
}

function processMessage(payload) {
  console.log('processing message');
  const div = document.createElement('div');
  div.classList.add('message-div');
  div.innerText = payload.userFrom + " says: " + payload.message;
  messageWall.appendChild(div);
}
