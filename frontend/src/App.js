import React, { Component } from 'react';
import './App.css';
import Game from './game';
import { generateInitialState, reduce } from 'shared/reducers'
import io from 'socket.io-client';
// const gameState = {
//   day: 3,
//   players: [1, 2],
//   cardsPlayed: ['pass', 'pass'],
//   player: 1,
//   role: 'Hitler',
// }

const serverAddress = 'http://localhost:6060';

class App extends Component {
  constructor(props){
    super(props);
    this.socket = null;
    this.Game = null;

    this.state = {
      gameState: generateInitialState(),
    };
  }

  componentDidMount() {
    this.socket = io(serverAddress);
    this.Game = new Game({ gameState: this.state.gameState });

    // let server know about new game
    this.socket.emit('newGame', { gameState: this.state.gameState });

    this.socket.on('news', (data) => {
      console.log(data);
      this.socket.emit('my other event', { my: 'data', sessionKey: window.localStorage.getItem('sessionKey') });
    });

    this.socket.on('stateUpdate', (data) => {
      console.log('received stateUpdate event');
    })
  }

  handleNameInput(e) {
    this.setState({name: e.target.value});
  }

  handleJoin(e) {
    fetch(serverAddress + '/create_user', {
      body: JSON.stringify({
        name: this.state.name
      }),
      method: 'post',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(json => {
      if(json.success) {
        localStorage.sessionKey = json.sessionKey;
        this.setState({loaded: true});
      }
    });
  }

  doAction = ({type, data}) => {
    this.socket.emit('doAction', {type, data, sessionKey: window.localStorage.getItem('sessionKey')});
    this.setState({
      gameState: reduce(this.state.gameState, type, data),
    })
  }

  render() {
    return ( this.state.loaded ?
      <Game id={0} gameState={this.state.gameState} doAction={this.doAction}></Game>
      :
      <div className="join-container">
        <input type="text" value={this.state.name} onChange={this.handleNameInput.bind(this)} className="join-input" placeholder="Enter a name to use ..."/>
        <br/>
        <button className="join-button" onClick={this.handleJoin.bind(this)}>Join</button>
      </div>
    );
  }
}

export default App;
