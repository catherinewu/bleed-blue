// import { generateInitialState } from '../shared/reducers';
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(6060);

// var socket = io('http://localhost:8080');
// let gameState = generateInitialState();

// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/index.html');
// });

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log('heard the event', data);
  });
  socket.on('doAction', function (data) {
    console.log('heard the event', data);
  });
});