import React, { Component } from 'react';
import './App.css';
import Game from './game';
import { reduce, validate } from '../src/shared/reducers'
import io from 'socket.io-client';
const _ = require('lodash');

const serverAddress = 'http://localhost:6060';

class App extends Component {
  constructor(props){
    super(props);
    this.socket = null;
    this.Game = null;

    this.state = {
      gameState: null,
      playerId: null,
      gameId: null,
    };
  }

  componentDidMount() {
    this.socket = io(serverAddress);

    this.socket.on('stateUpdate', (data) => {
      console.log('received stateUpdate event, ', data);
      // alert('received stateUpdate event');
      // this.setState({ gameState: data })
    });

    this.socket.on('gameReady', (data) => {
      const gameState = data.gameState;
      alert('gameReady with gameState ', gameState);
      this.setState({ gameState });
      const playerRole = _.get(_.findLast(gameState.players, (p) => p.playerId === this.playerId), 'playerRole');
      this.setState({ playerRole })
    });

    // want to update the player's view of world when this happens
    this.socket.on('playerDidAction', (data) => {
      console.log('in playerDidAction; updating game state to ', data.gameState);
      this.setState({ gameState: data.gameState });
    });

    this.socket.on('exception', (data) => {
      alert('exception, ', data.errorMessage);
    })
  }

  handleNameInput(e) {
    this.setState({gameId: e.target.value});
  }

  handleJoin(e) {
    this.socket.emit('create_user_join_game', { gameId: this.state.gameId }, function ackFn(error, message) {
      if (error) {
        console.log('handleJoin callback has error', error);
        alert('exception, ', error);
      }
      const { playerId, gameState, gameId } = message;
      this.setState({ gameState });
      this.setState({ gameId });
      this.setState({ playerId });
      this.setState({ loaded: true });
    }.bind(this));
  }

  history = (type) => {
    if (type === 'view') {
      this.socket.emit('viewGameHistory', function ackFn(error, message) {
        console.log('error, ', error);
        console.log('game history, ', message);
      });
    } else if (type === 'clear') {
      this.socket.emit('clearGameHistory', function ackFn(error, message) {
        console.log('error, ', error);
        console.log('game history (should be cleared), ', message);
      });
    }
  }

  doAction = ({playerId, type, data}) => {
    console.log('playerId in doAction is', playerId);
    const valid = validate(this.state.gameState, playerId, type, data);
    if (!valid) {
      window.alert('your action is not valid :P');
      return;
    }
    this.socket.emit('doAction', {gameState: this.state.gameState, playerId, type, data });
    this.setState({
      gameState: reduce(this.state.gameState, playerId, type, data)
    })
  }

  render() {
    return ( this.state.loaded ?
      <Game id={this.state.gameId} gameState={this.state.gameState} playerId={this.state.playerId} doAction={this.doAction} history={this.history}></Game>
      :
      <div className="join-container">
        <div>
          <input type="text" value={this.state.gameId} onChange={this.handleNameInput.bind(this)} className="join-input" placeholder="Enter unique id for game!"/>
        </div>
        <div>
          {/* add options here to stub out players / skip to section */}
          <button className="join-button" onClick={this.handleJoin.bind(this)}>Join Game</button>
        </div>
      </div>
    );
  }
}

export default App;
