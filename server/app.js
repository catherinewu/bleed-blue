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
    this._gameState = generateInitialState(targetNumberPlayers); // contains players (array of {playerId, socketId, role, chosen, hasChosen}), status
    this._gameHistory = [this._gameState];
    this._targetNumberPlayers =targetNumberPlayers
  }

  getGameId() {
    return this._gameId;
  }

  getTargetNumberPlayers() {
    return this._targetNumberPlayers;
  }

  getCurrentNumberPlayers() {
    return this._gameState.players.length;
  }

  getGameState() {
    return this._gameState;
  }

  updateGameState(gameState) {
    console.log('updateGameState~')
    this._gameHistory.push(gameState);
    this._gameState = gameState;
  }

  getGameHistory() {
    return this._gameHistory;
  }

  clearGameHistory() {
    this._gameState = generateInitialState(this._targetNumberPlayers);
    this._gameHistory = [this._gameState];
  }

  getPlayers() {
    return this._gameState.players;
  }

  getPlayerId(socketId) {
    const player = _.findLast(this.getPlayers(), (p) => p.socketId === socketId);
    return player.playerId;
  }

  addPlayer(socketId) {
    console.log(`adding player with socketId ${socketId} to game ${this._gameId}`);
    const playerId = this.getCurrentNumberPlayers() + 1;
    console.log('playerId', playerId, 'target number of players', this._targetNumberPlayers);
    if (playerId > this._targetNumberPlayers) {
      return -100;
    }
    const newPlayer = { playerId, socketId, playerRole: 'not decided' };
    let gameState = reduce(this.getGameState(), playerId, 'add_player', { newPlayer }); // update game state
    this.updateGameState(gameState);

    if (gameState.players.length === this._targetNumberPlayers) {
      gameState = reduce(this.getGameState(), {}, 'assign_roles', {}); // update game state
      this.updateGameState(gameState);
      this.emitEventToPlayers('gameReady', { gameState: filterGameState(gameState) });
    } else if (playerId < this._targetNumberPlayers) {
      this.emitEventToPlayers('notEnoughPlayers');
    }
    return playerId;
  }

  emitEventToPlayers(eventType, data, filter=null) {
    Promise.map(this.getPlayers(), (p) => {
      const socket = p.socketId;
      if (filter) {
        const cleanData = filter(data, p.playerId);
        io.to(`${socket}`).emit(eventType, cleanData);
      } else {
        io.to(`${socket}`).emit(eventType, data);
      }
    });
  }
}

// we want to make sure each player does not see another player's private info (ie role)
function filterGameState(gameState, playerId) {
  return gameState;
}

// emit the gameState object to all sockets at a rate of 1 times per second.
setInterval(() => {
  _.values(ALL_GAMES, (g) => {
    g.emitEventToPlayers('stateUpdate', g.getGameState(), filterGameState);
  });
}, 1000 / 1);

// When a connection was created.
io.on('connection', function (socket) {
  console.log('a user connected:', socket.id);

  socket.on('create_user_join_game', function (data, callback) {
    const gameId = data.gameId;
    const socketId = socket.id;
    if (!gameId) {
      const error = 'Must enter game id';
      socket.emit('exception', { errorMessage: error });
      callback(error, {});
    }
    let currentGame = _.get(ALL_GAMES, gameId);
    if (!currentGame) { // create new game
      currentGame = new Game(gameId, 3);
      ALL_GAMES[gameId] = currentGame;
    }
    const playerId = currentGame.addPlayer(socketId);

    if (playerId === -100) {
      const error = 'Sorry, target number of players reached';
      socket.emit('exception', { errorMessage: error });
      callback(error, {});
    }

    SOCKET_TO_GAME[socketId] = currentGame;
    callback(null, { playerId, gameState: currentGame.getGameState(), gameId: currentGame.getGameId() });
  });

  socket.on('doAction', function (data) {
    const socketId = socket.id;
    console.log('socket heard doAction ', data.type, ' from socketId, ', socket.id);
    // const session = sessions[socket.id];
    const currentGame = SOCKET_TO_GAME[socketId];
    const playerId = currentGame.getPlayerId(socketId);
    const gameState = reduce(currentGame.getGameState(), playerId, data.type, data.data); // update game state
    currentGame.updateGameState(gameState);

    const shouldBroadcast = _.includes(['pick_chancellor', 'play_vote'], data.type);
    if (shouldBroadcast) {
      currentGame.emitEventToPlayers('playerDidAction', { gameState: currentGame.getGameState(), playerId, type: data.type, data: data.data });
    }
  });

  socket.on('viewGameHistory', function(callback) {
    // todo: sanitize game history
    const currentGame = SOCKET_TO_GAME[socket.id];
    callback('no error', currentGame.getGameHistory());
  });

  socket.on('clearGameHistory', function(callback) {
    const currentGame = SOCKET_TO_GAME[socket.id];
    currentGame.clearGameHistory();
    callback('no error', currentGame.getGameHistory());
  })
  socket.on('disconnect', function() {
    console.log(`user with socket id ${socket.id} disconnected`);
  });
});