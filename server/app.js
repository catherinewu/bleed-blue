import { reduce, generateInitialState } from '../shared/reducers';
var Promise = require('bluebird');

const _ = require('lodash');
var express = require('express')
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const cors = require('cors');

server.listen(6060);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

let ALL_GAMES = {}; // gameId => Game; store all games
let SOCKET_TO_GAME = {}; // mapping from socketId to Game for convenience

// a game
class Game {
  constructor(gameId, targetNumberPlayers) {
    this._gameId = gameId;
    this._targetNumberPlayers = targetNumberPlayers;
    this._gameState = generateInitialState();
    this._gameHistory = [];
    this._players = [];
  }
  getGameId() {
    return this._gameId;
  }
  getTargetNumberPlayers() {
    return this._targetNumberPlayers;
  }
  getCurrentNumberPlayers() {
    return this._players.length;
  }
  getGameState() {
    return this._gameState;
  }
  updateGameState(gameState) {
    console.log('setGameState~')
    this._gameHistory.push(gameState);
    this._gameState = gameState;
  }
  getGameHistory() {
    return this._gameHistory;
  }
  getPlayers() {
    return this._players;
  }
  getPlayerId(socketId) {
    const player = _.findLast(this._players, (p) => p.getSocketId() === socketId);
    return player.getPlayerId();
  }
  addPlayer(socketId) {
    console.log(`adding player with socketId ${socketId} to game ${this._gameId}`);
    // if target number of players is reached, then start game~
    const playerNumber = this.getCurrentNumberPlayers() + 1;
    if (playerNumber > this._targetNumberPlayers) {
      throw new Error('Uh-oh! Too many players :( ');
    }

    const newPlayer = new Player(playerNumber, socketId)
    this._players.push(newPlayer);

    if (playerNumber === this._targetNumberPlayers) {
      this.emitEventToPlayers('gameReady');
    } else if (playerNumber < this._targetNumberPlayers) {
      this.emitEventToPlayers('notEnoughPlayers');
    }
  }
  emitEventToPlayers(eventType) {
    // io.sockets.socket(savedSocketId).emit(...)
    console.log(`trying to emit ${eventType} to all players in game ${this._gameId}`);
    Promise.map(this._players, (p) => {
      console.log(`trying to emit to player ${p}`);
      // io.sockets.socket(p).emit(eventType);
      io.to(p.getSocketId()).emit(eventType);
    })
  }
}

class Player {
  constructor(playerId, socketId) {
    this._playerId = playerId;
    this._socketId = socketId;
  }
  getPlayerId() {
    return this._playerId;
  }
  getSocketId() {
    return this._socketId;
  }
}
let gameState = 'lalala';

// emit the gameState object to all sockets at a rate of 1 times per second.
setInterval(() => {
  io.sockets.emit('stateUpdate', gameState);
}, 1000 / 1);

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

  socket.on('create_user_join_game', function (data) {
    const gameId = data.gameId;
    const socketId = socket.id;
    console.log('in create_user_join_game route; user socket id is ', socketId, 'with game id ', gameId);
    if (!gameId) {
      throw new Error('must enter gameId');
    }
    let currentGame = _.get(ALL_GAMES, gameId);
    if (!currentGame) { // create new game
      currentGame = new Game(gameId, 3);
      ALL_GAMES[gameId] = currentGame;
    }
    if (currentGame.targetNumberPlayers && currentGame.currentNumberPlayers > currentGame.targetNumberPlayers) {
      console.log('Sorry, target number of players reached');
      // res.json({ success: false })
      socket.emit('exception', {errorMessage: 'Sorry, target number of players reached'});
    }
    currentGame.addPlayer(socketId);
    SOCKET_TO_GAME[socketId] = currentGame;
  });

  socket.on('doAction', function (data) { // fix variable names lol
    const socketId = socket.id;
    console.log('socket heard doAction from socketId, ', socket.id);
    // const session = sessions[socket.id];
    const game = SOCKET_TO_GAME[socketId];
    const actorUid = game.getPlayerId(socketId);
    console.log('game is', game);
    const gameState = reduce(game.getGameState(), actorUid, data.type, data.data); // update game state
    console.log('new gameState is', gameState);
    game.updateGameState(gameState);
    // gameHistory.push({ gameState: data.gameState, actorUid: data.actorUid, type: data.type, data: data.data, session });

    const shouldBroadcast = _.includes(['pick_chancellor', 'play_vote']);
    if (shouldBroadcast) {
      socket.emit('playerDidAction', { gameState: game.getGameState(), actorUid, type: data.type, data: data.data });
    }
  });

  socket.on('disconnect', function() {
    console.log(`user with socket id ${socket.id} disconnected`);
  });
});