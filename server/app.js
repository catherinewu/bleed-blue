import { reduce } from '../shared/reducers';

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
const gameHistory = [];
let targetNumberPlayers;
let currentNumberPlayers = 0;

class Session {
  constructor(name) {
      this._name = name;
  }
  getName() {
    return this._name;
  }
}

let gameState = 'lalala';

// emit the gameState object to all sockets at a rate of 1 times per second.
setInterval(() => {
  io.sockets.emit('stateUpdate', gameState);
}, 1000 / 1);

// New user joins
app.post('/create_user', (req, res) => {
  currentNumberPlayers++;
  console.log('currentNumberPlayers', currentNumberPlayers);
  console.log('targetNumberPlayers', targetNumberPlayers);
  if (targetNumberPlayers && currentNumberPlayers > targetNumberPlayers) {
    console.log('Sorry, target number of players reached');
    res.json({ success: false })
  }
  console.log('in create_user route');
  const sessionKey = generateId(24);
  console.log('session key is', sessionKey, ' and name is, ', req.body.name);
  sessions[sessionKey] = new Session(req.body.name);
  res.json({success: true, sessionKey});
});

app.get('/view_history', (req, res) => {
  console.log('in view_history route');
  console.log(gameHistory);
  res.send({ history: gameHistory});
})

app.post('/clear_history', (req, res) => {
  sessions = {};
  gameHistory = [];
  res.send({ success: true });
  // emit some socket event
  // let currentNumberPlayers = 0;
})

function generateId(len) {
  let result = "";
  for(let i = 0; i < len; i ++) {
     result += Math.floor(Math.random() * 10);
  }
  return result;
}

// When a connection was created.
io.on('connection', function (socket) {
  console.log('a user connected:', socket.id);

  socket.on('newGame', function (data) {
    console.log('init newGame')
    gameState = data.gameState;
    targetNumberPlayers = data.targetNumberPlayers;
    gameHistory.push({ gameState: data.gameState });
  })

  socket.on('doAction', function (data) {
    console.log('socket heard doAction');
    const session = sessions[data.sessionKey];
    gameState = reduce(data.gameState, data.actorUid, data.type, data.data); // update game state
    gameHistory.push({ gameState: data.gameState, actorUid: data.actorUid, type: data.type, data: data.data, session });
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
    // todo: figure out how to handle disconnect
    // delete gameState.players[socket.id];
  });
});