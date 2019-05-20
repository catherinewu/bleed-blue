const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const cors = require('cors');

server.listen(6060);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const sessions = {};

class Session {
  constructor(name) {
      this._name = name;
  }
  getName() {
    return this._name;
  }
}

let gameState = 'lalala';

// rmiyd the gameState object to all sockets at a rate of 0.1 times per second.
setInterval(() => {
  io.sockets.emit('stateUpdate', gameState);
}, 1000 / 0.1);

app.post('/create_user', (req, res) => {
  const sessionKey = generateId(24);
  console.log('session key is', sessionKey, ' and name is, ', req.body.name);
  sessions[sessionKey] = new Session(req.body.name);
  res.json({success: true, sessionKey});
});

function generateId(len) {
  let result = "";
  for(let i = 0; i < len; i ++) {
     result += Math.floor(Math.random() * 10);
  }
  return result;
}

//When a connection was created.
io.on('connection', function (socket) {
  console.log('a user connected:', socket.id);
  socket.emit('news', { hello: 'world' });
  socket.on('newGame', function (data) {
    gameState = data.gameState;
  })
  socket.on('my other event', function (data) {
    console.log('socket heard my other event');
    const session = sessions[data.sessionKey];
    console.log('session', session);
    console.log('heard the event', data);
  });
  socket.on('doAction', function (data) {
    console.log('socket heard doAction');
    const session = sessions[data.sessionKey];
    console.log('session', session);
    console.log('heard the event', data);
  });
  socket.on('disconnect', function() {
    console.log('user disconnected');
    // todo: figure out how to handle disconnect
    // delete gameState.players[socket.id];
  });
});