const actions = {
  CONNECTED: 'CONNECTED',
  REGISTERED: 'REGISTERED',
  RECEIVED_MESSAGE: 'RECEIVED_MESSAGE'
};

window.onload = () => {
  const socket = new WebSocket(location.origin.replace('http', 'ws'));
  socket.onmessage = messageParser;

  window.socket = socket;
  window.app = document.getElementById('app');
  window.app2 = document.getElementById('app-2');
  window.messageText = document.getElementById('message-text');
  window.messageWall = document.getElementById('message-wall');

  const registerButton = document.getElementById('register-button');
  registerButton.onclick = register;
};

/**
 * @name messageParser
 * @description parses the incoming socket message which is expected to be a
 *  parsable JSON string
 * @param {String} message - parsable JSON string
 */
function messageParser(message) {
  console.log('Socket message: ', message);
  try {
    const payload = JSON.parse(message.data);
    socketRouter(payload);
  } catch (e) {
    console.error(e);
  }
}

/**
 * @name socketRouter
 * @description routes the payload to the correct function based on desired
 *  action
 * @param {Object} payload - an object with attributes: action, payload
 */
function socketRouter(payload) {
  console.log('Time to send: ', (new Date()) - (new Date(payload.timeSent)));

  switch (payload.action) {
    case actions.CONNECTED:
      window.socketInfo = {};
      socketInfo.name = payload.name;
      break;
    case actions.REGISTERED:
      window.username = payload.username;
      loadApp(payload.users);
      break;
    case actions.RECEIVED_MESSAGE:
      processMessage(payload);
      break;
  }
}

/**
 * @name loadApp
 * @description
 * @param {Array} users - a list of the current online users
 */
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

/**
 * @name register
 * @description sends a request via the socket to register the selected username
 *  with the server
 * @param {Event} event
 */
function register(event) {
  console.info('ATTEMPTING TO REGISTER');
  const username = document.getElementById('register-input').value;
  const registrationData = {
    name: socketInfo.name,
    username: username,
    action: 'REGISTER'
  };
  socket.send(JSON.stringify(registrationData));
}

function setReceiver(event) {
  console.log(event);
  if (window.currentUserTo) window.currentUserTo.classList.remove('active');
  window.currentUserTo = event.target;
  event.target.classList.add('active');

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
  };
  console.log('sending message', payload);
  socket.send(JSON.stringify(payload));
}

function processMessage(payload) {
  console.log('processing message');
  const div = document.createElement('div');
  div.classList.add('message-div');
  div.innerText = payload.userFrom + ' says: ' + payload.message;
  messageWall.appendChild(div);
}
