import React, { Component } from 'react';
import './App.css';
import Game from './game';
import { generateInitialState, reduce, validate } from '../src/shared/reducers'
import io from 'socket.io-client';

const serverAddress = 'http://localhost:6060';

class App extends Component {
  constructor(props){
    super(props);
    this.socket = null;
    this.Game = null;

    this.state = {
      gameState: generateInitialState(),
      gameId: null,
    };
  }

  componentDidMount() {
    this.socket = io(serverAddress);
    this.Game = new Game({ gameState: this.state.gameState });

    this.socket.on('stateUpdate', (data) => {
      console.log('received stateUpdate event, ', data);
      this.gameState = data;
    });

    this.socket.on('gameReady', (data) => {
      console.log('received gameReady event, ', data);
    });

    this.socket.on('playerDidAction', (data) => {
      console.log('received playerDidAction event, ', data);
    })
  }

  handleNameInput(e) {
    this.setState({gameId: e.target.value});
  }

  handleJoin(e) {
    this.socket.emit('create_user_join_game', { gameId: this.state.gameId });
    this.setState({loaded: true});
  }

  history = (type) => {
    if (type === 'view') {
      fetch(serverAddress + '/view_history', {
        method: 'get',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => console.log('view history response: ', response.body));
    } else if (type === 'clear') {
      fetch(serverAddress + '/clear_history', {
        method: 'post',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => console.log('view history response: ', response.body));
    }
  }

  doAction = ({actorUid, type, data}) => {
    console.log('actorUid in doAction is', actorUid);
    const valid = validate(this.state.gameState, actorUid, type, data);
    if (!valid) {
      window.alert('your action is not valid :P');
      return;
    }
    this.socket.emit('doAction', {gameState: this.state.gameState, actorUid, type, data, sessionKey: window.localStorage.getItem('sessionKey')});
    this.setState({
      gameState: reduce(this.state.gameState, actorUid, type, data),
    })
  }

  render() {
    return ( this.state.loaded ?
      <Game id={this.state.gameId} gameState={this.state.gameState} playerId={0} doAction={this.doAction} history={this.history}></Game>
      :
      <div className="join-container">
        <div>
          <input type="text" value={this.state.gameId} onChange={this.handleNameInput.bind(this)} className="join-input" placeholder="Enter unique id for game!"/>
        </div>
        <div>
          <button className="join-button" onClick={this.handleJoin.bind(this)}>Join/Create Game</button>
          {/* <button className="join-button" onClick={this.handleNewGame.bind(this)}>New Game</button> */}
        </div>
      </div>
    );
  }
}

export default App;
