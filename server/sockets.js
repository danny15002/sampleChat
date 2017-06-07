const actions = require('./actions.js');
module.exports = setupSocket;
const connections = {};
// NOTE: having two objects is a waste of memory, find a better way
const users = {};

/**
 * @name setupSocket
 * @description initializes listeners on new socket
 * @param {Socket} socket - a ws socket object
 * @param {Socket} req - raw socket object ?
 */
function setupSocket(socket, req) {
  const name = req.connection.remoteAddress + ':' + req.connection.remotePort;
  const response = {
    action: 'CONNECTED',
    message: 'CONNECTED TO SERVER',
    name: name
  };
  connections[name] = socket;
  socket.send(JSON.stringify(response));
  socket.on('message', messageParser);
  socket.on('close', () => console.log('socket closed'));
}

/**
 * @name messageParser
 * @description parses the incoming message from a socket which is expected to
 *  to be a parsable JSON string with attributes: action, payload
 * @param {String} message - a parsable JSON string
 * @this WSSocket
 */
function messageParser(message) {
  console.log('MESSAGE', message);

  try {
    const payload = JSON.parse(message);
    socketRouter(payload);
  } catch (e) {
    console.log(e);
    // NOTE: bad error handling since only way to identify socket is to have
    //  correctly formatted payload
    const response = { error: 'could not parse payload', message: e.message };
    this.send(JSON.stringify(response));
  }
}

/**
 * @name socketRouter
 * @description routes the payload to the correct function based on desired
 *  action
 * @param {Object} payload - an object with attributes: action, payload
 */
function socketRouter(payload) {
  const socket = connections[payload.name];
  if (!socket) throw new Error('no socket name(id) provided');

  switch (payload.action) {
    case actions.REGISTER:
      handleRegister(payload);
      break;
    case actions.SEND_MESSAGE:
      handleSendMessage(payload);
      break;
    default:
      handleUnrecognizedAction(payload.action);
  }
}

/**
 * @name handleRegister
 * @description handles logic for receiving a socket message with an
 *  unrecognized/undefined action
 * @param {Object} payload - an object with attributes: action, payload
 */
function handleRegister(payload) {
  validateUsername(payload.username);
  const socket = connections[payload.name];
  socket.username = payload.username;
  users[socket.username] = socket;

  const response = {
    action: 'REGISTER',
    message: 'registered successfully',
    username: socket.username,
    users: Object.keys(users)
  };

  socket.send(JSON.stringify(response));
}

/**
 * @name validateUsername
 * @description validates a username to make sure it is not taken
 * @param {String} username - username chosen by user
 */
function validateUsername(username) {
  if (!username) throw new Error('Invalid or no username');
  // figure out how to handle same user from multiple machines
}

/**
 * @name handleSendMessage
 * @description handles sending a message
 * @param {Object} payload - an object with attributes: action, payload
 */
function handleSendMessage(payload) {
  const socket = connections[payload.name];
  const responsePayload = {
    action: 'MESSAGE',
    userFrom: socket.username,
    message: payload.message
  };

  socket.send(JSON.stringify(responsePayload));
}

/**
 * @name handleUnrecognizedAction
 * @description handles logic for receiving a socket message with an
 *  unrecognized/undefined action
 * @param {String} action - the desired unrecognized action
 */
function handleUnrecognizedAction(action) {

}
