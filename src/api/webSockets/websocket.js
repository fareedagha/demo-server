const socketIO = require('socket.io');

let io;
let socketConnection;
function initializeWebSocket(server) {
  io = socketIO(server, {
    cors: {
      origins: ['http://localhost:4200', 'https://demo-angular-app-ea8e6e3cc9a8.herokuapp.com']
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected');
    socketConnection = socket;
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}

function getIo() {
  if (!io) {
     throw new Error('Socket.io not initialized');
  }
  return io;
}


module.exports = { initializeWebSocket, getIo };
